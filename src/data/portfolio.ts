export const profile = {
  name: "Rana Romdhane",
  title: "AI/ML Engineer",
  location: "Ariana, Tunisia",
  email: "ranaromdhane1@gmail.com",
  phone: "+216 22 14 14 39",
  phoneHref: "tel:+21622141439",
  linkedin: "https://linkedin.com/in/rana-romdhane-260b70293",
  github: "https://github.com/RanaRomdhane",
  summary:
    "AI/ML Engineer with a Computer Science engineering degree and hands-on experience designing, training, and deploying end-to-end machine learning solutions spanning predictive modeling, computer vision, NLP, and LLM-based applications. Published researcher in Vision-Language Models, combining strong software engineering fundamentals—including modern React/TypeScript front-end development—with a focus on delivering measurable, production-ready results.",
} as const;

export const highlights = [
  { value: "96.81%", label: "Emotion model accuracy" },
  { value: "96%", label: "RAG answer faithfulness" },
  { value: "200K+", label: "Financial records analyzed" },
  { value: "2026", label: "Published VLM research" },
] as const;

export const aboutPaths = [
  { id: "research", label: "Research", title: "Questions worth testing.", description: "I study how vision-language models read complex human expression, then validate results with explainable AI.", metric: "96.81%", metricLabel: "compound emotion accuracy", href: "#publications" },
  { id: "engineering", label: "Engineering", title: "Ideas built to work.", description: "I connect models, APIs, data, and responsive interfaces into complete systems such as TransportAI.", metric: "0.997", metricLabel: "forecast R² at SORETRAK", href: "#experience" },
  { id: "impact", label: "Impact", title: "Intelligence people can use.", description: "I focus on measurable improvements, from clearer decisions to less time spent planning by hand.", metric: "65%", metricLabel: "less manual planning time", href: "#projects" },
] as const;

export const experience = [
  {
    role: "AI Engineer Intern (Final-Year Project)",
    company: "SORETRAK",
    location: "Kairouan, Tunisia",
    period: "Feb 2026 – June 2026",
    number: "01",
    impact: { value: "0.997", label: "forecast R²" },
    achievements: [
      "Designed and delivered TransportAI, an intelligent public transport management platform integrating a React analytical dashboard, an ML prediction engine, an assisted planning system, and a breakdown management module.",
      "Benchmarked Random Forest, XGBoost, Gradient Boosting, and Linear Regression for operational forecasting; selected Random Forest with R² = 0.997 to support data-driven planning.",
      "Engineered a multilingual RAG assistant with LangChain, ChromaDB, and a locally deployed Ollama LLM, reaching 96% answer faithfulness on a 50-question evaluation set.",
      "Architected a fully on-premise stack with React, FastAPI, Oracle 11g, and Ollama; built the responsive React front end consuming FastAPI REST APIs for data confidentiality and operational autonomy.",
    ],
    tags: ["Predictive ML", "RAG", "React", "FastAPI", "On-premise"],
  },
  {
    role: "AI Engineer Intern",
    company: "Sté Dabba Dabba",
    location: "Monastir, Tunisia",
    period: "June 2025 – Sept 2025",
    number: "02",
    impact: { value: "87%", label: "task accuracy" },
    achievements: [
      "Developed a BERT-based NLP model with 87% task-prioritization accuracy across 10,000+ tasks in an AI-powered task management application built with React/Next.js and the GTD methodology.",
      "Integrated calendar APIs to automate scheduling and cut manual planning time by 65%.",
    ],
    tags: ["BERT", "NLP", "Next.js", "Automation"],
  },
  {
    role: "Data Analytics Intern",
    company: "Maram Company",
    location: "Ksar Hlal, Tunisia",
    period: "June 2024 – July 2024",
    number: "03",
    impact: { value: "60%", label: "faster processing" },
    achievements: [
      "Automated ETL pipelines for financial data with Python and Power BI, reducing processing time by 60%.",
      "Built more than 12 executive KPI dashboards and analyzed over 200,000 financial records to surface trends and anomalies.",
    ],
    tags: ["Python", "ETL", "Power BI", "Analytics"],
  },
] as const;

export type ProjectDomain = "ML" | "NLP" | "CV" | "Web";
export type Project = {
  id: string;
  number: string;
  title: string;
  eyebrow: string;
  description: string;
  domains: ProjectDomain[];
  tags: string[];
  metrics: { value: string; label: string }[];
  details: string[];
  links: { label: string; href: string }[];
  art: "emotion" | "transport" | "security" | "tawa" | "tasks";
};

