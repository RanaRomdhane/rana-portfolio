import Link from "next/link";
import { ArrowRight, ArrowUpRight, BookOpen, Download, FlaskConical, Github, GraduationCap, Linkedin, Mail, MapPin, Phone, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { ProjectExplorer } from "@/components/ProjectExplorer";
import { ContactForm } from "@/components/ContactForm";
import { ExperienceJourney } from "@/components/ExperienceJourney";
import { SkillArcade } from "@/components/SkillArcade";
import { AssistantExperience } from "@/components/AssistantExperience";
import { AboutShowcase } from "@/components/AboutShowcase";
import { CredentialsGallery } from "@/components/CredentialsGallery";
import { education, highlights, profile, publications } from "@/data/portfolio";

function SectionHeading({ id, index, kicker, title, description }: { id: string; index: string; kicker: string; title: string; description?: string }) {
  return <div className="section-heading"><div className="section-index"><span>{index}</span><span className="index-line" /><span>{kicker}</span></div><h2 id={id}>{title}</h2>{description && <p>{description}</p>}</div>;
}

export default function HomePage() {
  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <SiteHeader home />
    <main id="main">
      <section className="hero hero-reimagined page-shell" id="home" aria-labelledby="hero-title">
        <div className="hero-background" aria-hidden="true"><span className="hero-star star-one">✦</span><span className="hero-star star-two">✧</span><span className="hero-star star-three">✦</span><span className="floating-block block-one">?</span><span className="floating-block block-two">✳</span><span className="pixel-ground" /></div>
        <div className="hero-twin" id="ai-twin"><div className="hero-twin-label"><span>✦ LIVE PORTFOLIO GUIDE</span><span>ASK ME ANYTHING ↘</span></div><AssistantExperience embedded intro={<div className="hero-copy">
          <div className="status-pill"><span className="status-dot" /> AVAILABLE FOR NEW OPPORTUNITIES <span className="status-plus">✦</span></div>
          <p className="hero-overline">HELLO, WORLD. I&apos;M</p>
          <h1 id="hero-title">Rana<br /><em>Romdhane<span className="hero-period">.</span></em></h1>
          <p className="hero-subtitle">AI / ML ENGINEER <span>✦</span> RESEARCHER <span>✦</span> BUILDER</p>
          <p className="hero-description">I turn complex intelligence into <strong>human experiences.</strong> From vision-language research to real-world AI products, I build what comes next.</p>
          <div className="hero-ctas"><Link href="#projects" className="button button-primary">Explore my work <ArrowUpRight size={18} aria-hidden="true" /></Link></div>
          <div className="hero-bottom"><span><MapPin size={16} aria-hidden="true" /> {profile.location}</span><span className="hero-dash">/</span><a href="/Rana.Romdhane.Resume.pdf" download>Download CV <Download size={15} aria-hidden="true" /></a></div>
        </div>} /></div>
      </section>

      <div className="marquee" aria-hidden="true"><div>PYTHON <span>✳</span> MACHINE LEARNING <span>✳</span> COMPUTER VISION <span>✳</span> REACT <span>✳</span> GENERATIVE AI <span>✳</span> PYTHON <span>✳</span> MACHINE LEARNING <span>✳</span> COMPUTER VISION <span>✳</span> REACT <span>✳</span> GENERATIVE AI <span>✳</span></div></div>

      <section className="about-section about-refined section-pad page-shell" id="about" aria-labelledby="about-title"><SectionHeading id="about-title" index="01" kicker="ABOUT ME" title="Curiosity, coded into impact." /><AboutShowcase /></section>

      <section className="stats-band" aria-label="Career highlights"><div className="page-shell stats-grid">{highlights.map((item, index) => <div className="stat" key={item.label}><span className="stat-index">0{index + 1}</span><strong>{item.value}</strong><span>{item.label}</span></div>)}</div></section>

      <section className="section-pad page-shell" id="experience" aria-labelledby="experience-title"><SectionHeading id="experience-title" index="02" kicker="THE JOURNEY" title="Experience that moves things forward." description="Choose a chapter to see the work and its impact." /><ExperienceJourney /></section>

      <section className="projects-section section-pad" id="projects" aria-labelledby="projects-title"><div className="page-shell"><SectionHeading id="projects-title" index="03" kicker="SELECTED WORK" title="Proof of possibility." description="A collection of research, deployed intelligence, and products built to solve real problems." /><ProjectExplorer /></div></section>

      <section className="section-pad page-shell publication-section" id="publications" aria-labelledby="publications-title"><SectionHeading id="publications-title" index="04" kicker="THE LIBRARY" title="Ideas worth sharing." description="Open a research file or read the story behind a technical idea." /><div className="publication-grid">{publications.map((publication, index) => <article className={`publication-card publication-file publication-file-${index + 1}`} key={publication.title}><div className="publication-cover" aria-hidden="true"><span className="publication-cover-top">RANA / RESEARCH ARCHIVE <span>0{index + 1}</span></span><span className="publication-cover-mark">{index === 0 ? "◉" : "⌘"}</span><span className="publication-cover-lines" /><span className="publication-cover-foot">{index === 0 ? "VISION × LANGUAGE" : "NETWORK × KNOWLEDGE"}</span></div><div className="publication-file-copy"><div className="publication-top"><BookOpen size={24} strokeWidth={1.5} aria-hidden="true" /><span>FILE 0{index + 1} / 02</span></div><span className="eyebrow">{publication.type}</span><h3>{publication.title}</h3><p>{publication.description}</p><a className="text-link" href={publication.href} target="_blank" rel="noopener noreferrer">{publication.linkLabel} <ArrowUpRight size={17} aria-hidden="true" /></a></div></article>)}</div></section>

      <section className="education-section section-pad" id="education" aria-labelledby="education-title"><div className="page-shell foundation-shell"><div className="foundation-intro"><SectionHeading id="education-title" index="05" kicker="FOUNDATIONS" title="Built on curiosity." /><p>From physics and chemistry fundamentals to software engineering and AI research.</p></div><div className="foundation-route"><div className="foundation-track" aria-hidden="true"><span>2021</span><span>2026</span></div>{education.map((item, index) => <article className="foundation-card" key={item.school}><div className="foundation-card-visual"><span className="foundation-card-number">0{index + 1} / 02</span>{index === 0 ? <GraduationCap size={68} strokeWidth={1.1} aria-hidden="true" /> : <FlaskConical size={68} strokeWidth={1.1} aria-hidden="true" />}<span className="foundation-pixel" aria-hidden="true">✦</span></div><div className="foundation-card-copy"><span className="eyebrow">{index === 0 ? "ENGINEERING DEGREE" : "PREPARATORY STUDIES"}</span><h3>{item.qualification}</h3><p>{item.school}</p><div className="foundation-card-meta"><span><MapPin size={15} aria-hidden="true" />{item.location}</span><time>{item.period}</time></div></div></article>)}</div></div></section>

      <section className="section-pad page-shell skills-section" id="skills" aria-labelledby="skills-title"><SectionHeading id="skills-title" index="06" kicker="THE TOOLKIT" title="Many tools. One mindset." description="Choose a toolkit to see the languages, models, platforms, and systems behind the work." /><SkillArcade /><CredentialsGallery /></section>

      <section className="assistant-return" aria-labelledby="assistant-return-title"><div className="page-shell assistant-return-inner"><span className="assistant-return-orbit" aria-hidden="true"><Sparkles size={35} /></span><div><span className="eyebrow">ONE MORE QUESTION?</span><h2 id="assistant-return-title">The conversation starts above.</h2><p>Ask about the work, the research, or where I could help next.</p></div><a href="#ai-twin" className="button button-light"><Sparkles size={17} aria-hidden="true" /> Ask my AI twin <span aria-hidden="true">↑</span></a></div></section>
      <section className="contact-section section-pad page-shell" id="contact" aria-labelledby="contact-title"><div className="contact-copy"><SectionHeading id="contact-title" index="07" kicker="NEXT CHAPTER" title="Let’s make something matter." /><p>Have a challenge, collaboration, or interesting idea? I&apos;d love to hear about it.</p><div className="contact-links"><a href={`mailto:${profile.email}`}><Mail size={18} aria-hidden="true" /> {profile.email} <ArrowUpRight size={16} aria-hidden="true" /></a><a href={profile.phoneHref}><Phone size={18} aria-hidden="true" /> {profile.phone} <ArrowUpRight size={16} aria-hidden="true" /></a><a href={profile.linkedin} target="_blank" rel="noopener noreferrer"><Linkedin size={18} aria-hidden="true" /> LinkedIn <ArrowUpRight size={16} aria-hidden="true" /></a><a href={profile.github} target="_blank" rel="noopener noreferrer"><Github size={18} aria-hidden="true" /> GitHub <ArrowUpRight size={16} aria-hidden="true" /></a></div><div className="contact-location"><MapPin size={16} aria-hidden="true" /> BASED IN {profile.location.toUpperCase()} <span>↗</span> OPEN TO THE WORLD</div></div><ContactForm /></section>
    </main>
    <footer className="site-footer"><div className="page-shell footer-inner"><Link href="/" className="footer-brand">R<span>✦</span></Link><p>Designed &amp; built with curiosity.<br />© {new Date().getFullYear()} Rana Romdhane.</p><a href="#home">BACK TO TOP <ArrowRight size={15} aria-hidden="true" /></a></div></footer>
  </>;
}
