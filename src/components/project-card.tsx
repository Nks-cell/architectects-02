import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/lib/portfolio";

export function ProjectCard({ project, index }: { project: Project; index: number }) {
  const ongoing = project.status === "Ongoing";
  return (
    <Link
      to="/projects/$slug"
      params={{ slug: project.slug }}
      className="card"
      aria-label={`${project.title}, ${project.category} in ${project.location}`}
    >
      <div className="media">
        <img src={project.image_url} alt="" />
      </div>
      <span className="go" aria-hidden="true">
        <ArrowUpRight size={18} />
      </span>
      <div className="caption glass">
        <div className="caption-top">
          <span className={`chip ${ongoing ? "chip-amber" : ""}`}>{project.status}</span>
          <span className="index-no">{String(index + 1).padStart(2, "0")}</span>
        </div>
        <h3>{project.title}</h3>
        <p>{project.short_description}</p>
        <span className="meta">
          {project.category} · {project.location} · {project.year}
        </span>
      </div>
    </Link>
  );
}
