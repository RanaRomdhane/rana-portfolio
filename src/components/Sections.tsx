"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView } from "motion/react";
import { FaArrowUpRightFromSquare, FaCertificate, FaCheck, FaGraduationCap, FaLocationDot, FaScroll, FaTrophy } from "react-icons/fa6";
import { data, type Stat } from "@/lib/data";
import { useGame } from "./GameProvider";
import { Reveal, Section } from "./Section";
import { Monogram, TechChip, TechIcon } from "./TechIcon";

const { profile, experience, publications, education, certifications, skills } = data;

/* ------------------------------ About ------------------------------ */

function StatTile({ stat }: { stat: Stat }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  useEffect(() => {
    if (!inView || !ref.current) return;
    const el = ref.current;
    const controls = animate(0, stat.value, {
      duration: 1.4,
      ease: "easeOut",
      onUpdate: (v) => (el.textContent = v.toFixed(stat.decimals)),
    });
    return () => controls.stop();
  }, [inView, stat]);
  return (
    <div className="pixel-card lift p-4">
      <p className="font-display text-3xl font-bold text-gold" style={{ fontVariantNumeric: "tabular-nums" }}>
        {stat.prefix}
        <span ref={ref}>{stat.value.toFixed(stat.decimals)}</span>
        {stat.suffix}
      </p>
      <p className="mt-1 text-[0.95rem] leading-snug">{stat.label}</p>
      <p className="hud-text mt-2 text-teal">{stat.source}</p>
    </div>
  );
}

