"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, Menu, Moon, Sun, X } from "lucide-react";

const links = [
  ["About", "#about"],
  ["Experience", "#experience"],
  ["Projects", "#projects"],
  ["Publications", "#publications"],
  ["Skills", "#skills"],
  ["Contact", "#contact"],
] as const;

export function SiteHeader({ home = false }: { home?: boolean }) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [menuOpen, setMenuOpen] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const saved = window.localStorage.getItem("rana-theme");
    const nextTheme = saved === "light" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    const frame = window.requestAnimationFrame(() => setTheme(nextTheme));
    const update = () => {
      const available = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(available > 0 ? Math.min(100, (window.scrollY / available) * 100) : 0);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => { window.cancelAnimationFrame(frame); window.removeEventListener("scroll", update); };
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem("rana-theme", nextTheme);
    setTheme(nextTheme);
  };

  return (
    <header className="site-header">
      <div className="scroll-progress" style={{ width: `${progress}%` }} aria-hidden="true" />
      <div className="header-inner page-shell">
        <Link className="brand" href="/" aria-label="Rana Romdhane, home" onClick={() => setMenuOpen(false)}>
          <span className="brand-mark" aria-hidden="true">R<span>✦</span></span>
          <span className="brand-copy">RANA<span className="brand-underscore">_</span>ROMDHANE<small>AI / ML ENGINEER</small></span>
        </Link>
        <nav className={menuOpen ? "primary-nav is-open" : "primary-nav"} aria-label="Primary navigation">
          {links.map(([label, href]) => (
            <Link key={label} href={`${home ? "" : "/"}${href}`} onClick={() => setMenuOpen(false)}>{label}</Link>
          ))}
          <Link className="nav-assistant" href={home ? "#ai-twin" : "/#ai-twin"} onClick={() => setMenuOpen(false)}>AI Twin <ArrowUpRight size={14} aria-hidden="true" /></Link>
        </nav>
        <div className="header-actions">
          <button className="icon-button theme-button" type="button" onClick={toggleTheme} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`} title="Toggle color theme">
            {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
          </button>
          <button className="icon-button menu-button" type="button" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-label={menuOpen ? "Close menu" : "Open menu"}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
    </header>
  );
}
