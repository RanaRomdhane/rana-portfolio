import type { IconType } from "react-icons";
import {
  FaBrain, FaBus, FaChartColumn, FaCode, FaCubes, FaDatabase, FaDiagramProject, FaEye, FaFaceSmile, FaGears,
  FaJava, FaLanguage, FaLayerGroup, FaListCheck, FaMobileScreen, FaPlug, FaRobot, FaShieldHalved, FaUtensils,
  FaWandMagicSparkles, FaInfinity, FaMagnifyingGlassChart,
} from "react-icons/fa6";
import {
  SiCisco, SiDocker, SiElasticsearch, SiExpo, SiFastapi, SiFlask, SiGithub, SiHtml5, SiHuggingface, SiJavascript,
  SiLangchain, SiLinux, SiMongodb, SiMysql, SiNextdotjs, SiNumpy, SiNvidia, SiOllama, SiOpencv, SiPandas,
  SiPostgresql, SiPython, SiPytorch, SiReact, SiScikitlearn, SiStreamlit, SiTailwindcss, SiTensorflow, SiTypescript,
} from "react-icons/si";

interface Entry {
  icon: IconType;
  color?: string;
}

/** Logo + brand colour for every technology named in the content file. */
const ICONS: Record<string, Entry> = {
  Python: { icon: SiPython, color: "#4b8bbe" },
  Java: { icon: FaJava, color: "#e76f00" },
  SQL: { icon: FaDatabase, color: "#8fd8ff" },
  JavaScript: { icon: SiJavascript, color: "#f0db4f" },
  TypeScript: { icon: SiTypescript, color: "#3178c6" },
  PyTorch: { icon: SiPytorch, color: "#ee4c2c" },
  TensorFlow: { icon: SiTensorflow, color: "#ff8f00" },
  "Scikit-learn": { icon: SiScikitlearn, color: "#f89939" },
  XGBoost: { icon: FaDiagramProject, color: "#ff8ec9" },
  Pandas: { icon: SiPandas, color: "#8b6fd6" },
  NumPy: { icon: SiNumpy, color: "#4dabcf" },
  OpenCV: { icon: SiOpencv, color: "#5c3ee8" },
  "Computer Vision": { icon: FaEye, color: "#ff8ec9" },
  NLP: { icon: FaLanguage, color: "#ffd257" },
  "RAG pipelines": { icon: FaMagnifyingGlassChart, color: "#ff6b8b" },
  LangChain: { icon: SiLangchain, color: "#ff8ec9" },
  ChromaDB: { icon: FaDatabase, color: "#ff6b8b" },
  Ollama: { icon: SiOllama },
  "Hugging Face Transformers": { icon: SiHuggingface, color: "#ffcc4d" },
  "LoRA fine-tuning": { icon: FaWandMagicSparkles, color: "#b48cf2" },
  BERT: { icon: FaBrain, color: "#ff6b8b" },
  "Explainable AI (SHAP, Grad-CAM)": { icon: FaEye, color: "#ffd257" },
  React: { icon: SiReact, color: "#61dafb" },
  "Next.js": { icon: SiNextdotjs },
  "React Native (Expo)": { icon: SiExpo },
  "Tailwind CSS": { icon: SiTailwindcss, color: "#38bdf8" },
  "HTML/CSS": { icon: SiHtml5, color: "#e34f26" },
  "REST API integration": { icon: FaPlug, color: "#ff8ec9" },
  "Responsive design": { icon: FaMobileScreen, color: "#8fd8ff" },
  Docker: { icon: SiDocker, color: "#2496ed" },
  FastAPI: { icon: SiFastapi, color: "#05998b" },
  Streamlit: { icon: SiStreamlit, color: "#ff4b4b" },
  MLOps: { icon: FaInfinity, color: "#ff8ec9" },
  Flask: { icon: SiFlask },
  "Git/GitHub": { icon: SiGithub },
  "CI/CD": { icon: FaGears, color: "#ffd257" },
  Linux: { icon: SiLinux, color: "#f5c400" },
  "Power BI": { icon: FaChartColumn, color: "#f2c811" },
  Oracle: { icon: FaDatabase, color: "#f80000" },
  PostgreSQL: { icon: SiPostgresql, color: "#5a8fd0" },
  MySQL: { icon: SiMysql, color: "#4d8fbf" },
  MongoDB: { icon: SiMongodb, color: "#47a248" },
  Elasticsearch: { icon: SiElasticsearch, color: "#00bfb3" },
  NVIDIA: { icon: SiNvidia, color: "#76b900" },
  Cisco: { icon: SiCisco, color: "#1ba0d7" },
  // section / project glyphs
  code: { icon: FaCode },
  brain: { icon: FaBrain },
  robot: { icon: FaRobot },
  layers: { icon: FaLayerGroup },
  gears: { icon: FaGears },
  database: { icon: FaDatabase },
  face: { icon: FaFaceSmile },
  bus: { icon: FaBus },
  shield: { icon: FaShieldHalved },
  tasks: { icon: FaListCheck },
  food: { icon: FaUtensils },
  chart: { icon: FaChartColumn },
};

export function TechIcon({ name, size = 20, mono = false, className }: { name: string; size?: number; mono?: boolean; className?: string }) {
  const entry = ICONS[name] ?? { icon: FaCubes };
  const Icon = entry.icon;
  return <Icon aria-hidden size={size} className={className} style={{ color: mono ? undefined : entry.color, flexShrink: 0 }} />;
}

export function TechChip({ name }: { name: string }) {
  return (
    <span className="chip">
      <TechIcon name={name} size={14} />
      {name}
    </span>
  );
}

/** Generated pixel badge used when no real logo image is provided. */
export function Monogram({ name, logo, size = 56 }: { name: string; logo?: string; size?: number }) {
  if (logo) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={logo} alt={`${name} logo`} width={size} height={size} className="border-[3px] border-line bg-white object-contain" style={{ width: size, height: size }} />;
  }
  const letters = name
    .replace(/\(.*?\)/g, "")
    .split(/[\s-]+/)
    .filter((w) => /^[A-Za-zÀ-ÿ]/.test(w) && !/^(of|for|the|de|sté)$/i.test(w))
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
  return (
    <span
      aria-hidden
      className="grid shrink-0 place-items-center border-[3px] border-[#3a1245] font-hud text-[#3a1245]"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.28,
        background: "var(--accent, var(--teal))",
        boxShadow: "inset -4px -4px 0 rgba(0,0,0,.18), inset 4px 4px 0 rgba(255,255,255,.3)",
      }}
    >
      {letters}
    </span>
  );
}