export const projects: Project[] = [
  {
    id: "vision-llm",
    number: "01",
    title: "Beyond Binary Emotions",
    eyebrow: "Published research · Vision-language models",
    description:
      "A multi-architecture approach to understanding compound facial expressions, from classic CNNs to fine-tuned vision-language models.",
    domains: ["CV", "ML"],
    tags: ["BLIP-2", "LoRA", "LLaVA-1.5", "ViT", "SHAP", "Grad-CAM"],
    metrics: [
      { value: "96.81%", label: "accuracy" },
      { value: "97.91%", label: "macro F1" },
      { value: "14", label: "emotion classes" },
    ],
    details: [
      "Benchmarked ResNet50, ViT, LLaVA-1.5, and BLIP-2 on RAF-CE: 3,618 images across 14 classes.",
      "Fine-tuned BLIP-2 with LoRA, improving accuracy 117% over CNN baselines.",
      "Validated attention on facial action units with Grad-CAM and SHAP and deployed a real-time Streamlit demo.",
      "First-authored the paper presented at the COC 2026 international conference in Senegal.",
    ],
    links: [
      { label: "GitHub repository", href: "https://github.com/RanaRomdhane/Vision-LLM-compound-emotions" },
      { label: "Read the paper", href: "https://github.com/RanaRomdhane/Vision-LLM-compound-emotions/blob/main/article_and_presentations/Article_VLM_COC2026_CR.pdf" },
    ],
    art: "emotion",
  },
  {
    id: "transport-ai",
    number: "02",
    title: "TransportAI",
    eyebrow: "Final-year project · Operational intelligence",
    description:
      "An on-premise public transport platform combining forecasting, assisted planning, breakdown management, and a multilingual AI guide.",
    domains: ["ML", "NLP", "Web"],
    tags: ["Random Forest", "RAG", "LangChain", "ChromaDB", "FastAPI"],
    metrics: [
      { value: "0.997", label: "forecast R²" },
      { value: "96%", label: "RAG faithfulness" },
    ],
    details: [
      "Built a React analytical dashboard, predictive ML engine, assisted planning system, and breakdown management module for SORETRAK.",
      "Evaluated four regression approaches and selected Random Forest for operational forecasting.",
      "Built a multilingual RAG assistant over company knowledge, evaluated on a 50-question set.",
      "Kept data on premise with React, FastAPI, Oracle 11g, and Ollama.",
    ],
    links: [],
    art: "transport",
  },
  {
    id: "intelligent-ids",
    number: "03",
    title: "Intelligent IDS",
    eyebrow: "Machine learning · Cybersecurity",
    description:
      "Real-time intrusion monitoring across eight attack families, with severity-based alerts and an ELK-connected dashboard.",
    domains: ["ML", "Web"],
    tags: ["Random Forest", "SVM", "Neural Networks", "WebSocket", "ELK"],
    metrics: [{ value: "8", label: "attack families" }],
    details: [
      "Compared Random Forest, SVM, and neural networks to identify attacks including DoS/DDoS, brute force, SQL injection, and botnet activity.",
      "Delivered WebSocket traffic monitoring, severity-based alerting, and SIEM integration through the ELK Stack.",
    ],
    links: [{ label: "GitHub repository", href: "https://github.com/RanaRomdhane/intelligent-ids" }],
    art: "security",
  },
  {
    id: "tawa",
    number: "04",
    title: "Tawa Food Kit App",
    eyebrow: "Cross-platform product · React Native",
    description:
      "A food kit delivery experience for iOS, Android, and web, from discovery and cart through ordering and location-based tracking.",
    domains: ["Web"],
    tags: ["React Native", "Expo Router", "TypeScript", "NativeWind", "REST API"],
    metrics: [{ value: "3", label: "platforms" }],
    details: [
      "Built the product catalog, shopping cart, ordering flow, and location-based delivery tracking.",
      "Used Expo Router for file-based navigation and NativeWind for reusable, utility-first UI components.",
      "Integrated the client with a REST API backend.",
    ],
    links: [{ label: "GitHub repository", href: "https://github.com/RanaRomdhane/tawa-food-kit-app-front" }],
    art: "tawa",
  },
  {
    id: "task-prioritization",
    number: "05",
    title: "AI Task Prioritization",
    eyebrow: "NLP · Productivity",
    description:
      "BERT-driven task prioritization and calendar automation in a GTD-inspired management application.",
    domains: ["NLP", "ML", "Web"],
    tags: ["BERT", "Next.js", "Calendar API", "GTD"],
    metrics: [
      { value: "87%", label: "accuracy" },
      { value: "65%", label: "less planning time" },
    ],
    details: [
      "Prioritized more than 10,000 tasks with a BERT model reaching 87% accuracy.",
      "Integrated calendar APIs to automate scheduling and reduce manual planning time by 65%.",
      "Built as part of the Sté Dabba Dabba AI-powered task management application.",
    ],
    links: [],
    art: "tasks",
  },
];

