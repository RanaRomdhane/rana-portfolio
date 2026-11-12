"use client";

import { motion } from "motion/react";
import { useGame } from "./GameProvider";

export function Reveal({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay, ease: [0.2, 0.8, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}

interface SectionProps {
  id: string;
  level: number;
  kicker: string;
  title: string;
  intro?: string;
  tiled?: boolean;
  children: React.ReactNode;
}

export function Section({ id, level, kicker, title, intro, tiled, children }: SectionProps) {
  const { award } = useGame();
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={`relative px-4 py-20 sm:py-28 ${tiled ? "tiles border-y-[3px] border-line" : ""}`}>
      <div className="mx-auto max-w-6xl">
        <motion.header
          className="mb-10 sm:mb-14"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.45 }}
          onViewportEnter={() => award(`visit:${id}`, 10, `Level ${level} discovered`, `${title} · +10 coins`)}
        >
          <p className="hud-text mb-4 inline-flex items-center gap-3 border-[3px] border-line bg-card px-3 py-2 text-teal shadow-[4px_4px_0_var(--shade)]">
            <span className="text-gold">LEVEL {String(level).padStart(2, "0")}</span>
            <span aria-hidden className="h-2 w-2 bg-coral" />
            {kicker}
          </p>
          <h2 id={`${id}-title`} className="font-display text-4xl font-bold leading-tight sm:text-5xl">
            {title}
          </h2>
          {intro && <p className="mt-3 max-w-2xl text-lg text-muted">{intro}</p>}
        </motion.header>
        {children}
      </div>
    </section>
  );
}
