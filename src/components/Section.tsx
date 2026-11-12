"use client";

import dynamic from "next/dynamic";
import { motion } from "motion/react";
import type { VoxelModel } from "./Voxel";
import { SECTIONS } from "@/lib/data";
import { useGame } from "./GameProvider";

const Voxel = dynamic(() => import("./Voxel"), { ssr: false });

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
  model?: VoxelModel;
  children: React.ReactNode;
}

export function Section({ id, level, kicker, title, intro, tiled, model, children }: SectionProps) {
  const { award, play } = useGame();
  const next = SECTIONS[SECTIONS.findIndex((s) => s.id === id) + 1];
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={`relative px-5 py-28 sm:py-40 ${tiled ? "tiles battlement border-y-[3px] border-line" : ""}`}>
      <div className="mx-auto max-w-6xl">
        <motion.header
          className="mb-14 flex items-center justify-between gap-8 sm:mb-20"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.45 }}
          onViewportEnter={() => award(`visit:${id}`, 10, `Level ${level} discovered`, `${title} · +10 coins`)}
        >
          <div className="min-w-0">
          <p className="hud-text mb-4 inline-flex items-center gap-3 border-[3px] border-line bg-card px-3 py-2 text-teal shadow-[4px_4px_0_var(--shade)]">
            <span className="text-gold">LEVEL {String(level).padStart(2, "0")}</span>
            <span aria-hidden className="h-2 w-2 bg-coral" />
            {kicker}
          </p>
          <h2 id={`${id}-title`} className="font-display text-4xl font-bold leading-tight sm:text-5xl">
            {title}
          </h2>
          {intro && <p className="mt-5 max-w-2xl text-xl leading-relaxed text-muted">{intro}</p>}
          </div>
          {model && (
            <Voxel
              model={model}
              size={210}
              className="hidden sm:block"
              onPoke={() => {
                play("bump");
                award(`poke:${id}`, 5, "Secret found!", "You poked the 3D model · +5 coins");
              }}
            />
          )}
        </motion.header>
        {children}

        {next && (
          <motion.div
            className="mt-20 flex flex-col items-center gap-4 sm:mt-28"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.45 }}
          >
            <span aria-hidden className="h-12 w-0 border-l-[5px] border-dashed border-line" />
            <p className="hud-text text-teal">Level {String(level).padStart(2, "0")} cleared</p>
            <a href={`#${next.id}`} className="btn btn-gold px-7 py-4 text-xl" onClick={() => play("open")}>
              Next level: {next.label}
              <span aria-hidden className="inline-block" style={{ animation: "bob 1s ease-in-out infinite" }}>
                ▼
              </span>
            </a>
          </motion.div>
        )}
      </div>
    </section>
  );
}
