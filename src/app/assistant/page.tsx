import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { AssistantExperience } from "@/components/AssistantExperience";

export const metadata: Metadata = { title: "AI Twin | Rana Romdhane", description: "Ask Rana Romdhane's AI portfolio twin about her machine learning projects, research, and experience." };

export default function AssistantPage() {
  return <><a className="skip-link" href="#assistant-main">Skip to content</a><SiteHeader /><main id="assistant-main" className="assistant-page"><AssistantExperience /></main></>;
}
