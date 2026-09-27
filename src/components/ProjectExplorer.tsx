"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, ExternalLink, Search, X } from "lucide-react";
import { projects, type Project, type ProjectDomain } from "@/data/portfolio";
import { BrandIcon } from "@/components/BrandIcon";

const domains = ["All", "ML", "NLP", "CV", "Web"] as const;

function ProjectVisual({ project }: { project: Project }) {
  return (
    <div className={`project-visual visual-${project.art}`} aria-hidden="true">
      <div className="visual-grid" />
      <div className="visual-orbit orbit-one" /><div className="visual-orbit orbit-two" />
      <div className="visual-symbol">
        {project.art === "emotion" && <><span className="face-eye">◕</span><span className="face-eye">◕</span><span className="face-mouth">⌣</span></>}
        {project.art === "transport" && <><span className="route-node"/><span className="route-line"/><span className="route-node"/><span className="route-line"/><span className="route-node"/></>}
        {project.art === "security" && <span className="shield-icon">✦</span>}
        {project.art === "tawa" && <span className="tawa-icon">✳</span>}
        {project.art === "tasks" && <><span>✓</span><span>✓</span><span>✓</span></>}
      </div>
      <span className="visual-label">{project.art === "emotion" ? "VISION / LANGUAGE" : project.art === "transport" ? "OPERATIONAL AI" : project.art === "security" ? "THREAT SIGNAL" : project.art === "tawa" ? "MOBILE EXPERIENCE" : "NLP / PRODUCTIVITY"}</span>
      <span className="visual-mission">MISSION {project.number}</span>
      <span className="visual-coordinate">RR—{project.number} / 2026</span>
    </div>
  );
}

export function ProjectExplorer() {
  const [domain, setDomain] = useState<(typeof domains)[number]>("All");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Project | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (selected) dialogRef.current?.showModal();
    else dialogRef.current?.close();
  }, [selected]);

  const filtered = projects.filter((project) => {
    const matchesDomain = domain === "All" || project.domains.includes(domain as ProjectDomain);
    const text = [project.title, project.eyebrow, project.description, ...project.tags].join(" ").toLowerCase();
    return matchesDomain && text.includes(query.trim().toLowerCase());
  });

  return (
    <>
      <div className="project-controls">
        <div className="filter-list" role="group" aria-label="Filter projects by domain">
          {domains.map((item) => <button key={item} type="button" className={domain === item ? "filter-button active" : "filter-button"} aria-pressed={domain === item} onClick={() => setDomain(item)}>{item === "All" ? "All projects" : item}</button>)}
        </div>
        <label className="search-box"><Search size={18} aria-hidden="true" /><span className="sr-only">Search projects</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search projects..." type="search" /></label>
      </div>
      <p className="results-count" aria-live="polite">SHOWING {filtered.length.toString().padStart(2, "0")} / {projects.length.toString().padStart(2, "0")} PROJECTS</p>
      <div className="project-grid">
        {filtered.map((project, index) => (
          <article className={`project-card ${index === 0 ? "featured-project" : ""}`} key={project.id}>
            <ProjectVisual project={project} />
            <div className="project-card-body">
              <div className="project-topline"><span>{project.eyebrow}</span><span>{project.number} / 05</span></div>
              <h3>{project.title}</h3>
              <p>{project.description}</p>
              <div className="project-tags">{project.tags.slice(0, 4).map((tag) => <span key={tag}><BrandIcon name={tag} size={18} />{tag}</span>)}</div>
              <div className="project-card-impact"><strong>{project.metrics[0]?.value}</strong><span>{project.metrics[0]?.label}</span></div>
              <button className="text-link" type="button" onClick={() => setSelected(project)}>Explore case study <ArrowRight size={16} aria-hidden="true" /></button>
            </div>
          </article>
        ))}
      </div>
      {filtered.length === 0 && <div className="empty-projects"><span>⌕</span><h3>No matching missions</h3><p>Try another search or domain filter.</p><button type="button" className="text-link" onClick={() => { setQuery(""); setDomain("All"); }}>Clear filters <ArrowRight size={16} /></button></div>}
      <dialog ref={dialogRef} className="project-dialog" onClose={() => setSelected(null)} onClick={(event) => { if (event.target === dialogRef.current) setSelected(null); }} aria-labelledby="project-dialog-title">
        {selected && <div className="dialog-inner">
          <button className="dialog-close icon-button" type="button" onClick={() => setSelected(null)} aria-label="Close project details"><X size={20} /></button>
          <ProjectVisual project={selected} />
          <div className="dialog-content"><span className="eyebrow">PROJECT FILE / {selected.number}</span><h2 id="project-dialog-title">{selected.title}</h2><p className="dialog-intro">{selected.description}</p>
            <div className="dialog-metrics">{selected.metrics.map((metric) => <div key={metric.label}><strong>{metric.value}</strong><span>{metric.label}</span></div>)}</div>
            <h3>Inside the project</h3><ul>{selected.details.map((detail) => <li key={detail}>{detail}</li>)}</ul>
            <div className="dialog-tags">{selected.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
            <div className="dialog-links">{selected.links.map((link) => <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className="button button-primary">{link.label} <ExternalLink size={16} aria-hidden="true" /></a>)}{selected.links.length === 0 && <p>Project details are drawn from Rana’s résumé; a public repository is not available for this work.</p>}</div>
          </div>
        </div>}
      </dialog>
    </>
  );
}
