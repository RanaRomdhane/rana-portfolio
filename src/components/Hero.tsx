"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { FaDownload, FaGithub, FaLinkedin, FaLocationDot, FaPlay, FaRobot } from "react-icons/fa6";
import { data } from "@/lib/data";
import { useGame } from "./GameProvider";

const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false });
const Voxel = dynamic(() => import("./Voxel"), { ssr: false });

const { profile } = data;

const POWER_UPS = [
  { id: "acc", big: "96.81%", text: "accuracy reading 14 compound emotions with a fine-tuned vision-language model" },
  { id: "paper", big: "1st author", text: "of a paper at the COC 2026 international conference" },
  { id: "xp", big: "3 quests", text: "completed as an AI and data intern across Tunisia" },
  { id: "cert", big: "4 badges", text: "earned from NVIDIA, IBM and Cisco" },
];

function useTyped(words: string[]) {
  const [text, setText] = useState(words[0]);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let word = 0;
    let len = words[0].length;
    let dir = -1;
    let timer: number;
    const tick = () => {
      const current = words[word];
      len += dir;
      setText(current.slice(0, len));
      let wait = dir > 0 ? 60 : 28;
      if (dir > 0 && len === current.length) {
        dir = -1;
        wait = 1900;
      } else if (dir < 0 && len === 0) {
        dir = 1;
        word = (word + 1) % words.length;
        wait = 250;
      }
      timer = window.setTimeout(tick, wait);
    };
    timer = window.setTimeout(tick, 2200);
    return () => window.clearTimeout(timer);
  }, [words]);
  return text;
}

function MysteryBlock({ item, onOpen, opened }: { item: (typeof POWER_UPS)[number]; onOpen: () => void; opened: boolean }) {
  const [bump, setBump] = useState(0);
  return (
    <button
      type="button"
      key={bump}
      className={`mystery ${opened ? "opened" : ""} ${bump ? "bump" : ""}`}
      aria-label={opened ? `Opened: ${item.big} ${item.text}` : "Mystery block, hit to reveal a fact"}
      onClick={() => {
        setBump((b) => b + 1);
        onOpen();
      }}
    >
      {opened ? "★" : "?"}
      {bump > 0 && <span aria-hidden className="coin-pop" />}
    </button>
  );
}

export function Hero() {
  const { theme, award, play } = useGame();
  const role = useTyped(profile.roles);
  const [opened, setOpened] = useState<string[]>([]);
  const [shown, setShown] = useState<string | null>(null);
  const current = POWER_UPS.find((p) => p.id === shown);

  const hit = (id: string) => {
    setShown(id);
    if (!opened.includes(id)) {
      setOpened((o) => [...o, id]);
      if (!award(`block:${id}`, 5)) play("bump");
      else play("coin");
      if (opened.length + 1 === POWER_UPS.length) award("blocks:all", 30, "Block breaker!", "All mystery blocks opened · +30 coins");
    } else {
      play("bump");
    }
  };

  return (
    <section
      id="home"
      aria-label="Introduction"
      className="relative flex min-h-[100svh] items-center overflow-hidden px-5 pb-32 pt-32"
      style={{
        background:
          theme === "dark"
            ? "radial-gradient(ellipse at 70% 40%, #4a1f7a 0%, #1b0d2e 62%)"
            : "linear-gradient(180deg, #bfe6ff 0%, #ffd9ea 55%, #fff1f7 100%)",
      }}
    >
      <HeroScene theme={theme} />

      {theme === "light" && (
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-24 h-40 overflow-hidden opacity-80">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="absolute h-6 w-24 bg-white shadow-[24px_-12px_0_0_#fff,48px_0_0_0_#fff]"
              style={{ top: 12 + i * 44, animation: `cloud ${46 + i * 14}s linear ${-i * 17}s infinite` }}
            />
          ))}
        </div>
      )}

      <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-16 lg:grid-cols-[1.1fr_0.9fr]">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <p className="hud-text mb-5 inline-flex items-center gap-3 border-[3px] border-line bg-card px-3 py-2 shadow-[4px_4px_0_var(--shade)]">
            <span className="h-2.5 w-2.5 animate-pulse bg-teal" aria-hidden />
            Player 1 ready
          </p>
          <h1 className="font-display text-[clamp(2.8rem,8vw,5.4rem)] font-bold leading-[0.95]">
            Rana <span className="text-teal">Romdhane</span>
          </h1>
          <p className="caret mt-4 min-h-[2.2em] font-display text-2xl font-semibold text-gold sm:text-3xl" aria-label={profile.roles.join(", ")}>
            <span aria-hidden>{role}</span>
          </p>
          <p className="mt-5 max-w-xl text-xl leading-relaxed text-muted">{profile.tagline}</p>
          <p className="mt-3 flex items-center gap-2 text-muted">
            <FaLocationDot aria-hidden className="text-coral" /> {profile.location}
          </p>

          <div className="mt-9 flex flex-wrap gap-4">
            <a href="#about" className="btn btn-gold" onClick={() => play("open")}>
              <FaPlay aria-hidden /> Start the quest
            </a>
            <a href="#assistant" className="btn btn-teal" onClick={() => play("click")}>
              <FaRobot aria-hidden /> Talk to my AI twin
            </a>
            <a
              href={profile.resume}
              download
              className="btn"
              onClick={() => award("resume", 20, "Loot collected!", "CV downloaded · +20 coins")}
            >
              <FaDownload aria-hidden /> Download CV
            </a>
          </div>

          <div className="mt-5 flex gap-3">
            <a href={profile.github} target="_blank" rel="noopener noreferrer" className="btn btn-icon" aria-label="GitHub profile">
              <FaGithub aria-hidden />
            </a>
            <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="btn btn-icon" aria-label="LinkedIn profile">
              <FaLinkedin aria-hidden />
            </a>
          </div>
        </motion.div>

        <motion.div
          className="mx-auto w-full max-w-sm"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <div className="relative mx-auto grid place-items-center">
            <Voxel
              model="crown"
              size={330}
              className="max-w-full"
              onPoke={() => {
                play("bump");
                award("poke:crown", 15, "Royal treasure!", "You found the crown · +15 coins");
              }}
            />
            <p className="hud-text mt-1 text-center text-muted">Drag to spin · Click to burst</p>
          </div>

          <div className="mt-6">
            <div className="flex justify-center gap-4">
              {POWER_UPS.map((p) => (
                <MysteryBlock key={p.id} item={p} opened={opened.includes(p.id)} onOpen={() => hit(p.id)} />
              ))}
            </div>
            <p aria-live="polite" className="mx-auto mt-4 min-h-[4.2em] max-w-xs text-center text-[0.95rem]">
              {current ? (
                <>
                  <b className="font-display text-xl text-gold">{current.big}</b>
                  <br />
                  <span className="text-muted">{current.text}</span>
                </>
              ) : (
                <span className="hud-text text-muted">▲ Hit a block to reveal a fact</span>
              )}
            </p>
          </div>
        </motion.div>
      </div>

      <a href="#about" aria-label="Scroll to About" className="hud-text absolute bottom-16 left-1/2 hidden -translate-x-1/2 text-muted lg:block" style={{ animation: "bob 1.6s ease-in-out infinite" }}>
        ▼ Scroll
      </a>
    </section>
  );
}
