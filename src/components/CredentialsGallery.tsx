"use client";

import { useState } from "react";
import { ArrowUpRight, Award, Languages } from "lucide-react";
import { certifications, languages } from "@/data/portfolio";
import { BrandIcon } from "@/components/BrandIcon";

const greetings = ["مرحبا", "Hello", "Bonjour"] as const;
const codes = ["AR", "EN", "FR"] as const;

export function CredentialsGallery() {
  const [active, setActive] = useState(0);
  return <div className="credentials-gallery"><div className="credential-column"><div className="credential-heading"><Award size={25} aria-hidden="true" /><div><span className="eyebrow">LEARNING / VERIFIED</span><h3>Certifications</h3></div></div><div className="credential-cards">{certifications.map((cert, index) => <a className="credential-card" href={cert.href} key={cert.title} target="_blank" rel="noopener noreferrer"><span className="credential-card-index">0{index + 1}</span><BrandIcon name={index < 3 ? "NVIDIA" : "IBM"} size={34} /><span className="credential-card-copy"><strong>{cert.title}</strong><small>{cert.issuer}</small><span>{cert.date}</span></span><ArrowUpRight size={19} aria-hidden="true" /></a>)}</div></div><div className="language-column"><div className="credential-heading"><Languages size={25} aria-hidden="true" /><div><span className="eyebrow">HOW WE CONNECT</span><h3>Languages</h3></div></div><div className="language-stage" aria-live="polite"><span>SELECT A LANGUAGE</span><strong key={active}>{greetings[active]}</strong><small>{languages[active].name} · {languages[active].level}</small></div><div className="language-choices" role="group" aria-label="Select a language">{languages.map((language, index) => <button type="button" className={active === index ? "is-active" : ""} aria-pressed={active === index} onClick={() => setActive(index)} key={language.name}><span>{codes[index]}</span><strong>{language.name}</strong><small>{language.level}</small></button>)}</div></div></div>;
}
