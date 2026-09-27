import Image from "next/image";
import { createElement } from "react";
import { BrainCircuit, CalendarDays, ChartNoAxesCombined, CodeXml, Cpu, Database, GitBranch, Globe, Layers3, Network, ScanFace, Server, ShieldCheck, Sparkles, TreePine, Workflow, type LucideIcon } from "lucide-react";

const brands: Record<string, string> = {
  Python: "python", Java: "java", JavaScript: "javascript", TypeScript: "typescript",
  PyTorch: "pytorch", TensorFlow: "tensorflow", "Scikit-learn": "scikitlearn",
  Pandas: "pandas", NumPy: "numpy", OpenCV: "opencv", React: "react",
  "React Native (Expo)": "react", "Next.js": "nextjs", "Tailwind CSS": "tailwindcss",
  Docker: "docker", FastAPI: "fastapi", "Git/GitHub": "git", Git: "git",
  PostgreSQL: "postgresql", MySQL: "mysql", MongoDB: "mongodb",
  Linux: "linux", Flask: "flask", Streamlit: "streamlit",
  Oracle: "oracle", Elasticsearch: "elasticsearch", "Hugging Face Transformers": "huggingface",
  "Expo Router": "expo", Expo: "expo", LangChain: "langchain", Ollama: "ollama",
  NVIDIA: "nvidia",
};

function conceptIcon(name: string): LucideIcon {
  if (/forest|xgboost|gradient/i.test(name)) return TreePine;
  if (/rag|bert|llm|nlp|neural|lora|blip|llava|transformer|embedding|generative|ai|machine|deep/i.test(name)) return BrainCircuit;
  if (/vision|opencv|face|grad-cam|shap|vit/i.test(name)) return ScanFace;
  if (/database|sql|chroma|vector|oracle|mongo|elastic/i.test(name)) return Database;
  if (/websocket|rest|network|api/i.test(name)) return Network;
  if (/calendar|schedule/i.test(name)) return CalendarDays;
  if (/security|siem|svm/i.test(name)) return ShieldCheck;
  if (/web|html|css|nativewind|responsive|frontend/i.test(name)) return CodeXml;
  if (/pipeline|mlops|ci\/cd|workflow|gtd|etl/i.test(name)) return Workflow;
  if (/power bi|analytic|data/i.test(name)) return ChartNoAxesCombined;
  if (/linux|deploy|on-premise|docker|streamlit/i.test(name)) return Server;
  if (/git/i.test(name)) return GitBranch;
  if (/computer|model/i.test(name)) return Cpu;
  if (/platform|react native|expo/i.test(name)) return Globe;
  if (/layers|framework/i.test(name)) return Layers3;
  return Sparkles;
}

export function BrandIcon({ name, size = 28 }: { name: string; size?: number }) {
  const slug = brands[name];
  return <span className={`brand-icon ${slug ? "brand-icon-logo" : "brand-icon-concept"}`} aria-hidden="true">{slug
    ? <Image src={`/brands/${slug}.svg`} alt="" width={size} height={size} unoptimized />
    : name === "IBM" ? <strong className="brand-icon-wordmark">IBM</strong> : createElement(conceptIcon(name), { size: Math.max(17, Math.round(size * .75)), strokeWidth: 1.8 })}
  </span>;
}
