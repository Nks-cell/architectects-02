import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ProjectCard } from "@/components/project-card";
import { Shell } from "@/components/shell";
import { listProjects, submitInquiry } from "@/lib/portfolio.functions";
import { CATEGORIES, errText, INTERESTS, type Project } from "@/lib/portfolio";

export const Route = createFileRoute("/")({
  loader: () => listProjects(),
  head: () => ({
    meta: [
      { title: "Horizon Architecture Studio" },
      {
        name: "description",
        content: "Houses, civic rooms, and towers by Horizon Architecture Studio. A fictional practice with a real set of drawings.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const projects = Route.useLoaderData();
  const featured = projects.filter((project) => project.featured).slice(0, 3);
  const shownFeatured = featured.length > 0 ? featured : projects.slice(0, 3);
  const places = new Set(projects.map((project) => project.location)).size;
  const ongoing = projects.filter((project) => project.status === "Ongoing").length;

  return (
    <Shell>
      <section className="hero-bleed">
        <img className="hero-photo" src="/plates/lumina.jpg" alt="Lumina Tower, a glass residence on a dusk quay." />
        <div className="veil" aria-hidden="true" />
        <div className="wrap hero-grid">
          <div className="hero-copy glass rise">
            <p className="eyebrow">Horizon Architecture Studio</p>
            <h1>
              Rooms that <em>hold</em> the weather.
            </h1>
            <p className="lede">
              We shape houses, civic halls, and towers that earn their place in the sky. Light first, then mass, then the long view.
            </p>
            <div className="actions">
              <a className="btn btn-primary" href="#work">
                View the work
              </a>
              <a className="btn btn-ghost" href="#contact">
                Start a conversation
              </a>
            </div>
          </div>
          <aside className="hero-aside glass rise d2">
            <dl>
              <div>
                <dt>On the boards</dt>
                <dd>{projects.length}</dd>
              </div>
              <div>
                <dt>Places</dt>
                <dd>{places}</dd>
              </div>
              <div>
                <dt>Still underway</dt>
                <dd>{ongoing}</dd>
              </div>
            </dl>
          </aside>
        </div>
      </section>

      <section className="section" id="work">
        <div className="wrap">
          <div className="section-head">
            <div>
              <p className="eyebrow">Selected</p>
              <h2>Work that keeps its shadow.</h2>
            </div>
            <p>Three projects currently pinned at the front of the studio. The full set sits just below.</p>
          </div>
          {shownFeatured.length === 0 ? (
            <div className="empty glass">The boards are clear. New work can be added from the studio desk.</div>
          ) : (
            <div className="feature-grid">
              {shownFeatured.map((project, index) => (
                <ProjectCard key={project.id} project={project} index={index} />
              ))}
            </div>
          )}
          <Gallery projects={projects} />
        </div>
      </section>

      <section className="section" id="practice">
        <div className="wrap">
          <div className="section-head">
            <div>
              <p className="eyebrow">Practice</p>
              <h2>A short philosophy.</h2>
            </div>
            <p>Horizon is a studio of buildings, not of slogans. Three rules survive every review.</p>
          </div>
          <div className="principles">
            <article className="principle glass">
              <span>01</span>
              <h3>Weather first</h3>
              <p>We draw the sun path before the plan. Overhangs, courts, and thick walls do the work machines should not have to.</p>
            </article>
            <article className="principle glass">
              <span>02</span>
              <h3>Material, left visible</h3>
              <p>Brick stays brick. Earth stays earth. Timber shows its grain. Finishes are for the hand, not for hiding the structure.</p>
            </article>
            <article className="principle glass">
              <span>03</span>
              <h3>A public edge</h3>
              <p>Even a private house owes the street a kindness: a colonnade, a bench, or a tree that was already there.</p>
            </article>
          </div>
          <blockquote className="quote glass">
            <p>A room is finished when the light knows where to sit.</p>
            <small>Studio note</small>
          </blockquote>
        </div>
      </section>

      <section className="section" id="contact">
        <div className="wrap contact-grid">
          <div className="contact-copy">
            <p className="eyebrow">Contact</p>
            <h2>Write the studio.</h2>
            <p className="lede">
              Tell us the place, the use, and what the site already knows. Notes land on the studio desk — no street address, no switchboard, just the drawing table.
            </p>
          </div>
          <ContactForm />
        </div>
      </section>
    </Shell>
  );
}

function Gallery({ projects }: { projects: Project[] }) {
  const [filter, setFilter] = useState<string>("All");
  const categories = ["All", ...CATEGORIES.filter((category) => projects.some((project) => project.category === category))];
  const visible = filter === "All" ? projects : projects.filter((project) => project.category === filter);

  return (
    <div className="gallery-block">
      <div className="section-head">
        <div>
          <p className="eyebrow">Gallery</p>
          <h2>Every sheet on the wall.</h2>
        </div>
        <p>Filter by typology. Each card opens the full drawing note.</p>
      </div>
      <div className="filters" role="toolbar" aria-label="Filter projects">
        {categories.map((category) => (
          <button key={category} type="button" aria-pressed={filter === category} onClick={() => setFilter(category)}>
            {category}
          </button>
        ))}
      </div>
      {visible.length === 0 ? (
        <div className="empty glass">Nothing in this typology yet.</div>
      ) : (
        <div className="gallery">
          {visible.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={projects.indexOf(project) >= 0 ? projects.indexOf(project) : index} />
          ))}
        </div>
      )}
    </div>
  );
}

function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [interest, setInterest] = useState<string>(INTERESTS[0]);
  const [message, setMessage] = useState("");
  const [botcheck, setBotcheck] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (name.trim().length < 2) return setError("Add your name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError("Enter a valid email.");
    if (message.trim().length < 10) return setError("A few more words will help the desk.");
    setBusy(true);
    try {
      await submitInquiry({ data: { name, email, interest, message, botcheck } });
      setSent(true);
    } catch (reason) {
      setError(errText(reason));
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <div className="form glass rise">
        <p className="eyebrow">Received</p>
        <h2 className="display sent-title">The note is on the desk.</h2>
        <p className="lede">It is saved with the other letters. Open the studio desk if you are reviewing the practice.</p>
      </div>
    );
  }

  return (
    <form className="form glass" onSubmit={onSubmit}>
      <div className="form-row">
        <label className="field">
          <span>Name</span>
          <input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" required maxLength={80} />
        </label>
        <label className="field">
          <span>Email</span>
          <input value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" inputMode="email" required maxLength={120} />
        </label>
      </div>
      <label className="field">
        <span>Interest</span>
        <select value={interest} onChange={(event) => setInterest(event.target.value)}>
          {INTERESTS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Note</span>
        <textarea value={message} onChange={(event) => setMessage(event.target.value)} required maxLength={2000} placeholder="The site, the use, and what should stay." />
      </label>
      <label className="hp" aria-hidden="true">
        Leave blank
        <input tabIndex={-1} autoComplete="off" value={botcheck} onChange={(event) => setBotcheck(event.target.value)} />
      </label>
      {error ? <p className="error">{error}</p> : null}
      <button className="btn btn-primary" type="submit" disabled={busy}>
        {busy ? "Sending…" : "Send to the desk"}
      </button>
    </form>
  );
}
