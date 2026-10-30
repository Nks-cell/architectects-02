import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Shell } from "@/components/shell";
import { listInquiries, listProjects, removeProject, saveProject } from "@/lib/portfolio.functions";
import {
  CATEGORIES,
  errText,
  formatWhen,
  PLATES,
  type Inquiry,
  type Project,
  type ProjectStatus,
} from "@/lib/portfolio";

const DESK_KEY = "horizon-desk";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Studio desk — Horizon" },
      { name: "description", content: "Add, edit, and retire projects, and read letters sent to Horizon Architecture Studio." },
    ],
  }),
  component: AdminPage,
});

type Draft = {
  id?: number;
  title: string;
  category: string;
  location: string;
  year: string;
  description: string;
  short_description: string;
  status: ProjectStatus;
  image_url: string;
  featured: boolean;
};

function emptyDraft(): Draft {
  return {
    title: "",
    category: "Residential",
    location: "",
    year: String(new Date().getFullYear()),
    description: "",
    short_description: "",
    status: "Ongoing",
    image_url: PLATES[0]?.url ?? "/plates/lumina.jpg",
    featured: false,
  };
}

function fromProject(project: Project): Draft {
  return {
    id: project.id,
    title: project.title,
    category: project.category,
    location: project.location,
    year: String(project.year),
    description: project.description,
    short_description: project.short_description,
    status: project.status,
    image_url: project.image_url,
    featured: project.featured,
  };
}

