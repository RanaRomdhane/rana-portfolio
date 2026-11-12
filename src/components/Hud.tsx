"use client";

import { useEffect, useRef, useState } from "react";
import { FaBars, FaMoon, FaSun, FaVolumeHigh, FaVolumeXmark, FaXmark } from "react-icons/fa6";
import { SECTIONS } from "@/lib/data";
import { useGame } from "./GameProvider";

function useScrollState() {
  const [active, setActive] = useState<string>("home");
  const barRef = useRef<HTMLDivElement>(null);
  const spriteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
      if (spriteRef.current) spriteRef.current.style.left = `calc(${p} * (100% - 64px) + 8px)`;
      const line = window.innerHeight * 0.35;
      let current = "home";
      for (const s of SECTIONS) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= line) current = s.id;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return { active, barRef, spriteRef };
}

/* Original 10x12 pixel hero, coloured after Rana's portrait. */
const SPRITE = [
  "..KKKKKK..",
  ".KKKKKKKK.",
  ".KKSSSSKK.",
  ".KGEGGEGK.",
  ".KKSSSSKK.",
  ".KKKSSKKK.",
  "..KKKKKK..",
  ".BBKKKKBB.",
  ".BBBBBBBB.",
  ".BBBBBBBB.",
  "..BB..BB..",
  "..KK..KK..",
];
const SPRITE_COLORS: Record<string, string> = { K: "#1b1b26", S: "#f6c9a8", G: "#f5c451", E: "#3a2a22", B: "#5b7fc4" };

export function PixelRana({ size = 40 }: { size?: number }) {
  return (
    <svg aria-hidden viewBox="0 0 10 12" width={size} height={size * 1.2} shapeRendering="crispEdges">
      {SPRITE.flatMap((row, y) =>
        [...row].map((c, x) => (c === "." ? null : <rect key={`${x}-${y}`} x={x} y={y} width={1.02} height={1.02} fill={SPRITE_COLORS[c]} />)),
      )}
    </svg>
  );
}

export function Hud() {
  const { theme, toggleTheme, sound, toggleSound, coins, play } = useGame();
  const { active, barRef, spriteRef } = useScrollState();
  const [open, setOpen] = useState(false);
  const level = Math.max(1, SECTIONS.findIndex((s) => s.id === active) + 1);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b-[3px] border-line bg-bg/90 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4">
          <a href="#home" className="flex items-center gap-2" aria-label="Rana Romdhane, back to top" onClick={() => play("click")}>
            <span className="grid h-10 w-10 place-items-center border-[3px] border-[#171b33] bg-gold font-hud text-[0.7rem] text-[#171b33] shadow-[3px_3px_0_var(--shade)]">
              RR
            </span>
            <span className="hidden font-display text-xl font-bold sm:block">Rana.quest</span>
          </a>

          <nav aria-label="Main" className="mx-auto hidden xl:block">
            <ul className="flex items-center gap-1">
              {SECTIONS.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    aria-current={active === s.id ? "true" : undefined}
                    onClick={() => play("click")}
                    className={`block whitespace-nowrap border-b-4 px-2 py-1.5 font-display text-[1rem] font-semibold transition-colors ${
                      active === s.id ? "border-gold text-gold" : "border-transparent text-muted hover:text-ink"
                    }`}
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="ml-auto flex items-center gap-2 xl:ml-0">
            <span className="hud-text hidden items-center gap-2 whitespace-nowrap border-[3px] border-line bg-card px-2.5 py-2 md:flex" title="Your level rises as you explore">
              LV <b className="text-teal">{level}</b>/{SECTIONS.length}
            </span>
            <span className="hud-text flex items-center gap-2 border-[3px] border-line bg-card px-2.5 py-2" aria-label={`${coins} coins collected`} title="Coins you collected by exploring">
              <span aria-hidden className="inline-block h-3.5 w-3.5 rounded-full border-2 border-[#171b33] bg-gold" />
              <span key={coins} style={{ animation: "bump 0.3s ease-out" }} className="inline-block min-w-[2ch] text-gold">
                {coins}
              </span>
            </span>
            <button type="button" className="btn btn-icon" onClick={toggleSound} aria-pressed={sound} aria-label={sound ? "Turn sound effects off" : "Turn sound effects on"}>
              {sound ? <FaVolumeHigh aria-hidden /> : <FaVolumeXmark aria-hidden />}
            </button>
            <button
              type="button"
              className="btn btn-icon"
              onClick={() => {
                toggleTheme();
                play("open");
              }}
              aria-label={theme === "dark" ? "Switch to day mode" : "Switch to night mode"}
            >
              {theme === "dark" ? <FaSun aria-hidden /> : <FaMoon aria-hidden />}
            </button>
            <button type="button" className="btn btn-icon xl:hidden" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? "Close menu" : "Open menu"}>
              {open ? <FaXmark aria-hidden /> : <FaBars aria-hidden />}
            </button>
          </div>
        </div>

        {/* XP bar = how far you have travelled */}
        <div className="h-1.5 bg-bg2" aria-hidden>
          <div ref={barRef} className="h-full origin-left bg-gradient-to-r from-teal to-gold" style={{ transform: "scaleX(0)" }} />
        </div>

        {open && (
          <nav id="mobile-menu" aria-label="Mobile" className="tiles border-t-[3px] border-line xl:hidden">
            <ul className="mx-auto grid max-w-7xl grid-cols-2 gap-2 p-4 sm:grid-cols-3">
              {SECTIONS.map((s, i) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    onClick={() => {
                      setOpen(false);
                      play("click");
                    }}
                    className={`btn w-full justify-start ${active === s.id ? "btn-gold" : ""}`}
                  >
                    <span className="hud-text opacity-70">{i + 1}</span>
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </header>

      {/* Little hero walking along the bottom as you scroll */}
      <div aria-hidden className="pointer-events-none fixed inset-x-0 bottom-0 z-40 hidden h-11 sm:block">
        <div
          className="absolute inset-x-0 bottom-0 h-3 border-t-[3px] border-line"
          style={{ background: "repeating-linear-gradient(90deg, var(--teal) 0 16px, color-mix(in srgb, var(--teal) 65%, #000) 16px 32px)" }}
        />
        <div className="absolute bottom-3 right-2 h-7 w-1 bg-ink">
          <span className="absolute left-1 top-0 h-3 w-4 bg-coral" />
        </div>
        <div ref={spriteRef} className="absolute bottom-[11px]" style={{ left: 8 }}>
          <div style={{ animation: "walk 0.45s steps(2) infinite" }}>
            <PixelRana size={26} />
          </div>
        </div>
      </div>
    </>
  );
}
