"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { FaArrowUpRightFromSquare, FaCheck, FaGithub, FaMagnifyingGlass, FaScroll, FaXmark } from "react-icons/fa6";
import { data, DOMAIN_LABELS, type Domain, type Project } from "@/lib/data";
import { useGame } from "./GameProvider";
import { Section } from "./Section";
import { TechChip, TechIcon } from "./TechIcon";

const { projects } = data;
const FILTERS: ("All" | Domain)[] = ["All", "ML", "NLP", "CV", "Web", "Data"];

/** Cover art: your own image if one is set in the content file, otherwise generated pixel art. */
function Cover({ project, tall }: { project: Project; tall?: boolean }) {
  return (
    <div className={`tiles relative overflow-hidden border-b-[3px] border-line ${tall ? "h-48 sm:h-60" : "h-40"}`}>
      {project.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={project.image} alt={`${project.title} preview`} loading="lazy" className="h-full w-full object-cover" />
      ) : (
        <>
          <div aria-hidden className="absolute inset-0 opacity-25" style={{ background: "linear-gradient(135deg, var(--accent), transparent 70%)" }} />
          <div aria-hidden className="absolute inset-0 grid place-items-center">
            <span
              className="grid h-24 w-24 place-items-center border-4 border-[#171b33] text-[#171b33] transition-transform duration-300 group-hover:-translate-y-1.5 group-hover:rotate-3"
              style={{ background: "var(--accent)", boxShadow: "inset -7px -7px 0 rgba(0,0,0,.18), inset 7px 7px 0 rgba(255,255,255,.3), 6px 6px 0 var(--shade)" }}
            >
              <TechIcon name={project.icon} mono size={44} />
            </span>
          </div>
          <span aria-hidden className="absolute left-5 top-6 h-3 w-3" style={{ background: "var(--accent)" }} />
          <span aria-hidden className="absolute bottom-7 right-8 h-4 w-4 bg-gold" />
          <span aria-hidden className="absolute right-16 top-8 h-2 w-2 bg-coral" />
        </>
      )}
      <span className="chip absolute left-3 top-3 bg-card">{project.badge}</span>
    </div>
  );
}