function AdminPage() {
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [letters, setLetters] = useState<Inquiry[] | null>(null);
  const [tab, setTab] = useState<"projects" | "letters">("projects");
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function loadProjects() {
    const rows = await listProjects();
    setProjects(rows);
  }

  useEffect(() => {
    let live = true;
    listProjects()
      .then((rows) => {
        if (live) setProjects(rows);
      })
      .catch((reason: unknown) => {
        if (live) setError(errText(reason));
      });
    const saved = sessionStorage.getItem(DESK_KEY);
    if (saved) {
      setPassword(saved);
      listInquiries({ data: { password: saved } })
        .then((rows) => {
          if (!live) return;
          setLetters(rows);
          setUnlocked(true);
        })
        .catch(() => {
          sessionStorage.removeItem(DESK_KEY);
        });
    }
    return () => {
      live = false;
    };
  }, []);

  async function unlock(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const rows = await listInquiries({ data: { password } });
      sessionStorage.setItem(DESK_KEY, password);
      setLetters(rows);
      setUnlocked(true);
    } catch (reason) {
      setError(errText(reason));
    } finally {
      setBusy(false);
    }
  }

  function lock() {
    sessionStorage.removeItem(DESK_KEY);
    setUnlocked(false);
    setLetters(null);
    setPassword("");
  }

  function update<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  async function onSave(event: FormEvent) {
    event.preventDefault();
    setError("");
    setNotice("");
    const year = Number(draft.year);
    if (draft.title.trim().length < 2) return setError("Give the project a title.");
    if (draft.location.trim().length < 2) return setError("Add a place.");
    if (!Number.isInteger(year) || year < 1990 || year > 2100) return setError("Year should sit between 1990 and 2100.");
    if (draft.short_description.trim().length < 8) return setError("The short line needs a little more.");
    if (draft.description.trim().length < 12) return setError("The long note is too brief.");
    setBusy(true);
    try {
      await saveProject({
        data: {
          password,
          ...(draft.id ? { id: draft.id } : {}),
          title: draft.title,
          category: draft.category,
          location: draft.location,
          year,
          description: draft.description,
          short_description: draft.short_description,
          status: draft.status,
          image_url: draft.image_url,
          featured: draft.featured,
        },
      });
      await loadProjects();
      setNotice(draft.id ? "Saved on the boards." : "Added to the boards.");
      if (!draft.id) setDraft(emptyDraft());
    } catch (reason) {
      setError(errText(reason));
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(id: number) {
    setBusy(true);
    setError("");
    try {
      await removeProject({ data: { password, id } });
      if (draft.id === id) setDraft(emptyDraft());
      setConfirmId(null);
      await loadProjects();
      setNotice("Removed from the boards.");
    } catch (reason) {
      setError(errText(reason));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Shell>
      <section className="desk">
        <div className="wrap">
          {!unlocked ? (
            <form className="gate glass" onSubmit={unlock}>
              <p className="eyebrow">Studio desk</p>
              <h1>The key is on the sill.</h1>
              <p className="lede">Projects and letters stay behind this door. The temporary key is admin123.</p>
              <label className="field">
                <span>Key</span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                />
              </label>
              {error ? <p className="error">{error}</p> : null}
              <button className="btn btn-primary" type="submit" disabled={busy}>
                {busy ? "Checking…" : "Open the desk"}
              </button>
            </form>
          ) : (
            <>
              <div className="desk-head">
                <div>
                  <p className="eyebrow">Studio desk</p>
                  <h1>{tab === "projects" ? "The boards" : "Letters"}</h1>
                </div>
                <button className="btn btn-ghost" type="button" onClick={lock}>
                  Lock desk
                </button>
              </div>
              <div className="tabs" role="tablist">
                <button type="button" role="tab" aria-selected={tab === "projects"} onClick={() => setTab("projects")}>
                  Projects
                </button>
                <button type="button" role="tab" aria-selected={tab === "letters"} onClick={() => setTab("letters")}>
                  Letters{letters ? ` (${letters.length})` : ""}
                </button>
              </div>
              {error ? <p className="error">{error}</p> : null}
              {notice ? <p className="ok">{notice}</p> : null}
              {tab === "projects" ? (
                <div className="desk-grid">
                  <div className="stack">
                    {projects === null ? (
                      <>
                        <div className="skeleton" />
                        <div className="skeleton" />
                      </>
                    ) : projects.length === 0 ? (
                      <div className="empty glass">No projects yet. Draft the first one beside this note.</div>
                    ) : (
                      projects.map((project) => (
                        <article key={project.id} className="row-card glass">
                          <img src={project.image_url} alt="" />
                          <div>
                            <h3>{project.title}</h3>
                            <p>
                              {project.category} · {project.location} · {project.year}
                              {project.featured ? " · Featured" : ""}
                            </p>
                            <div className="row-actions">
                              <span className={`chip ${project.status === "Ongoing" ? "chip-amber" : ""}`}>{project.status}</span>
                              <button className="mini" type="button" onClick={() => { setDraft(fromProject(project)); setNotice(""); }}>
                                Edit
                              </button>
                              {confirmId === project.id ? (
                                <button className="mini mini-amber" type="button" disabled={busy} onClick={() => onDelete(project.id)}>
                                  Yes, remove
                                </button>
                              ) : (
                                <button className="mini" type="button" onClick={() => setConfirmId(project.id)}>
                                  Remove
                                </button>
                              )}
                            </div>
                          </div>
                        </article>
                      ))
                    )}
                  </div>
                  <form className="form glass" onSubmit={onSave}>
                    <div className="form-heading">
                      <h2>{draft.id ? "Edit project" : "New project"}</h2>
                      {draft.id ? (
                        <button
                          className="mini"
                          type="button"
                          onClick={() => {
                            setDraft(emptyDraft());
                            setNotice("");
                          }}
                        >
                          Clear
                        </button>
                      ) : null}
                    </div>
                    <label className="field">
                      <span>Title</span>
                      <input value={draft.title} onChange={(event) => update("title", event.target.value)} maxLength={120} required />
                    </label>
                    <div className="form-row">
                      <label className="field">
                        <span>Category</span>
                        <input
                          list="categories"
                          value={draft.category}
                          onChange={(event) => update("category", event.target.value)}
                          maxLength={60}
                          required
                        />
                        <datalist id="categories">
                          {CATEGORIES.map((category) => (
                            <option key={category} value={category} />
                          ))}
                        </datalist>
                      </label>
                      <label className="field">
                        <span>Status</span>
                        <select value={draft.status} onChange={(event) => update("status", event.target.value as ProjectStatus)}>
                          <option>Completed</option>
                          <option>Ongoing</option>
                        </select>
                      </label>
                    </div>
                    <div className="form-row">
                      <label className="field">
                        <span>Location</span>
                        <input value={draft.location} onChange={(event) => update("location", event.target.value)} maxLength={80} required />
                      </label>
                      <label className="field">
                        <span>Year</span>
                        <input
                          inputMode="numeric"
                          value={draft.year}
                          onChange={(event) => update("year", event.target.value)}
                          required
                        />
                      </label>
                    </div>
                    <label className="field">
                      <span>Short description</span>
                      <input
                        value={draft.short_description}
                        onChange={(event) => update("short_description", event.target.value)}
                        maxLength={220}
                        required
                      />
                    </label>
                    <label className="field">
                      <span>Description</span>
                      <textarea
                        value={draft.description}
                        onChange={(event) => update("description", event.target.value)}
                        maxLength={2000}
                        required
                      />
                    </label>
                    <div className="field">
                      <span className="field-label">Studio plates</span>
                      <div className="plates">
                        {PLATES.map((plate) => (
                          <button
                            key={plate.url}
                            type="button"
                            aria-pressed={draft.image_url === plate.url}
                            aria-label={plate.label}
                            onClick={() => update("image_url", plate.url)}
                          >
                            <img src={plate.url} alt="" />
                          </button>
                        ))}
                      </div>
                    </div>
                    <label className="field">
                      <span>Image URL</span>
                      <input
                        value={draft.image_url}
                        onChange={(event) => update("image_url", event.target.value)}
                        maxLength={500}
                        required
                      />
                    </label>
                    <label className="check">
                      <input
                        type="checkbox"
                        checked={draft.featured}
                        onChange={(event) => update("featured", event.target.checked)}
                      />
                      Feature on the front wall
                    </label>
                    <button className="btn btn-primary" type="submit" disabled={busy}>
                      {busy ? "Saving…" : draft.id ? "Save changes" : "Add project"}
                    </button>
                  </form>
                </div>
              ) : letters === null ? (
                <div className="skeleton" />
              ) : letters.length === 0 ? (
                <div className="empty glass">No letters yet. The form on the contact section lands here.</div>
              ) : (
                <div className="stack">
                  {letters.map((letter) => (
                    <article key={letter.id} className="letter glass">
                      <header>
                        <h3>{letter.name}</h3>
                        <time dateTime={letter.created_at}>{formatWhen(letter.created_at)}</time>
                      </header>
                      <p>
                        <a href={`mailto:${letter.email}`}>{letter.email}</a>
                        {letter.interest ? ` · ${letter.interest}` : ""}
                      </p>
                      <p>{letter.message}</p>
                    </article>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </Shell>
  );
}
