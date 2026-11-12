"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { FaArrowLeft, FaArrowRight, FaPlay } from "react-icons/fa6";
import { useGame } from "./GameProvider";
import { Reveal } from "./Section";

const LANES = [-2.2, 0, 2.2];
const RUN_SECONDS = 30;
const GOAL = 12;
const POOL = 16;

interface Item {
  active: boolean;
  lane: number;
  z: number;
  kind: 0 | 1; // 0 = star coin, 1 = bug
}

interface GameState {
  running: boolean;
  lane: number;
  t: number;
  dist: number;
  spawn: number;
  second: number;
  items: Item[];
}

const fresh = (): GameState => ({
  running: false,
  lane: 1,
  t: 0,
  dist: 0,
  spawn: 0.6,
  second: RUN_SECONDS,
  items: Array.from({ length: POOL }, () => ({ active: false, lane: 1, z: -50, kind: 0 as const })),
});

interface WorldProps {
  game: React.RefObject<GameState>;
  dark: boolean;
  onCoin: () => void;
  onHit: () => void;
  onSecond: (left: number) => void;
}

function World({ game, dark, onCoin, onHit, onSecond }: WorldProps) {
  const player = useRef<Group>(null);
  const items = useRef<Group>(null);
  const stripes = useRef<Group>(null);
  const trees = useRef<Group>(null);

  useFrame(({ clock }, dt) => {
    const g = game.current;
    if (!g) return;
    const d = Math.min(dt, 0.05);
    const now = clock.elapsedTime;

    const p = player.current;
    if (p) {
      const tx = LANES[g.lane];
      p.position.x += (tx - p.position.x) * Math.min(1, d * 14);
      p.position.y = 0.6 + Math.abs(Math.sin(now * (g.running ? 11 : 3))) * (g.running ? 0.22 : 0.08);
      p.rotation.z = (p.position.x - tx) * 0.3;
      p.rotation.y = g.running ? 0 : Math.sin(now * 0.8) * 0.5;
    }

    const speed = g.running ? 12 + g.t * 0.4 : 2;
    g.dist += speed * d;
    stripes.current?.children.forEach((s, i) => (s.position.z = ((i * 6 + g.dist) % 54) - 48));
    trees.current?.children.forEach((s, i) => (s.position.z = ((Math.floor(i / 2) * 9 + g.dist) % 54) - 53));

    const group = items.current;
    if (!group) return;

    if (g.running) {
      g.t += d;
      const left = Math.max(0, Math.ceil(RUN_SECONDS - g.t));
      if (left !== g.second) {
        g.second = left;
        onSecond(left);
      }
      g.spawn -= d;
      if (g.spawn <= 0) {
        const slot = g.items.find((it) => !it.active);
        if (slot) {
          slot.active = true;
          slot.lane = Math.floor(Math.random() * 3);
          slot.z = -46;
          slot.kind = Math.random() < 0.62 ? 0 : 1;
        }
        g.spawn = Math.max(0.3, 0.72 - g.t * 0.012);
      }
    }

    g.items.forEach((it, i) => {
      const m = group.children[i];
      if (!m) return;
      if (!it.active) {
        m.visible = false;
        return;
      }
      if (g.running) it.z += speed * d;
      m.visible = true;
      m.position.set(LANES[it.lane], it.kind === 0 ? 0.9 + Math.sin(now * 4 + i) * 0.12 : 0.55, it.z);
      m.rotation.y += d * (it.kind === 0 ? 5 : 1.6);
      m.children[0].visible = it.kind === 0;
      m.children[1].visible = it.kind === 1;
      if (g.running && it.z > -0.75 && it.z < 0.75 && it.lane === g.lane) {
        it.active = false;
        if (it.kind === 0) onCoin();
        else onHit();
      } else if (it.z > 7) {
        it.active = false;
      }
    });
  });

  const ground = dark ? "#3b1f66" : "#ffc2dd";
  const stripe = dark ? "#ff8ec9" : "#fffafc";
  const sky = dark ? "#1b0d2e" : "#ffe1ee";

  return (
    <>
      <color attach="background" args={[sky]} />
      <fog attach="fog" args={[sky, 20, 46]} />
      <ambientLight intensity={dark ? 1 : 1.5} />
      <directionalLight position={[4, 9, 6]} intensity={1.8} />

      {/* road */}
      <mesh position={[0, -0.05, -20]}>
        <boxGeometry args={[7.4, 0.1, 62]} />
        <meshStandardMaterial color={ground} flatShading />
      </mesh>
      <group ref={stripes}>
        {Array.from({ length: 9 }, (_, i) => (
          <group key={i}>
            {[-1.1, 1.1].map((x) => (
              <mesh key={x} position={[x, 0.02, 0]}>
                <boxGeometry args={[0.14, 0.04, 2.4]} />
                <meshBasicMaterial color={stripe} />
              </mesh>
            ))}
          </group>
        ))}
      </group>

      {/* little block trees on both sides */}
      <group ref={trees}>
        {Array.from({ length: 12 }, (_, i) => (
          <group key={i} position={[i % 2 ? 5.6 : -5.6, 0, 0]} scale={0.8}>
            <mesh position={[0, 0.6, 0]}>
              <boxGeometry args={[0.4, 1.2, 0.4]} />
              <meshStandardMaterial color="#b9703f" flatShading />
            </mesh>
            <mesh position={[0, 1.8, 0]}>
              <boxGeometry args={[1.5, 1.5, 1.5]} />
              <meshStandardMaterial color={i % 3 === 0 ? "#ff8ec9" : i % 3 === 1 ? "#8fd8ff" : "#ffd257"} flatShading />
            </mesh>
          </group>
        ))}
      </group>

      {/* stars to collect and bugs to dodge */}
      <group ref={items}>
        {Array.from({ length: POOL }, (_, i) => (
          <group key={i} visible={false}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.45, 0.45, 0.14, 10]} />
              <meshStandardMaterial color="#ffd257" emissive="#ffd257" emissiveIntensity={0.35} metalness={0.5} roughness={0.3} flatShading />
            </mesh>
            <group>
              <mesh>
                <boxGeometry args={[0.95, 0.75, 0.95]} />
                <meshStandardMaterial color="#e0345f" flatShading />
              </mesh>
              {[-0.6, 0.6].map((x) => (
                <mesh key={x} position={[x, -0.2, 0]}>
                  <boxGeometry args={[0.3, 0.14, 1.2]} />
                  <meshStandardMaterial color="#2a1038" />
                </mesh>
              ))}
              {[-0.22, 0.22].map((x) => (
                <mesh key={x} position={[x, 0.12, 0.5]}>
                  <boxGeometry args={[0.16, 0.16, 0.06]} />
                  <meshBasicMaterial color="#fffafc" />
                </mesh>
              ))}
            </group>
          </group>
        ))}
      </group>

      {/* the runner: a small original block robot */}
      <group ref={player} position={[0, 0.6, 0]}>
        <mesh>
          <boxGeometry args={[0.95, 0.95, 0.95]} />
          <meshStandardMaterial color="#ff8ec9" flatShading />
        </mesh>
        <mesh position={[0, 0.05, -0.49]}>
          <boxGeometry args={[0.7, 0.5, 0.04]} />
          <meshBasicMaterial color="#2a1038" />
        </mesh>
        {[-0.18, 0.18].map((x) => (
          <mesh key={x} position={[x, 0.1, -0.52]}>
            <boxGeometry args={[0.14, 0.14, 0.04]} />
            <meshBasicMaterial color="#ffd257" />
          </mesh>
        ))}
        <mesh position={[0, 0.62, 0]}>
          <boxGeometry args={[0.12, 0.3, 0.12]} />
          <meshStandardMaterial color="#8fd8ff" />
        </mesh>
        <mesh position={[0, 0.85, 0]}>
          <boxGeometry args={[0.24, 0.24, 0.24]} />
          <meshStandardMaterial color="#ffd257" emissive="#ffd257" emissiveIntensity={0.5} />
        </mesh>
        {[-0.28, 0.28].map((x) => (
          <mesh key={x} position={[x, -0.6, 0]}>
            <boxGeometry args={[0.26, 0.3, 0.3]} />
            <meshStandardMaterial color="#8fd8ff" flatShading />
          </mesh>
        ))}
      </group>
    </>
  );
}