function ProjectDialog({ project, onClose }: { project: Project | null; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (project && !d.open) d.showModal();
    if (!project && d.open) d.close();
  }, [project]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-labelledby="project-dialog-title"
      className={`m-auto w-[min(760px,calc(100vw-24px))] max-w-none bg-transparent p-0 text-ink backdrop:bg-black/70 ${project ? `accent-${project.color}` : ""}`}
    >
      {project && (
        <motion.div initial={{ opacity: 0, y: 30, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.25 }} className="pixel-card max-h-[88svh] overflow-y-auto" style={{ borderColor: "var(--accent)" }}>
          <div className="relative">
            <Cover project={project} tall />
            <button type="button" onClick={onClose} className="btn btn-icon absolute right-3 top-3" aria-label="Close project details">
              <FaXmark aria-hidden />
            </button>
          </div>
          <div className="p-5 sm:p-7">
            <p className="flex flex-wrap gap-2">
              {project.domains.map((d) => (
                <span key={d} className="chip" style={{ borderColor: "var(--accent)" }}>
                  {DOMAIN_LABELS[d]}
                </span>
              ))}
            </p>
            <h3 id="project-dialog-title" className="mt-3 font-display text-3xl font-bold leading-tight">
              {project.title}
            </h3>
            <p className="mt-2 text-lg text-muted">{project.description}</p>

            <div className="mt-5 inline-flex items-baseline gap-2 border-[3px] border-line bg-bg2 px-4 py-2">
              <span className="font-display text-3xl font-bold text-gold">{project.metric.value}</span>
              <span className="hud-text text-muted">{project.metric.label}</span>
            </div>

            <p className="hud-text mb-3 mt-6 text-muted">Objectives cleared</p>
            <ul className="space-y-2.5">
              {project.highlights.map((h) => (
                <li key={h} className="flex gap-3">
                  <FaCheck aria-hidden className="mt-1.5 shrink-0" style={{ color: "var(--accent)" }} />
                  <span>{h}</span>
                </li>
              ))}
            </ul>

            <p className="hud-text mb-3 mt-6 text-muted">Gear used</p>
            <div className="flex flex-wrap gap-2">
              {project.stack.map((s) => (
                <TechChip key={s} name={s} />
              ))}
            </div>

            {project.links.length > 0 && (
              <div className="mt-7 flex flex-wrap gap-3">
                {project.links.map((l, i) => (
                  <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" className={`btn ${i === 0 ? "btn-gold" : ""}`}>
                    {l.kind === "github" ? <FaGithub aria-hidden /> : <FaScroll aria-hidden />}
                    {l.label}
                    <FaArrowUpRightFromSquare aria-hidden className="text-sm" />
                  </a>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </dialog>
  );
}

export function Projects() {
  const { play, award } = useGame();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Project | null>(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter((p) => {
      if (filter !== "All" && !p.domains.includes(filter)) return false;
      if (!q) return true;
      return [p.title, p.short, p.description, p.badge, ...p.stack, ...p.highlights].join(" ").toLowerCase().includes(q);
    });
  }, [filter, query]);

  const reset = () => {
    setFilter("All");
    setQuery("");
  };

  return (
    <Section id="projects" level={4} kicker="World map" title="Projects" intro="Choose a world to explore. Filter by domain or search for a tool.">
      <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div role="group" aria-label="Filter projects by domain" className="flex flex-wrap gap-2.5">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={filter === f}
              onClick={() => {
                setFilter(f);
                play("click");
              }}
              className={`btn ${filter === f ? "btn-gold" : ""}`}
            >
              {f === "All" ? "All worlds" : DOMAIN_LABELS[f]}
            </button>
          ))}
        </div>
        <div className="relative w-full lg:w-72">
          <label htmlFor="project-search" className="sr-only">
            Search projects
          </label>
          <FaMagnifyingGlass aria-hidden className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            id="project-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search, e.g. PyTorch"
            className="h-12 w-full border-[3px] border-line bg-card pl-10 pr-3 shadow-[4px_4px_0_var(--shade)] placeholder:text-muted"
          />
        </div>
      </div>

      <p aria-live="polite" className="sr-only">
        {visible.length} {visible.length === 1 ? "project" : "projects"} shown
      </p>

      {visible.length === 0 ? (
        <div className="pixel-card p-10 text-center">
          <p className="font-display text-2xl font-bold">No world matches that search</p>
          <p className="mt-1 text-muted">Try another keyword, or see everything again.</p>
          <button type="button" className="btn btn-gold mt-5" onClick={reset}>
            Show all projects
          </button>
        </div>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {visible.map((p) => (
              <motion.li
                key={p.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.25 }}
                className={`accent-${p.color}`}
              >
                <button
                  type="button"
                  onClick={() => {
                    setSelected(p);
                    play("open");
                    award(`project:${p.id}`, 10, "World explored", `${p.title.split(":")[0]} · +10 coins`);
                  }}
                  aria-haspopup="dialog"
                  className="pixel-card lift group flex h-full w-full flex-col text-left"
                >
                  <Cover project={p} />
                  <span className="flex flex-1 flex-col p-4">
                    <span className="font-display text-[1.45rem] font-bold leading-tight">{p.title}</span>
                    <span className="mt-2 flex-1 text-[0.97rem] text-muted">{p.short}</span>
                    <span className="mt-4 flex flex-wrap items-center gap-2">
                      {p.stack.slice(0, 4).map((s) => (
                        <span key={s} title={s} className="grid h-9 w-9 place-items-center border-2 border-line bg-bg2">
                          <TechIcon name={s} size={18} />
                          <span className="sr-only">{s}</span>
                        </span>
                      ))}
                      <span className="ml-auto text-right">
                        <span className="block font-display text-xl font-bold leading-none" style={{ color: "var(--accent)" }}>
                          {p.metric.value}
                        </span>
                        <span className="hud-text text-muted">{p.metric.label}</span>
                      </span>
                    </span>
                    <span className="mt-4 border-t-[3px] border-line pt-3 font-display text-lg font-semibold text-gold">Enter world ▶</span>
                  </span>
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      <ProjectDialog project={selected} onClose={() => setSelected(null)} />
    </Section>
  );
}
