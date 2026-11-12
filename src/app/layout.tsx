import type { Metadata, Viewport } from "next";
import { Outfit, Pixelify_Sans, Press_Start_2P } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { GameProvider } from "@/components/GameProvider";
import { data, SITE_URL } from "@/lib/data";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit", display: "swap" });
const pixelify = Pixelify_Sans({ subsets: ["latin"], variable: "--font-pixelify", display: "swap" });
const press = Press_Start_2P({ subsets: ["latin"], weight: "400", variable: "--font-press", display: "swap" });

const { profile } = data;
const description =
  "Portfolio of Rana Romdhane, AI/ML Engineer and published Vision-Language Model researcher. Explore projects in machine learning, computer vision, NLP and LLMs, and chat with her AI twin.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${profile.name} | ${profile.title}`,
    template: `%s | ${profile.name}`,
  },
  description,
  keywords: [
    "Rana Romdhane",
    "AI Engineer",
    "ML Engineer",
    "Machine Learning",
    "Computer Vision",
    "NLP",
    "LLM",
    "RAG",
    "Vision-Language Models",
    "Tunisia",
    "Portfolio",
  ],
  authors: [{ name: profile.name, url: profile.linkedin }],
  creator: profile.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: `${profile.name} | ${profile.title}`,
    description,
    siteName: `${profile.name} Portfolio`,
    images: [{ url: profile.photo, width: 1024, height: 1024, alt: `Pixel art portrait of ${profile.name}` }],
  },
  twitter: {
    card: "summary",
    title: `${profile.name} | ${profile.title}`,
    description,
    images: [profile.photo],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0f22" },
    { media: "(prefers-color-scheme: light)", color: "#f6f0df" },
  ],
};

// Runs before paint so the saved theme never flashes.
const themeScript = `(function(){try{var t=localStorage.getItem("rr-theme");if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"}document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme="dark"}})();`;

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  jobTitle: profile.title,
  url: SITE_URL,
  image: `${SITE_URL}${profile.photo}`,
  email: `mailto:${profile.email}`,
  address: { "@type": "PostalAddress", addressLocality: "Ariana", addressCountry: "TN" },
  alumniOf: data.education.map((e) => ({ "@type": "CollegeOrUniversity", name: e.school })),
  sameAs: [profile.linkedin, profile.github],
  knowsAbout: ["Machine Learning", "Computer Vision", "Natural Language Processing", "Large Language Models", "RAG", "React"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning className={`${outfit.variable} ${pixelify.variable} ${press.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body>
        <a
          href="#main"
          className="btn btn-gold fixed left-3 top-3 z-[100] -translate-y-24 focus:translate-y-0"
        >
          Skip to content
        </a>
        <GameProvider>{children}</GameProvider>
        <Analytics />
      </body>
    </html>
  );
}