/** Bonus stage: a 3-lane 3D runner. Collect star coins, dodge the bugs. */
export function Runner() {
  const { theme, play, award } = useGame();
  const game = useRef<GameState>(fresh());
  const wrap = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<"ready" | "playing" | "over">("ready");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [left, setLeft] = useState(RUN_SECONDS);
  const [best, setBest] = useState(0);
  const [visible, setVisible] = useState(false);
  const [flash, setFlash] = useState(false);
  const scoreRef = useRef(0);
  const livesRef = useRef(3);

  useEffect(() => {
    try {
      setBest(Number(localStorage.getItem("rr-runner")) || 0);
    } catch {}
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "100px" });
    if (wrap.current) io.observe(wrap.current);
    return () => io.disconnect();
  }, []);

  const finish = useCallback(() => {
    game.current.running = false;
    setPhase("over");
    play("win");
    const final = scoreRef.current;
    setBest((b) => {
      const next = Math.max(b, final);
      try {
        localStorage.setItem("rr-runner", String(next));
      } catch {}
      return next;
    });
    if (final >= GOAL) award("runner", 60, "Star runner!", "3D bonus stage cleared · +60 coins");
  }, [award, play]);

  const start = () => {
    game.current = fresh();
    game.current.running = true;
    scoreRef.current = 0;
    livesRef.current = 3;
    setScore(0);
    setLives(3);
    setLeft(RUN_SECONDS);
    setPhase("playing");
    play("open");
    wrap.current?.focus();
  };

  const move = useCallback(
    (dir: -1 | 1) => {
      const g = game.current;
      if (!g.running) return;
      const next = Math.max(0, Math.min(2, g.lane + dir));
      if (next !== g.lane) {
        g.lane = next;
        play("click");
      }
    },
    [play],
  );

  useEffect(() => {
    if (phase !== "playing") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        e.preventDefault();
        move(-1);
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        e.preventDefault();
        move(1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, move]);

  const onCoin = useCallback(() => {
    scoreRef.current += 1;
    setScore(scoreRef.current);
    play("coin");
  }, [play]);

  const onHit = useCallback(() => {
    livesRef.current -= 1;
    setLives(livesRef.current);
    setFlash(true);
    window.setTimeout(() => setFlash(false), 220);
    play("error");
    if (livesRef.current <= 0) finish();
  }, [finish, play]);

  const onSecond = useCallback(
    (s: number) => {
      setLeft(s);
      if (s <= 0) finish();
    },
    [finish],
  );

  return (
    <section aria-labelledby="runner-title" className="px-5 pb-16 pt-28">
      <Reveal className="mx-auto max-w-4xl">
        <p className="hud-text text-coral">Bonus stage · 3D</p>
        <h2 id="runner-title" className="mt-3 font-display text-4xl font-bold sm:text-5xl">
          Star Dash
        </h2>
        <p className="mt-4 max-w-2xl text-xl leading-relaxed text-muted">
          Run down the royal road, grab the gold stars and dodge the red bugs. Catch {GOAL} stars in {RUN_SECONDS} seconds to win 60 coins.
        </p>

        <div
          ref={wrap}
          tabIndex={-1}
          className="pixel-card relative mt-10 h-[380px] touch-none select-none overflow-hidden outline-none sm:h-[440px]"
          style={{ borderColor: flash ? "var(--coral)" : "var(--teal)" }}
          onPointerDown={(e) => {
            if (phase !== "playing") return;
            const r = e.currentTarget.getBoundingClientRect();
            move(e.clientX - r.left < r.width / 2 ? -1 : 1);
          }}
        >
          {visible && (
            <Canvas dpr={[1, 1.5]} camera={{ position: [0, 4.6, 7.5], fov: 55 }} gl={{ antialias: true }} onCreated={({ camera }) => camera.lookAt(0, 0.8, -6)}>
              <World game={game} dark={theme === "dark"} onCoin={onCoin} onHit={onHit} onSecond={onSecond} />
            </Canvas>
          )}

          <div className="hud-text pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between gap-3 bg-card/80 px-4 py-3" aria-live="polite">
            <span>
              Stars <b className="text-gold">{score}</b>/{GOAL}
            </span>
            <span className="text-coral" aria-label={`${lives} lives left`}>
              {"♥".repeat(Math.max(0, lives))}
              <span className="opacity-30">{"♥".repeat(3 - Math.max(0, lives))}</span>
            </span>
            <span>
              Time <b className="text-teal">{left}s</b>
            </span>
          </div>

          {phase !== "playing" && (
            <div className="absolute inset-0 grid place-items-center bg-bg/70 p-6 text-center">
              <div>
                {phase === "over" && (
                  <>
                    <p className="font-display text-4xl font-bold">{score >= GOAL ? "Stage cleared!" : lives <= 0 ? "Ouch, bugs won" : "Time is up"}</p>
                    <p className="mt-2 text-lg">
                      You caught <b className="text-gold">{score}</b> stars. Best run: <b className="text-teal">{best}</b>
                    </p>
                  </>
                )}
                <button type="button" className="btn btn-gold mt-5 px-7 py-4 text-xl" onClick={start}>
                  <FaPlay aria-hidden /> {phase === "over" ? "Run again" : "Start the run"}
                </button>
                <p className="hud-text mt-5 text-muted">← → keys, A / D, or tap a side</p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-5 flex justify-center gap-5">
          <button type="button" className="btn h-14 w-24 text-xl" onClick={() => move(-1)} disabled={phase !== "playing"} aria-label="Move left">
            <FaArrowLeft aria-hidden />
          </button>
          <button type="button" className="btn h-14 w-24 text-xl" onClick={() => move(1)} disabled={phase !== "playing"} aria-label="Move right">
            <FaArrowRight aria-hidden />
          </button>
        </div>
      </Reveal>
    </section>
  );
}
