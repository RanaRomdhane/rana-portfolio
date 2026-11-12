"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const PALETTE = {
  dark: { cubes: ["#3fd9c4", "#ffcb47", "#7ea2ee", "#ff7d6e", "#22306b"], wire: "#3fd9c4", node: "#ffcb47", line: "#7ea2ee", star: "#ffffff" },
  light: { cubes: ["#0f8f80", "#e0a000", "#3d63b8", "#dc4f3f", "#fffcf2"], wire: "#0f8f80", node: "#e0a000", line: "#3d63b8", star: "#3d63b8" },
};

// Deterministic pseudo-random so the scene looks the same on every render.
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const pointer = { x: 0, y: 0 };

function Rig() {
  useFrame(({ camera }) => {
    camera.position.x += (pointer.x * 0.9 - camera.position.x) * 0.04;
    camera.position.y += (pointer.y * 0.5 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

function Cubes({ colors }: { colors: string[] }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const count = 54;
  const seeds = useMemo(() => {
    const r = rng(7);
    return Array.from({ length: count }, () => ({
      x: (r() - 0.5) * 22,
      y: (r() - 0.5) * 11,
      z: -2 - r() * 9,
      s: 0.18 + r() * 0.5,
      speed: 0.2 + r() * 0.6,
      phase: r() * Math.PI * 2,
      c: Math.floor(r() * colors.length),
    }));
  }, [colors.length]);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const color = new THREE.Color();
    seeds.forEach((s, i) => mesh.setColorAt(i, color.set(colors[s.c])));
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [colors, seeds]);

  useFrame(({ clock }) => {
    const mesh = ref.current;
    if (!mesh) return;
    const t = clock.elapsedTime;
    seeds.forEach((s, i) => {
      dummy.position.set(s.x + Math.sin(t * 0.15 + s.phase) * 0.6, s.y + Math.sin(t * s.speed + s.phase) * 0.5, s.z);
      dummy.rotation.set(t * s.speed * 0.4, t * s.speed * 0.3 + s.phase, 0);
      dummy.scale.setScalar(s.s);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial flatShading roughness={0.6} />
    </instancedMesh>
  );
}

function Coins({ color }: { color: string }) {
  const group = useRef<THREE.Group>(null);
  const coins = useMemo(() => {
    const r = rng(21);
    return Array.from({ length: 10 }, () => ({ x: (r() - 0.5) * 16, y: (r() - 0.5) * 7, z: -1 - r() * 4, phase: r() * 6 }));
  }, []);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    group.current?.children.forEach((c, i) => {
      c.rotation.y = t * 2.2 + coins[i].phase;
      c.position.y = coins[i].y + Math.sin(t * 1.1 + coins[i].phase) * 0.35;
    });
  });
  return (
    <group ref={group}>
      {coins.map((c, i) => (
        <mesh key={i} position={[c.x, c.y, c.z]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.26, 0.26, 0.07, 8]} />
          <meshStandardMaterial color={color} flatShading metalness={0.5} roughness={0.3} emissive={color} emissiveIntensity={0.25} />
        </mesh>
      ))}
    </group>
  );
}

/** A slowly turning "neural network" halo that sits behind the portrait. */
function NeuralCore({ wire, node, line }: { wire: string; node: string; line: string }) {
  const group = useRef<THREE.Group>(null);
  const { viewport } = useThree();
  const wide = viewport.width > 9;

  const { nodes, segments } = useMemo(() => {
    const r = rng(99);
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < 34; i++) {
      const u = r() * 2 - 1;
      const th = r() * Math.PI * 2;
      const rad = 2.5 + r() * 0.9;
      const k = Math.sqrt(1 - u * u);
      pts.push(new THREE.Vector3(k * Math.cos(th) * rad, u * rad, k * Math.sin(th) * rad));
    }
    const seg: number[] = [];
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        if (pts[i].distanceTo(pts[j]) < 2.1) seg.push(pts[i].x, pts[i].y, pts[i].z, pts[j].x, pts[j].y, pts[j].z);
      }
    }
    return { nodes: pts, segments: new Float32Array(seg) };
  }, []);

  useFrame(({ clock }) => {
    const g = group.current;
    if (!g) return;
    const t = clock.elapsedTime;
    g.rotation.y = t * 0.16;
    g.rotation.x = Math.sin(t * 0.2) * 0.18;
  });

  return (
    <group position={[wide ? viewport.width * 0.24 : 0, wide ? 0.1 : 1.2, -1.5]} scale={wide ? 1 : 0.8}>
      <group ref={group}>
        <mesh>
          <icosahedronGeometry args={[2.3, 1]} />
          <meshBasicMaterial color={wire} wireframe transparent opacity={0.28} />
        </mesh>
        <lineSegments>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[segments, 3]} />
          </bufferGeometry>
          <lineBasicMaterial color={line} transparent opacity={0.5} />
        </lineSegments>
        {nodes.map((p, i) => (
          <mesh key={i} position={p}>
            <boxGeometry args={[0.13, 0.13, 0.13]} />
            <meshBasicMaterial color={i % 3 === 0 ? node : wire} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function Stars({ color }: { color: string }) {
  const positions = useMemo(() => {
    const r = rng(3);
    const arr = new Float32Array(420 * 3);
    for (let i = 0; i < arr.length; i += 3) {
      arr[i] = (r() - 0.5) * 44;
      arr[i + 1] = (r() - 0.5) * 24;
      arr[i + 2] = -8 - r() * 14;
    }
    return arr;
  }, []);
  const ref = useRef<THREE.Points>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.z = clock.elapsedTime * 0.008;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color={color} size={0.09} sizeAttenuation transparent opacity={0.85} />
    </points>
  );
}

export default function HeroScene({ theme }: { theme: "dark" | "light" }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [calm, setCalm] = useState(false);
  const p = PALETTE[theme];

  useEffect(() => {
    setCalm(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const onMove = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.02 });
    if (wrap.current) io.observe(wrap.current);
    return () => {
      window.removeEventListener("pointermove", onMove);
      io.disconnect();
    };
  }, []);

  return (
    <div ref={wrap} className="absolute inset-0 opacity-45 lg:opacity-100" aria-hidden>
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 9], fov: 50 }}
        gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
        frameloop={calm ? "demand" : visible ? "always" : "never"}
      >
        <ambientLight intensity={theme === "dark" ? 0.75 : 1.3} />
        <directionalLight position={[4, 6, 5]} intensity={1.6} />
        {theme === "dark" && <Stars color={p.star} />}
        <Cubes colors={p.cubes} />
        <Coins color={p.node} />
        <NeuralCore wire={p.wire} node={p.node} line={p.line} />
        {!calm && <Rig />}
      </Canvas>
    </div>
  );
}
