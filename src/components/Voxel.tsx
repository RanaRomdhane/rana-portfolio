"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

export type VoxelModel = "robot" | "gem" | "sword" | "globe" | "trophy" | "cap" | "chest" | "heart" | "crown" | "castle";

const C = { teal: "#ff8ec9", gold: "#ffd257", coral: "#ff6b8b", denim: "#8fd8ff", ink: "#2a1038", white: "#fffafc", wood: "#b9703f" };

interface Vox {
  x: number;
  y: number;
  z: number;
  c: string;
}

/** Every model is an original shape described cube by cube. */
function build(model: VoxelModel): Vox[] {
  const v: Vox[] = [];
  const add = (x: number, y: number, z: number, c: string) => v.push({ x, y, z, c });

  if (model === "robot") {
    // head shell
    for (let x = -4; x <= 4; x++)
      for (let y = -3; y <= 3; y++)
        for (let z = -3; z <= 3; z++) {
          const edge = Math.abs(x) === 4 || Math.abs(y) === 3 || Math.abs(z) === 3;
          if (!edge) continue;
          const face = z === 3 && Math.abs(x) <= 3 && Math.abs(y) <= 2;
          let c = face ? C.ink : C.teal;
          if (face && y >= 0 && y <= 1 && (x === -2 || x === -1 || x === 1 || x === 2)) c = C.gold; // eyes
          if (face && y === -2 && Math.abs(x) <= 1) c = C.coral; // smile
          if (!face && y === 3) c = "#ffb8dd";
          add(x, y, z, c);
        }
    // ears + antenna
    for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++) [-5, 5].forEach((x) => add(x, y, z, C.denim));
    add(0, 4, 0, C.denim);
    add(0, 5, 0, C.denim);
    add(0, 6, 0, C.coral);
  }

  if (model === "gem") {
    for (let x = -4; x <= 4; x++)
      for (let y = -4; y <= 4; y++)
        for (let z = -4; z <= 4; z++) {
          const d = Math.abs(x) + Math.abs(y) + Math.abs(z);
          if (d === 4) add(x, y, z, y > 1 ? C.white : y >= 0 ? C.teal : y > -3 ? "#f05fae" : C.denim);
        }
  }

  if (model === "sword") {
    for (let y = -1; y <= 6; y++) for (let x = -1; x <= 1; x++) add(x, y, 0, x === 0 ? C.white : "#cfd8f2");
    add(0, 7, 0, C.white);
    for (let x = -3; x <= 3; x++) for (let z = -1; z <= 1; z++) if (z === 0 || Math.abs(x) < 2) add(x, -2, z, C.gold);
    for (let y = -5; y <= -3; y++) add(0, y, 0, C.denim);
    for (let x = -1; x <= 1; x++) add(x, -6, 0, C.coral);
  }

  if (model === "globe") {
    for (let x = -5; x <= 5; x++)
      for (let y = -5; y <= 5; y++)
        for (let z = -5; z <= 5; z++) {
          const d = Math.sqrt(x * x + y * y + z * z);
          if (d > 3.7 && d <= 4.7) {
            const land = Math.sin(x * 0.9 + 1) * Math.cos(y * 0.8) + Math.sin(z * 1.1 + y * 0.5) > 0.35;
            add(x, y, z, Math.abs(y) >= 4 ? C.white : land ? C.teal : C.denim);
          }
        }
  }

  if (model === "trophy") {
    const ring = (y: number, r: number, c: string, hollow = false) => {
      for (let x = -4; x <= 4; x++)
        for (let z = -4; z <= 4; z++) {
          const d = Math.sqrt(x * x + z * z);
          if (d <= r && (!hollow || d > r - 1.2)) add(x, y, z, c);
        }
    };
    ring(-5, 2.6, C.coral);
    ring(-4, 1.6, C.coral);
    for (let y = -3; y <= -2; y++) ring(y, 0.8, C.gold);
    ring(-1, 1.6, C.gold);
    ring(0, 2.4, C.gold, true);
    for (let y = 1; y <= 4; y++) ring(y, 3.2, y === 4 ? "#ffe08a" : C.gold, true);
    for (let y = 1; y <= 3; y++) [-5, 5].forEach((x) => (y === 2 ? add(x, y, 0, C.gold) : add(Math.sign(x) * 4, y, 0, C.gold)));
  }

  if (model === "cap") {
    for (let x = -4; x <= 4; x++) for (let z = -4; z <= 4; z++) add(x, 1, z, Math.abs(x) === 4 || Math.abs(z) === 4 ? "#6cc3f2" : C.denim);
    for (let x = -2; x <= 2; x++) for (let z = -2; z <= 2; z++) for (let y = -2; y <= 0; y++) if (Math.abs(x) === 2 || Math.abs(z) === 2 || y === -2) add(x, y, z, C.ink);
    add(0, 2, 0, C.gold);
    for (let x = 1; x <= 4; x++) add(x, 2, 0, C.gold);
    for (let y = -2; y <= 1; y++) add(5, y, 0, C.gold);
    add(5, -3, 0, C.coral);
  }

  if (model === "chest") {
    for (let x = -4; x <= 4; x++)
      for (let y = -3; y <= 3; y++)
        for (let z = -3; z <= 3; z++) {
          const edge = Math.abs(x) === 4 || Math.abs(y) === 3 || Math.abs(z) === 3;
          if (!edge) continue;
          if (y === 3 && (Math.abs(x) === 4 || Math.abs(z) === 3)) continue; // rounded lid
          let c = y >= 1 ? "#cf8450" : C.wood;
          if (Math.abs(x) === 2 || y === 0) c = C.gold;
          if (z === 3 && Math.abs(x) <= 0 && y >= -1 && y <= 0) c = C.ink;
          add(x, y, z, c);
        }
    add(0, 4, 0, C.gold);
    add(-2, 4, 1, C.teal);
    add(2, 4, -1, C.coral);
  }

  if (model === "heart") {
    for (let x = -6; x <= 6; x++)
      for (let y = -6; y <= 6; y++) {
        const a = x / 4.6;
        const b = y / 4.6 + 0.15;
        const f = Math.pow(a * a + b * b - 1, 3) - a * a * b * b * b;
        if (f <= 0) for (let z = -1; z <= 1; z++) add(x, y, z, x < -1 && y > 1 && y < 4 && z === 1 && x > -4 ? C.white : z === 0 ? C.coral : "#f0624f");
      }
  }

  if (model === "crown") {
    for (let x = -4; x <= 4; x++)
      for (let z = -4; z <= 4; z++) {
        const d = Math.sqrt(x * x + z * z);
        if (d > 4.6 || d <= 3.3) continue;
        const ang = Math.atan2(z, x);
        const peak = Math.round(3.4 * Math.pow(Math.abs(Math.cos(ang * 2.5)), 1.6)) - 1;
        add(x, -3, z, "#f0b93a");
        for (let y = -2; y <= peak; y++) add(x, y, z, y === -1 ? "#ffe9a3" : C.gold);
        if (peak >= 2) add(x, peak + 1, z, C.coral);
      }
    [[4, 0], [-4, 0], [0, 4], [0, -4]].forEach(([x, z], i) => add(x * 1.25, -1, z * 1.25, i % 2 ? C.denim : C.teal));
  }

  if (model === "castle") {
    const stone = C.white;
    const shade = "#f3d9e8";
    // outer wall with battlements
    for (let x = -4; x <= 4; x++)
      for (let z = -4; z <= 4; z++) {
        if (Math.abs(x) !== 4 && Math.abs(z) !== 4) continue;
        for (let y = -4; y <= -1; y++) add(x, y, z, y === -4 ? shade : stone);
        if ((x + z) % 2 === 0) add(x, 0, z, stone);
      }
    // gate
    add(0, -4, 5, C.ink);
    add(0, -3, 5, C.ink);
    // corner towers with pink roofs
    [-4, 4].forEach((tx) =>
      [-4, 4].forEach((tz) => {
        for (let dx = -1; dx <= 1; dx++)
          for (let dz = -1; dz <= 1; dz++) {
            for (let y = -4; y <= 2; y++) if (Math.abs(dx) === 1 || Math.abs(dz) === 1) add(tx + dx, y, tz + dz, stone);
            add(tx + dx, 3, tz + dz, C.teal);
          }
        add(tx, 4, tz, C.teal);
        add(tx, 5, tz, C.gold);
      }),
    );
    // central keep
    for (let x = -1; x <= 1; x++)
      for (let z = -1; z <= 1; z++) {
        for (let y = -4; y <= 4; y++) if (Math.abs(x) === 1 || Math.abs(z) === 1) add(x, y, z, y === 1 && x === 0 ? C.denim : stone);
        add(x, 5, z, C.teal);
      }
    add(0, 6, 0, C.teal);
    add(0, 7, 0, C.gold);
    add(1, 7, 0, C.coral);
  }

  return v;
}

