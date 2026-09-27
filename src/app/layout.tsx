import type { Metadata, Viewport } from "next";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/dm-sans/600.css";
import "@fontsource/dm-sans/700.css";
import "@fontsource/space-grotesk/400.css";
import "@fontsource/space-grotesk/500.css";
import "@fontsource/space-grotesk/600.css";
import "@fontsource/space-grotesk/700.css";
import "@fontsource/dm-mono/400.css";
import "@fontsource/dm-mono/500.css";
import "./globals.css";
import "./redesign.css";
import "./refinement.css";

const origin = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(origin),
  title: { default: "Rana Romdhane — AI/ML Engineer", template: "%s | Rana Romdhane" },
  description: "Rana Romdhane is an AI/ML engineer in Tunisia building machine learning, computer vision, NLP, and LLM-powered experiences. Explore her research and projects.",
  applicationName: "Rana Romdhane Portfolio",
  keywords: ["Rana Romdhane", "AI engineer", "machine learning", "computer vision", "NLP", "Tunisia", "Vision-LLM", "RAG"],
  authors: [{ name: "Rana Romdhane" }],
  creator: "Rana Romdhane",
  alternates: { canonical: "/" },
  openGraph: { type: "website", title: "Rana Romdhane — AI/ML Engineer", description: "Research-minded AI. Human-centered products. Explore Rana Romdhane's work and meet her AI twin.", url: "/", images: [{ url: "/media/rana-profile.jpg", width: 1024, height: 1024, alt: "Pixel art portrait of Rana Romdhane" }] },
  twitter: { card: "summary_large_image", title: "Rana Romdhane — AI/ML Engineer", description: "Research-minded AI. Human-centered products.", images: ["/media/rana-profile.jpg"] },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#101927" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" data-theme="dark" data-scroll-behavior="smooth"><body>{children}</body></html>;
}
