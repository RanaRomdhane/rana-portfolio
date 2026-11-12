"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

type Theme = "dark" | "light";
type Sfx = "coin" | "bump" | "click" | "win" | "error" | "open";

interface Toast {
  id: number;
  title: string;
  text: string;
}

interface Game {
  theme: Theme;
  toggleTheme: () => void;
  sound: boolean;
  toggleSound: () => void;
  coins: number;
  /** Gives coins once per id. Returns true if it was newly unlocked. */
  award: (id: string, amount: number, title?: string, text?: string) => boolean;
  has: (id: string) => boolean;
  play: (name: Sfx) => void;
}

const GameContext = createContext<Game | null>(null);

const NOTES: Record<Sfx, { f: number[]; step: number; type: OscillatorType }> = {
  coin: { f: [988, 1319], step: 0.07, type: "square" },
  bump: { f: [196, 147], step: 0.06, type: "square" },
  click: { f: [660], step: 0.04, type: "square" },
  open: { f: [392, 523, 659], step: 0.05, type: "triangle" },
  win: { f: [523, 659, 784, 1047, 1319], step: 0.09, type: "square" },
  error: { f: [180, 140], step: 0.1, type: "sawtooth" },
};

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [sound, setSound] = useState(true);
  const [coins, setCoins] = useState(0);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const unlocked = useRef<Set<string>>(new Set());
  const audio = useRef<AudioContext | null>(null);
  const soundRef = useRef(true);
  const toastId = useRef(0);

  // Load saved progress after hydration.
  useEffect(() => {
    try {
      const t = document.documentElement.dataset.theme;
      if (t === "light" || t === "dark") setTheme(t);
      const s = localStorage.getItem("rr-sound");
      if (s === "off") {
        setSound(false);
        soundRef.current = false;
      }
      const saved = JSON.parse(localStorage.getItem("rr-save") || "{}") as { coins?: number; ids?: string[] };
      if (Array.isArray(saved.ids)) unlocked.current = new Set(saved.ids);
      if (typeof saved.coins === "number") setCoins(saved.coins);
    } catch {
      /* storage unavailable: play without saving */
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      try {
        localStorage.setItem("rr-theme", next);
      } catch {}
      return next;
    });
  }, []);

  const play = useCallback((name: Sfx) => {
    if (!soundRef.current || typeof window === "undefined") return;
    try {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audio.current) audio.current = new Ctx();
      const ctx = audio.current;
      if (ctx.state === "suspended") void ctx.resume();
      const { f, step, type } = NOTES[name];
      f.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const t0 = ctx.currentTime + i * step;
        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.035, t0);
        gain.gain.exponentialRampToValueAtTime(0.0001, t0 + step * 1.8);
        osc.connect(gain).connect(ctx.destination);
        osc.start(t0);
        osc.stop(t0 + step * 2);
      });
    } catch {
      /* audio not available */
    }
  }, []);

  const toggleSound = useCallback(() => {
    setSound((prev) => {
      const next = !prev;
      soundRef.current = next;
      try {
        localStorage.setItem("rr-sound", next ? "on" : "off");
      } catch {}
      return next;
    });
  }, []);

  const award = useCallback(
    (id: string, amount: number, title?: string, text?: string) => {
      if (unlocked.current.has(id)) return false;
      unlocked.current.add(id);
      setCoins((c) => {
        const next = c + amount;
        try {
          localStorage.setItem("rr-save", JSON.stringify({ coins: next, ids: [...unlocked.current] }));
        } catch {}
        return next;
      });
      if (title) {
        const tid = ++toastId.current;
        setToasts((t) => [...t.slice(-2), { id: tid, title, text: text || `+${amount} coins` }]);
        window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== tid)), 3200);
        play("coin");
      }
      return true;
    },
    [play],
  );

  const has = useCallback((id: string) => unlocked.current.has(id), []);

  const value = useMemo(
    () => ({ theme, toggleTheme, sound, toggleSound, coins, award, has, play }),
    [theme, toggleTheme, sound, toggleSound, coins, award, has, play],
  );

  return (
    <GameContext.Provider value={value}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed bottom-14 right-3 z-[90] flex w-[min(320px,calc(100vw-24px))] flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pixel-card flex items-center gap-3 px-3 py-2"
            style={{ animation: "toast-in 0.35s steps(6) both", borderColor: "var(--gold)" }}
          >
            <span aria-hidden className="grid h-9 w-9 shrink-0 place-items-center rounded-full border-[3px] border-[#171b33] bg-gold font-hud text-[0.6rem] text-[#171b33]">
              ★
            </span>
            <span className="min-w-0">
              <span className="block font-display text-base leading-tight">{t.title}</span>
              <span className="block text-sm text-muted">{t.text}</span>
            </span>
          </div>
        ))}
      </div>
    </GameContext.Provider>
  );
}

export function useGame(): Game {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used inside GameProvider");
  return ctx;
}
