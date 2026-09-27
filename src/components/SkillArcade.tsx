"use client";

import { useState } from "react";
import { ArrowUpRight, Boxes, BrainCircuit, CodeXml, Database, Layers3, Rocket } from "lucide-react";
import { skillGroups } from "@/data/portfolio";
import { BrandIcon } from "@/components/BrandIcon";

const icons = [CodeXml, BrainCircuit, Layers3, Boxes, Rocket, Database] as const;

export function SkillArcade() {
  const [active, setActive] = useState(0);
  const group = skillGroups[active];
  const Icon = icons[active];
  return <div className="skill-arcade">
    <div className="skill-arcade-menu" role="group" aria-label="Explore skill groups">
      <span className="skill-arcade-label">SELECT A TOOLKIT <span>↘</span></span>
      {skillGroups.map((item, index) => {
        const GroupIcon = icons[index];
        return <button key={item.title} type="button" className={`skill-tab ${active === index ? "is-active" : ""}`} aria-pressed={active === index} onClick={() => setActive(index)}><GroupIcon size={22} strokeWidth={1.7} aria-hidden="true" /><span>{item.title}</span><small>{String(item.items.length).padStart(2, "0")}</small></button>;
      })}
    </div>
    <div className="skill-arcade-board" key={group.title} aria-live="polite"><div className="skill-board-heading"><span className="skill-board-icon"><Icon size={30} strokeWidth={1.5} aria-hidden="true" /></span><div><span className="eyebrow">TOOLKIT 0{active + 1} / 06</span><h3>{group.title}</h3></div><ArrowUpRight size={24} strokeWidth={1.4} aria-hidden="true" /></div>
      <div className="skill-tile-grid">{group.items.map((item, index) => <div className="skill-tile" key={item} style={{ animationDelay: `${Math.min(index, 12) * 35}ms` }}><BrandIcon name={item} size={34} /><span>{item}</span></div>)}</div>
      <div className="skill-board-foot"><span>CLICK ANOTHER CATEGORY TO EXPLORE</span><span>✦ RANA&apos;S TOOLKIT</span></div>
    </div>
  </div>;
}
