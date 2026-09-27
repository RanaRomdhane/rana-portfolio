"use client";

import { useState } from "react";
import { ArrowUpRight, BrainCircuit, Boxes, HeartHandshake } from "lucide-react";
import { aboutPaths, profile } from "@/data/portfolio";

const icons = [BrainCircuit, Boxes, HeartHandshake] as const;

export function AboutShowcase() {
  const [active, setActive] = useState(0);
  const selected = aboutPaths[active];
  const Icon = icons[active];
  return <div className="about-showcase">
    <div className="about-statement"><span className="about-statement-orbit" aria-hidden="true">✳</span><p className="about-lead">Researcher. Engineer. <em>Builder of useful AI.</em></p><p>I turn machine learning ideas into experiences people can understand and use—from vision-language research to production-ready products.</p><div className="about-actions"><a className="text-link" href="/Rana.Romdhane.Resume.pdf" download>Download résumé <ArrowUpRight size={17} aria-hidden="true" /></a><a className="text-link" href={profile.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn <ArrowUpRight size={17} aria-hidden="true" /></a></div><span className="about-statement-foot">BASED IN {profile.location.toUpperCase()} · BUILDING FOR THE WORLD</span></div>
    <div className="about-console"><div className="about-console-top"><span>EXPLORE THE THREE SIDES OF MY WORK</span><span>01 / 03</span></div><div className="about-paths" role="group" aria-label="Explore Rana's work">{aboutPaths.map((path, index) => { const PathIcon = icons[index]; return <button type="button" className={`about-path ${active === index ? "is-active" : ""}`} aria-pressed={active === index} onClick={() => setActive(index)} key={path.id}><PathIcon size={24} strokeWidth={1.6} aria-hidden="true" /><span>{path.label}</span><small>0{index + 1}</small></button>; })}</div><div className="about-reveal" key={selected.id} aria-live="polite"><div className="about-reveal-icon"><Icon size={42} strokeWidth={1.25} aria-hidden="true" /></div><div><span className="eyebrow">{selected.label} / IN PRACTICE</span><h3>{selected.title}</h3><p>{selected.description}</p></div><div className="about-reveal-bottom"><span><strong>{selected.metric}</strong><small>{selected.metricLabel}</small></span><a href={selected.href} aria-label={`Explore ${selected.label.toLowerCase()} work`}><ArrowUpRight size={22} aria-hidden="true" /></a></div></div></div>
  </div>;
}
