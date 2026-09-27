"use client";

import { useState } from "react";
import { ArrowUpRight, BusFront, ChartNoAxesCombined, ListTodo, MapPin } from "lucide-react";
import { experience } from "@/data/portfolio";
import { BrandIcon } from "@/components/BrandIcon";

const icons = [BusFront, ListTodo, ChartNoAxesCombined] as const;

export function ExperienceJourney() {
  const [active, setActive] = useState(0);
  const job = experience[active];
  const Icon = icons[active];

  return <div className="journey-layout">
    <div className="journey-selector" role="group" aria-label="Select an experience">
      {experience.map((item, index) => {
        const JobIcon = icons[index];
        return <button type="button" key={item.company} className={`journey-stop ${active === index ? "is-active" : ""}`} aria-pressed={active === index} onClick={() => setActive(index)}>
          <span className="journey-rail" aria-hidden="true"><span className="journey-node">{item.number}</span></span>
          <span className="journey-stop-copy"><span className="journey-stop-company">{item.company}</span><strong>{item.role}</strong><small>{item.period}</small></span>
          <JobIcon size={24} strokeWidth={1.7} aria-hidden="true" />
        </button>;
      })}
    </div>
    <article className="journey-feature" aria-live="polite" key={job.company}>
      <div className="journey-feature-art" aria-hidden="true"><span className="journey-art-grid" /><span className="journey-art-orbit" /><span className="journey-art-symbol"><Icon size={68} strokeWidth={1.15} /></span><span className="journey-art-label">MISSION {job.number} / 03</span></div>
      <div className="journey-feature-body"><div className="journey-feature-top"><span className="eyebrow">EXPERIENCE FILE / {job.number}</span><span className="journey-impact"><strong>{job.impact.value}</strong><small>{job.impact.label}</small></span></div>
        <h3>{job.role}</h3><div className="journey-place"><strong>{job.company}</strong><span>·</span><MapPin size={15} aria-hidden="true" /> {job.location}<span>·</span>{job.period}</div>
        <ul className="journey-achievements">{job.achievements.map((achievement, index) => <li key={achievement}><span>{String(index + 1).padStart(2, "0")}</span><p>{achievement}</p></li>)}</ul>
        <div className="journey-stack"><span>BUILT WITH</span><div>{job.tags.map((tag) => <span className="journey-stack-tag" key={tag}><BrandIcon name={tag} size={18} />{tag}</span>)}</div></div>
        <a className="journey-next" href="#projects">Explore related work <ArrowUpRight size={17} aria-hidden="true" /></a>
      </div>
    </article>
  </div>;
}