export const publications = [
  {
    type: "Research paper · COC 2026",
    title: "Beyond Binary Emotions: A Multi-Architecture Vision-Language Approach for Compound Facial Expression Recognition",
    description:
      "First-author research presented at the COC 2026 international conference in Senegal; compares CNN, transformer, and vision-language approaches to RAF-CE.",
    href: "https://github.com/RanaRomdhane/Vision-LLM-compound-emotions/blob/main/article_and_presentations/Article_VLM_COC2026_CR.pdf",
    linkLabel: "Read paper",
  },
  {
    type: "Technical writing · June 2024",
    title: "Unraveling the Web of Network Protocols",
    description: "Published in Code Spectrum magazine by the IEEE Computer Society Chapter at ENICarthage.",
    href: "https://drive.google.com/file/d/1T4_PXHWv9CACStAXgCF9J4LabtGOhHQX/view",
    linkLabel: "Read article",
  },
] as const;

export const education = [
  {
    school: "National Engineering School of Carthage (ENICarthage)",
    location: "Charguia 2, Tunisia",
    qualification: "Engineering Degree in Computer Science (Diplôme National d’Ingénieur)",
    period: "Sept 2023 – July 2026",
  },
  {
    school: "Preparatory Institute for Engineering Studies of Monastir",
    location: "Monastir, Tunisia",
    qualification: "Preparatory Studies in Engineering (Physics–Chemistry Track)",
    period: "Sept 2021 – June 2023",
  },
] as const;

export const skillGroups = [
  { title: "Programming", items: ["Python", "Java", "SQL", "JavaScript", "TypeScript"] },
  { title: "Machine learning & deep learning", items: ["PyTorch", "TensorFlow", "Scikit-learn", "XGBoost", "Pandas", "NumPy", "OpenCV", "Computer Vision", "NLP"] },
  { title: "LLMs & generative AI", items: ["RAG pipelines", "LangChain", "ChromaDB", "Vector databases", "Embeddings", "Ollama", "Hugging Face Transformers", "LoRA fine-tuning", "BERT", "SHAP", "Grad-CAM"] },
  { title: "Frontend & web", items: ["React", "Next.js", "React Native (Expo)", "TypeScript", "Tailwind CSS", "HTML/CSS", "REST APIs", "Responsive design"] },
  { title: "Deployment & tools", items: ["Docker", "FastAPI", "Streamlit", "MLOps", "Flask", "Git/GitHub", "CI/CD", "Linux", "Power BI"] },
  { title: "Databases", items: ["Oracle", "PostgreSQL", "MySQL", "MongoDB", "Elasticsearch"] },
] as const;

export const certifications = [
  { title: "Generative AI with Diffusion Models", issuer: "NVIDIA Deep Learning Institute", date: "Dec 2025", href: "https://learn.nvidia.com/certificates?id=W55s_cQ1SyC82Kfsmr7YUw" },
  { title: "Fundamentals of Accelerated Data Science", issuer: "NVIDIA Deep Learning Institute", date: "Dec 2025", href: "https://learn.nvidia.com/certificates?id=gMc0DvVuRb6yeAlbOCb3Lg" },
  { title: "Enhancing Data Science Outcomes with Efficient Workflows", issuer: "NVIDIA Deep Learning Institute", date: "Dec 2025", href: "https://learn.nvidia.com/certificates?id=RhaSDLGyR3yTrrfDk1oxhA" },
  { title: "Artificial Intelligence Fundamentals", issuer: "IBM SkillsBuild / Cisco Networking Academy", date: "Aug 2025", href: "https://www.credly.com/badges/29b7c0ac-77e1-404f-bf1f-d378d48cf115" },
] as const;

export const languages = [
  { name: "Arabic", level: "Native" },
  { name: "English", level: "Advanced · C1" },
  { name: "French", level: "Upper-Intermediate · B2" },
] as const;

export const assistantKnowledge = JSON.stringify({
  profile, highlights, experience, projects, publications, education, skillGroups, certifications, languages,
});
