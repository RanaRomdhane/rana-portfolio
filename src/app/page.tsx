import { Assistant } from "@/components/Assistant";
import { BugHunt, Contact, Footer, VisitPing } from "@/components/Contact";
import { Hero } from "@/components/Hero";
import { Hud } from "@/components/Hud";
import { Projects } from "@/components/Projects";
import { About, Education, Experience, Publications, Skills } from "@/components/Sections";

export default function Home() {
  return (
    <>
      <Hud />
      <main id="main">
        <Hero />
        <About />
        <Experience />
        <Projects />
        <Publications />
        <Education />
        <Skills />
        <Assistant />
        <BugHunt />
        <Contact />
      </main>
      <Footer />
      <VisitPing />
    </>
  );
}
