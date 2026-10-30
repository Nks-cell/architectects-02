import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ProjectCard } from "@/components/project-card";
import { Shell } from "@/components/shell";
import { getProject, listProjects } from "@/lib/portfolio.functions";

export const Route = createFileRoute("/projects/$slug")({
  loader: async ({ params }) => {
    const [project, projects] = await Promise.all([
      getProject({ data: { slug: params.slug } }),
      listProjects(),
    ]);
    if (!project) throw notFound();
    return { project, projects };
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData ? `${loaderData.project.title} — Horizon` : "Work — Horizon",
      },
      {
        name: "description",
        content: loaderData?.project.short_description ?? "A project by Horizon Architecture Studio.",
      },
    ],
  }),
  component: ProjectPage,
  notFoundComponent: () => (
    <Shell>
      <section className="wrap missing">
        <p className="eyebrow">Not on the wall</p>
        <h1>This work is not on the boards.</h1>
        <Link className="btn btn-primary" to="/" hash="work">
          Browse the gallery
        </Link>
      </section>
    </Shell>
  ),
});

function ProjectPage() {
  const { project, projects } = Route.useLoaderData();
  const index = projects.findIndex((item) => item.id === project.id);
  const next = projects[(index + 1) % projects.length];
  const ongoing = project.status === "Ongoing";

  return (
    <Shell>
      <article className="detail">
        <div className="wrap">
          <div className="back-row">
            <Link className="btn btn-ghost" to="/" hash="work">
              All work
            </Link>
            {next && next.id !== project.id ? (
              <Link className="btn btn-ghost" to="/projects/$slug" params={{ slug: next.slug }}>
                Next: {next.title}
              </Link>
            ) : null}
          </div>
          <div className="detail-hero">
            <img src={project.image_url} alt={`${project.title} in ${project.location}`} />
            <div className="detail-sheet glass">
              <p className="eyebrow">{project.category}</p>
              <h1>{project.title}</h1>
              <p className="lede">{project.short_description}</p>
              <dl className="facts">
                <div>
                  <dt>Place</dt>
                  <dd>{project.location}</dd>
                </div>
                <div>
                  <dt>Year</dt>
                  <dd className="num">{project.year}</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd>
                    <span className={`chip ${ongoing ? "chip-amber" : ""}`}>{project.status}</span>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
          <p className="essay">{project.description}</p>
          {next && next.id !== project.id ? (
            <div className="related">
              <p className="eyebrow">Continue</p>
              <div className="feature-grid">
                <ProjectCard project={next} index={projects.findIndex((item) => item.id === next.id)} />
              </div>
            </div>
          ) : null}
        </div>
      </article>
    </Shell>
  );
}