interface State {
  hover: boolean;
  kick: number;
  spin: number;
  tiltX: number;
  tiltY: number;
}

function Model({ voxels, state, calm }: { voxels: Vox[]; state: React.RefObject<State>; calm: boolean }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const group = useRef<THREE.Group>(null);
  const burst = useRef(0);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const { parts, scale } = useMemo(() => {
    let max = 1;
    const parts = voxels.map((p, i) => {
      max = Math.max(max, Math.abs(p.x), Math.abs(p.y), Math.abs(p.z));
      const dir = new THREE.Vector3(p.x, p.y, p.z);
      if (dir.lengthSq() < 0.01) dir.set(0, 1, 0);
      dir.normalize();
      const r = Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1;
      return { ...p, dir, r };
    });
    return { parts, scale: 2.3 / max };
  }, [voxels]);

  useEffect(() => {
    const m = mesh.current;
    if (!m) return;
    const color = new THREE.Color();
    parts.forEach((p, i) => m.setColorAt(i, color.set(p.c)));
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [parts]);

  useFrame(({ clock }, dt) => {
    const m = mesh.current;
    const g = group.current;
    const s = state.current;
    if (!m || !g || !s) return;
    const t = clock.elapsedTime;
    const d = Math.min(dt, 0.05);

    // explode on click, breathe apart on hover, then pull back together
    s.kick *= Math.pow(0.03, d);
    const target = (s.hover ? 0.35 : 0) + s.kick;
    burst.current += (target - burst.current) * Math.min(1, d * 7);
    const b = burst.current;

    s.spin *= Math.pow(0.12, d);
    if (!calm) g.rotation.y += d * (0.55 + s.spin);
    g.rotation.x += (s.tiltY * 0.5 + 0.18 - g.rotation.x) * Math.min(1, d * 5);
    g.rotation.z += (-s.tiltX * 0.25 - g.rotation.z) * Math.min(1, d * 5);
    g.position.y = calm ? 0 : Math.sin(t * 1.4) * 0.12;

    parts.forEach((p, i) => {
      const k = b * (1.2 + p.r * 3.2);
      dummy.position.set(p.x + p.dir.x * k, p.y + p.dir.y * k, p.z + p.dir.z * k);
      dummy.rotation.set(b * p.r * 5, b * (1 - p.r) * 5, 0);
      dummy.scale.setScalar(0.94);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  });

  return (
    <group ref={group} scale={scale}>
      <instancedMesh ref={mesh} args={[undefined, undefined, parts.length]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial flatShading roughness={0.55} metalness={0.05} />
      </instancedMesh>
    </group>
  );
}

/**
 * A small interactive 3D toy: it spins on its own, leans toward the pointer,
 * can be dragged to spin faster, and bursts into cubes when clicked.
 */
export default function Voxel({ model, size = 180, onPoke, className }: { model: VoxelModel; size?: number; onPoke?: () => void; className?: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const state = useRef<State>({ hover: false, kick: 0, spin: 0, tiltX: 0, tiltY: 0 });
  const drag = useRef<{ x: number; moved: number } | null>(null);
  const [visible, setVisible] = useState(false);
  const [calm, setCalm] = useState(false);
  const voxels = useMemo(() => build(model), [model]);

  useEffect(() => {
    setCalm(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "120px" });
    if (wrap.current) io.observe(wrap.current);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={wrap}
      aria-hidden
      className={`relative shrink-0 cursor-grab touch-pan-y select-none active:cursor-grabbing ${className ?? ""}`}
      style={{ width: size, height: size }}
      onPointerEnter={() => (state.current.hover = true)}
      onPointerLeave={() => {
        state.current.hover = false;
        state.current.tiltX = state.current.tiltY = 0;
        drag.current = null;
      }}
      onPointerDown={(e) => (drag.current = { x: e.clientX, moved: 0 })}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        state.current.tiltX = ((e.clientX - r.left) / r.width) * 2 - 1;
        state.current.tiltY = ((e.clientY - r.top) / r.height) * 2 - 1;
        if (drag.current) {
          const dx = e.clientX - drag.current.x;
          drag.current.x = e.clientX;
          drag.current.moved += Math.abs(dx);
          state.current.spin = Math.max(-14, Math.min(14, state.current.spin + dx * 0.25));
        }
      }}
      onPointerUp={() => {
        if (drag.current && drag.current.moved < 6) {
          state.current.kick = 1.6;
          onPoke?.();
        }
        drag.current = null;
      }}
    >
      {visible && (
        <Canvas
          dpr={[1, 1.75]}
          camera={{ position: [0, 0, 9.5], fov: 38 }}
          gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
          frameloop={calm ? "demand" : "always"}
        >
          <ambientLight intensity={1.1} />
          <directionalLight position={[5, 7, 6]} intensity={2} />
          <directionalLight position={[-6, -2, 3]} intensity={0.5} color="#8fd8ff" />
          <Model voxels={voxels} state={state} calm={calm} />
        </Canvas>
      )}
    </div>
  );
}