export function About() {
  return (
    <Section id="about" level={2} kicker="Character sheet" title="Meet the player" intro="Engineer by training, researcher by curiosity, builder by habit.">
      <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <Reveal>
          <div className="pixel-card p-5">
            <div className="flex items-center gap-4">
              <Image src={profile.photo} alt="" width={96} height={96} className="pixelated h-24 w-24 border-[3px] border-gold" />
              <div>
                <p className="font-display text-2xl font-bold leading-tight">{profile.name}</p>
                <p className="text-teal">{profile.title}</p>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
                  <FaLocationDot aria-hidden className="text-coral" />
                  {profile.location}
                </p>
              </div>
            </div>

            <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 border-t-[3px] border-line pt-4 text-[0.95rem]">
              <dt className="hud-text pt-1 text-muted">Class</dt>
              <dd>AI/ML Engineer</dd>
              <dt className="hud-text pt-1 text-muted">Guild</dt>
              <dd>ENICarthage, Computer Science</dd>
              <dt className="hud-text pt-1 text-muted">Specialty</dt>
              <dd>Vision-Language Models, RAG, predictive modeling</dd>
              <dt className="hud-text pt-1 text-muted">Side skill</dt>
              <dd>React and TypeScript front-ends</dd>
            </dl>

            <div className="mt-5 border-t-[3px] border-line pt-4">
              <p className="hud-text mb-3 text-muted">Languages</p>
              <ul className="space-y-2.5">
                {profile.languages.map((l) => (
                  <li key={l.name} className="flex flex-wrap items-center justify-between gap-2">
                    <span>
                      <b>{l.name}</b> <span className="text-sm text-muted">{l.level}</span>
                    </span>
                    <span className="flex gap-1" role="img" aria-label={`${l.pips} out of 6`}>
                      {Array.from({ length: 6 }, (_, i) => (
                        <motion.span
                          key={i}
                          className={`h-3.5 w-3.5 border-2 border-line ${i < l.pips ? "bg-teal" : "bg-transparent"}`}
                          initial={{ scale: 0 }}
                          whileInView={{ scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.08 * i }}
                        />
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>

        <div>
          <Reveal>
            <p className="text-lg leading-relaxed">{profile.summary}</p>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="hud-text mb-3 mt-8 text-muted">High scores</p>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {profile.stats.map((s) => (
                <StatTile key={s.label} stat={s} />
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}

/* ---------------------------- Experience ---------------------------- */

export function Experience() {
  const { play } = useGame();
  const [openId, setOpenId] = useState<string>(experience[0].id);
  return (
    <Section id="experience" level={3} kicker="Quest log" title="Experience" intro="Three quests completed so far. Open one to see the objectives I cleared." tiled>
      <ol className="relative space-y-6 border-l-[5px] border-dashed border-line pl-7 sm:pl-10">
        {experience.map((e, i) => {
          const open = openId === e.id;
          return (
            <li key={e.id} className={`relative accent-${e.color}`}>
              <span aria-hidden className="absolute -left-[45px] top-6 grid h-8 w-8 place-items-center border-[3px] border-[#171b33] font-hud text-[0.6rem] text-[#171b33] sm:-left-[57px]" style={{ background: "var(--accent)" }}>
                {experience.length - i}
              </span>
              <Reveal delay={i * 0.08}>
                <article className="pixel-card" style={open ? { borderColor: "var(--accent)" } : undefined}>
                  <h3>
                    <button
                      type="button"
                      aria-expanded={open}
                      aria-controls={`quest-${e.id}`}
                      onClick={() => {
                        setOpenId(open ? "" : e.id);
                        play("open");
                      }}
                      className="flex w-full flex-wrap items-center gap-4 p-4 text-left sm:p-5"
                    >
                      <Monogram name={e.company} logo={e.logo} />
                      <span className="min-w-0 flex-1">
                        <span className="block font-display text-2xl font-bold leading-tight">{e.role}</span>
                        <span className="block text-[1.02rem]">
                          <b style={{ color: "var(--accent)" }}>{e.company}</b> · {e.location}
                        </span>
                        <span className="hud-text mt-1.5 block text-muted">{e.period}</span>
                      </span>
                      <span className="flex items-center gap-3">
                        <span className="chip" style={{ borderColor: "var(--accent)" }}>
                          <FaTrophy aria-hidden style={{ color: "var(--accent)" }} /> {e.reward}
                        </span>
                        <span aria-hidden className="hud-text text-lg text-muted">
                          {open ? "−" : "+"}
                        </span>
                      </span>
                    </button>
                  </h3>
                  <motion.div
                    id={`quest-${e.id}`}
                    initial={false}
                    animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                    inert={!open}
                  >
                    <div className="border-t-[3px] border-line p-4 sm:p-5">
                      <p className="mb-3 font-display text-xl font-semibold">{e.headline}</p>
                      <ul className="space-y-2.5">
                        {e.bullets.map((b) => (
                          <li key={b} className="flex gap-3">
                            <FaCheck aria-hidden className="mt-1.5 shrink-0" style={{ color: "var(--accent)" }} />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {e.stack.map((s) => (
                          <TechChip key={s} name={s} />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </article>
              </Reveal>
            </li>
          );
        })}
      </ol>
    </Section>
  );
}

/* --------------------------- Publications --------------------------- */

export function Publications() {
  const { award } = useGame();
  return (
    <Section id="publications" level={5} kicker="Legendary scrolls" title="Publications" intro="Research and writing with my name on it." tiled>
      <div className="grid gap-6 lg:grid-cols-2">
        {publications.map((p, i) => (
          <Reveal key={p.id} delay={i * 0.1}>
            <article className={`pixel-card lift flex h-full flex-col p-5 ${i === 0 ? "accent-gold" : "accent-teal"}`}>
              <div className="flex items-start gap-4">
                <span className="grid h-14 w-14 shrink-0 place-items-center border-[3px] border-[#171b33] text-2xl text-[#171b33]" style={{ background: "var(--accent)" }}>
                  <FaScroll aria-hidden />
                </span>
                <div>
                  <p className="flex flex-wrap gap-2">
                    <span className="chip">{p.type}</span>
                    <span className="chip" style={{ borderColor: "var(--accent)" }}>
                      {p.role}
                    </span>
                  </p>
                  <p className="hud-text mt-2 text-muted">{p.date}</p>
                </div>
              </div>
              <h3 className="mt-4 font-display text-2xl font-bold leading-snug">{p.title}</h3>
              <p className="mt-1 font-semibold" style={{ color: "var(--accent)" }}>
                {p.venue}
              </p>
              <p className="mt-3 flex-1 text-muted">{p.summary}</p>
              <div className="mt-5 flex flex-wrap gap-3">
                {p.links.map((l, j) => (
                  <a
                    key={l.url}
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`btn ${j === 0 ? "btn-gold" : ""}`}
                    onClick={() => award(`read:${p.id}`, 15, "Scroll opened", "Curious mind · +15 coins")}
                  >
                    {l.label} <FaArrowUpRightFromSquare aria-hidden className="text-sm" />
                  </a>
                ))}
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* ---------------------------- Education ---------------------------- */

export function Education() {
  return (
    <Section id="education" level={6} kicker="Training grounds" title="Education and badges" intro="Where I levelled up, and the badges I picked up along the way.">
      <div className="grid gap-6 md:grid-cols-2">
        {education.map((e, i) => (
          <Reveal key={e.id} delay={i * 0.1}>
            <article className={`pixel-card lift flex h-full gap-4 p-5 ${i === 0 ? "accent-teal" : "accent-denim"}`}>
              {e.logo ? (
                <Monogram name={e.school} logo={e.logo} />
              ) : (
                <span className="grid h-14 w-14 shrink-0 place-items-center border-[3px] border-[#171b33] text-2xl text-[#171b33]" style={{ background: "var(--accent)" }}>
                  <FaGraduationCap aria-hidden />
                </span>
              )}
              <div>
                <p className="hud-text text-muted">{e.period}</p>
                <h3 className="mt-1.5 font-display text-2xl font-bold leading-tight">{e.degree}</h3>
                <p className="text-sm text-muted">{e.note}</p>
                <p className="mt-2 font-semibold" style={{ color: "var(--accent)" }}>
                  {e.school}
                </p>
                <p className="flex items-center gap-1.5 text-sm text-muted">
                  <FaLocationDot aria-hidden className="text-coral" /> {e.location}
                </p>
              </div>
            </article>
          </Reveal>
        ))}
      </div>

      <h3 className="mb-5 mt-14 flex items-center gap-3 font-display text-3xl font-bold">
        <FaCertificate aria-hidden className="text-gold" /> Badges unlocked
      </h3>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {certifications.map((c, i) => (
          <Reveal key={c.id} delay={i * 0.07} className="h-full">
            <a href={c.url} target="_blank" rel="noopener noreferrer" className="pixel-card lift group flex h-full flex-col p-4">
              <span className="mb-3 grid h-14 w-14 place-items-center border-[3px] border-line bg-bg2 transition-transform group-hover:rotate-6 group-hover:scale-110">
                <TechIcon name={c.icon} size={30} />
              </span>
              <span className="font-display text-xl font-bold leading-snug">{c.title}</span>
              <span className="mt-1 flex-1 text-sm text-muted">{c.issuer}</span>
              <span className="mt-3 flex items-center justify-between">
                <span className="hud-text text-teal">{c.date}</span>
                <span className="flex items-center gap-1.5 text-sm font-semibold text-gold">
                  Verify <FaArrowUpRightFromSquare aria-hidden className="text-xs" />
                </span>
              </span>
            </a>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* ------------------------------ Skills ------------------------------ */

export function Skills() {
  const { play, award } = useGame();
  const [tab, setTab] = useState(0);
  const group = skills[tab];
  const marquee = skills.flatMap((s) => s.items);

  return (
    <Section id="skills" level={7} kicker="Inventory" title="Skills" intro="Pick a bag to see what is inside." tiled>
      <div role="tablist" aria-label="Skill categories" className="mb-6 flex flex-wrap gap-2.5">
        {skills.map((s, i) => (
          <button
            key={s.category}
            role="tab"
            type="button"
            id={`skill-tab-${i}`}
            aria-selected={tab === i}
            aria-controls="skill-panel"
            tabIndex={tab === i ? 0 : -1}
            onClick={() => {
              setTab(i);
              play("click");
              award("skills:browse", 10, "Inventory inspected", "+10 coins");
            }}
            onKeyDown={(ev) => {
              if (ev.key !== "ArrowRight" && ev.key !== "ArrowLeft") return;
              const next = (i + (ev.key === "ArrowRight" ? 1 : skills.length - 1)) % skills.length;
              setTab(next);
              document.getElementById(`skill-tab-${next}`)?.focus();
            }}
            className={`btn ${tab === i ? "btn-gold" : ""}`}
          >
            <TechIcon name={s.icon} mono size={16} /> {s.category}
            <span className="hud-text opacity-70">{s.items.length}</span>
          </button>
        ))}
      </div>

      <div id="skill-panel" role="tabpanel" aria-labelledby={`skill-tab-${tab}`} className="pixel-card min-h-[280px] p-4 sm:p-6">
        <ul key={group.category} className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {group.items.map((item, i) => (
            <motion.li
              key={item}
              initial={{ opacity: 0, scale: 0.7, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: i * 0.045, type: "spring", stiffness: 380, damping: 22 }}
              whileHover={{ y: -6, rotate: -2 }}
              className="flex min-h-[112px] flex-col items-center justify-center gap-2.5 border-[3px] border-line bg-bg2 p-3 text-center shadow-[inset_-4px_-4px_0_rgba(0,0,0,.14)]"
            >
              <TechIcon name={item} size={34} />
              <span className="text-[0.92rem] font-semibold leading-tight">{item}</span>
            </motion.li>
          ))}
        </ul>
      </div>

      <div aria-hidden className="mt-8 overflow-hidden border-y-[3px] border-line bg-card py-3">
        <div className="flex w-max gap-8 hover:[animation-play-state:paused]" style={{ animation: "marquee 48s linear infinite" }}>
          {[...marquee, ...marquee].map((m, i) => (
            <span key={i} className="flex items-center gap-2 whitespace-nowrap font-display text-lg text-muted">
              <TechIcon name={m} size={20} /> {m}
            </span>
          ))}
        </div>
      </div>
    </Section>
  );
}
