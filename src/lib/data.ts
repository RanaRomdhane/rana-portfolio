import raw from "@/data/portfolio.json";

export type Accent = "teal" | "gold" | "coral" | "denim";
export type Domain = "ML" | "NLP" | "CV" | "Web" | "Data";

export interface LinkItem {
  label: string;
  url: string;
  kind?: string;
}

export interface Project {
  id: string;
  title: string;
  short: string;
  badge: string;
  domains: Domain[];
  icon: string;
  color: Accent;
  image: string;
  metric: { value: string; label: string };
  description: string;
  highlights: string[];
  stack: string[];
  links: LinkItem[];
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  location: string;
  period: string;
  logo: string;
  color: Accent;
  headline: string;
  reward: string;
  bullets: string[];
  stack: string[];
}

export interface Stat {
  value: number;
  decimals: number;
  prefix?: string;
  suffix?: string;
  label: string;
  source: string;
}

export const data = raw as unknown as {
  profile: {
    name: string;
    title: string;
    location: string;
    email: string;
    linkedin: string;
    github: string;
    resume: string;
    photo: string;
    talkingVideo: string;
    idleVideo: string;
    roles: string[];
    tagline: string;
    summary: string;
    stats: Stat[];
    languages: { name: string; level: string; pips: number }[];
  };
  experience: Experience[];
  projects: Project[];
  publications: {
    id: string;
    type: string;
    title: string;
    venue: string;
    role: string;
    date: string;
    summary: string;
    links: LinkItem[];
  }[];
  education: {
    id: string;
    school: string;
    location: string;
    degree: string;
    note: string;
    period: string;
    logo: string;
  }[];
  certifications: {
    id: string;
    issuer: string;
    title: string;
    date: string;
    url: string;
    icon: string;
  }[];
  skills: { category: string; icon: string; items: string[] }[];
};

export const DOMAIN_LABELS: Record<Domain, string> = {
  ML: "Machine Learning",
  NLP: "NLP & LLMs",
  CV: "Computer Vision",
  Web: "Web & Mobile",
  Data: "Data & Security",
};

export const SECTIONS = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "publications", label: "Publications" },
  { id: "education", label: "Education" },
  { id: "skills", label: "Skills" },
  { id: "assistant", label: "Ask AI" },
  { id: "contact", label: "Contact" },
] as const;

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://rana-portfolio-wheat.vercel.app"
).replace(/\/$/, "");

/** Everything the AI assistant is allowed to know, built from the same JSON as the site. */
export function buildKnowledge(): string {
  const { profile, experience, projects, publications, education, certifications, skills } = data;
  const lines: string[] = [];
  lines.push(`NAME: ${profile.name}`, `ROLE: ${profile.title}`, `BASED IN: ${profile.location}`);
  lines.push(`EMAIL: ${profile.email}`, `LINKEDIN: ${profile.linkedin}`, `GITHUB: ${profile.github}`);
  lines.push(`SUMMARY: ${profile.summary}`);
  lines.push(`SPOKEN LANGUAGES: ${profile.languages.map((l) => `${l.name} (${l.level})`).join(", ")}`);
  lines.push("", "EXPERIENCE:");
  for (const e of experience) {
    lines.push(`- ${e.role} at ${e.company}, ${e.location} (${e.period})`);
    for (const b of e.bullets) lines.push(`  * ${b}`);
  }
  lines.push("", "PROJECTS:");
  for (const p of projects) {
    lines.push(`- ${p.title} [${p.badge}]: ${p.description}`);
    for (const h of p.highlights) lines.push(`  * ${h}`);
    lines.push(`  Tech: ${p.stack.join(", ")}`);
    for (const l of p.links) lines.push(`  ${l.label}: ${l.url}`);
  }
  lines.push("", "PUBLICATIONS:");
  for (const p of publications) {
    lines.push(`- "${p.title}" (${p.type}, ${p.role}), ${p.venue}, ${p.date}. ${p.summary}`);
  }
  lines.push("", "EDUCATION:");
  for (const e of education) lines.push(`- ${e.degree} (${e.note}), ${e.school}, ${e.location}, ${e.period}`);
  lines.push("", "CERTIFICATIONS:");
  for (const c of certifications) lines.push(`- ${c.title}, ${c.issuer} (${c.date})`);
  lines.push("", "SKILLS:");
  for (const s of skills) lines.push(`- ${s.category}: ${s.items.join(", ")}`);
  return lines.join("\n");
}
