"use client";

import { useEffect, useRef, useState } from "react";
import { FaBug, FaDownload, FaEnvelope, FaGithub, FaLinkedin, FaPaperPlane } from "react-icons/fa6";
import { data } from "@/lib/data";
import { useGame } from "./GameProvider";
import { Reveal, Section } from "./Section";

const { profile } = data;
const FORM_ENDPOINT = "https://formspree.io/f/mljdopbw";

/* ------------------------- Bonus stage: Bug Hunt ------------------------- */

export function BugHunt() {
  const { play, award } = useGame();
  const [running, setRunning] = useState(false);
  const [time, setTime] = useState(20);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [bug, setBug] = useState(-1);
  const [played, setPlayed] = useState(false);

  useEffect(() => {
    try {
      setBest(Number(localStorage.getItem("rr-bughunt")) || 0);
    } catch {}
  }, []);

  useEffect(() => {
    if (!running) return;
    const move = window.setInterval(() => setBug((b) => (b + 1 + Math.floor(Math.random() * 8)) % 9), 720);
    const clock = window.setInterval(() => setTime((t) => t - 1), 1000);
    return () => {
      window.clearInterval(move);
      window.clearInterval(clock);
    };
  }, [running]);

  useEffect(() => {
    if (!running || time > 0) return;
    setRunning(false);
    setBug(-1);
    setPlayed(true);
    play("win");
    setBest((b) => {
      const next = Math.max(b, score);
      try {
        localStorage.setItem("rr-bughunt", String(next));
      } catch {}
      return next;
    });
    if (score >= 8) award("bughunt", 40, "Bug hunter!", "Bonus stage cleared · +40 coins");
  }, [time, running, score, play, award]);

  const start = () => {
    setScore(0);
    setTime(20);
    setBug(Math.floor(Math.random() * 9));
    setRunning(true);
    play("open");
  };

  return (
    <section aria-labelledby="bonus-title" className="px-4 py-16">
      <Reveal className="mx-auto max-w-3xl">
        <div className="pixel-card grid items-center gap-6 p-5 sm:grid-cols-[1fr_auto] sm:p-7" style={{ borderColor: "var(--coral)" }}>
          <div>
            <p className="hud-text text-coral">Bonus stage</p>
            <h2 id="bonus-title" className="mt-2 font-display text-3xl font-bold">
              Bug Hunt
            </h2>
            <p className="mt-1 text-muted">Every model has bugs before it ships. Squash 8 in 20 seconds to win 40 coins.</p>
            <p className="hud-text mt-4 flex flex-wrap gap-x-5 gap-y-2" aria-live="polite">
              <span>
                Time <b className="text-gold">{time}s</b>
              </span>
              <span>
                Score <b className="text-teal">{score}</b>
              </span>
              <span>
                Best <b className="text-coral">{best}</b>
              </span>
            </p>
            {!running && (
              <button type="button" className="btn btn-gold mt-5" onClick={start}>
                <FaBug aria-hidden /> {played ? "Play again" : "Start hunting"}
              </button>
            )}
            {played && !running && <p className="mt-3 font-display text-lg">{score >= 8 ? "Clean build. Ship it!" : `You squashed ${score}. So close, try again!`}</p>}
          </div>
          <div className="mx-auto grid grid-cols-3 gap-2" role="group" aria-label="Bug hunt board">
            {Array.from({ length: 9 }, (_, i) => (
              <button
                key={i}
                type="button"
                disabled={!running}
                aria-label={bug === i ? "Bug! Squash it" : "Empty tile"}
                onClick={() => {
                  if (bug !== i) return play("bump");
                  setScore((s) => s + 1);
                  setBug(-1);
                  play("coin");
                }}
                className="grid h-[72px] w-[72px] place-items-center border-[3px] border-line bg-bg2 text-3xl shadow-[inset_-4px_-4px_0_rgba(0,0,0,.16)] disabled:opacity-60"
              >
                {bug === i && <FaBug aria-hidden className="text-coral" style={{ animation: "bump 0.3s ease-out" }} />}
              </button>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ------------------------------ Contact ------------------------------ */

type Fields = { name: string; email: string; subject: string; message: string };
const EMPTY: Fields = { name: "", email: "", subject: "", message: "" };

function validate(field: keyof Fields, value: string): string {
  const v = value.trim();
  if (field === "name") return v.length >= 2 ? "" : "Tell me your name so I know who is writing.";
  if (field === "email") return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? "" : "Enter an email like name@example.com so I can reply.";
  if (field === "message") return v.length >= 10 ? "" : "Write at least a short sentence (10 characters).";
  return "";
}

export function Contact() {
  const { award, play } = useGame();
  const [values, setValues] = useState<Fields>(EMPTY);
  const [errors, setErrors] = useState<Partial<Fields>>({});
  const [state, setState] = useState<"idle" | "sending" | "sent" | "failed">("idle");
  const trap = useRef<HTMLInputElement>(null);

  // Keep a draft so a refresh does not lose the message.
  useEffect(() => {
    try {
      const d = JSON.parse(sessionStorage.getItem("rr-draft") || "null");
      if (d) setValues({ ...EMPTY, ...d });
    } catch {}
  }, []);

  const set = (field: keyof Fields, value: string) => {
    const next = { ...values, [field]: value };
    setValues(next);
    if (errors[field]) setErrors((e) => ({ ...e, [field]: "" }));
    try {
      sessionStorage.setItem("rr-draft", JSON.stringify(next));
    } catch {}
  };
  const blur = (field: keyof Fields) => setErrors((e) => ({ ...e, [field]: validate(field, values[field]) }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const found: Partial<Fields> = {};
    (Object.keys(values) as (keyof Fields)[]).forEach((k) => {
      const msg = validate(k, values[k]);
      if (msg) found[k] = msg;
    });
    setErrors(found);
    const first = Object.keys(found)[0];
    if (first) {
      document.getElementById(`contact-${first}`)?.focus();
      play("error");
      return;
    }
    if (trap.current?.value) return setState("sent"); // spam bots fill the hidden field
    setState("sending");
    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ ...values, _subject: values.subject || `Portfolio message from ${values.name}` }),
      });
      if (!res.ok) throw new Error("send failed");
      setState("sent");
      setValues(EMPTY);
      try {
        sessionStorage.removeItem("rr-draft");
      } catch {}
      play("win");
      award("contact", 50, "Message delivered!", "Thanks for reaching out · +50 coins");
    } catch {
      setState("failed");
      play("error");
    }
  };

  const field = (name: keyof Fields, label: string, opts: { type?: string; required?: boolean; area?: boolean; autoComplete?: string; hint?: string } = {}) => {
    const id = `contact-${name}`;
    const err = errors[name];
    const common = {
      id,
      name,
      value: values[name],
      required: opts.required,
      autoComplete: opts.autoComplete,
      "aria-invalid": err ? true : undefined,
      "aria-describedby": err ? `${id}-error` : undefined,
      onBlur: () => blur(name),
      onChange: (ev: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => set(name, ev.target.value),
      className: `w-full border-[3px] bg-bg2 px-3 py-2.5 ${err ? "border-coral" : "border-line"}`,
    };
    return (
      <div className={opts.area ? "sm:col-span-2" : ""}>
        <label htmlFor={id} className="mb-1.5 block font-display text-lg font-semibold">
          {label} {!opts.required && <span className="text-sm font-normal text-muted">(optional)</span>}
        </label>
        {opts.area ? <textarea rows={5} maxLength={4000} {...common} /> : <input type={opts.type || "text"} maxLength={160} {...common} />}
        {err && (
          <p id={`${id}-error`} role="alert" className="mt-1.5 text-[0.95rem] text-coral">
            {err}
          </p>
        )}
      </div>
    );
  };

  return (
    <Section id="contact" level={9} kicker="Final stage" title="Let's team up" model="heart" intro="Have a role, a project or a question? Send a message and it lands straight in my inbox." tiled>
      <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
        <Reveal>
          {state === "sent" ? (
            <div className="pixel-card p-8 text-center" role="status" style={{ borderColor: "var(--teal)" }}>
              <p className="hud-text text-teal">Quest complete</p>
              <p className="mt-3 font-display text-4xl font-bold">Message delivered!</p>
              <p className="mt-2 text-muted">Thank you. I read every message and will reply as soon as I can.</p>
              <button type="button" className="btn mt-6" onClick={() => setState("idle")}>
                Write another message
              </button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="pixel-card grid gap-5 p-5 sm:grid-cols-2 sm:p-7">
              {field("name", "Your name", { required: true, autoComplete: "name" })}
              {field("email", "Your email", { required: true, type: "email", autoComplete: "email" })}
              <div className="sm:col-span-2">{field("subject", "Subject")}</div>
              {field("message", "Message", { required: true, area: true })}
              <input ref={trap} type="text" name="_gotcha" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
              {state === "failed" && (
                <p role="alert" className="border-[3px] border-coral bg-bg2 px-3 py-2 sm:col-span-2">
                  The message could not be sent. Your text is still here: try again, or email me at{" "}
                  <a className="font-semibold underline" href={`mailto:${profile.email}`}>
                    {profile.email}
                  </a>
                  .
                </p>
              )}
              <div className="sm:col-span-2">
                <button type="submit" className="btn btn-gold w-full sm:w-auto" disabled={state === "sending"}>
                  <FaPaperPlane aria-hidden /> {state === "sending" ? "Sending…" : "Send message"}
                </button>
              </div>
            </form>
          )}
        </Reveal>

        <Reveal delay={0.1}>
          <ul className="space-y-4">
            <li>
              <a href={`mailto:${profile.email}`} className="pixel-card lift flex items-center gap-4 p-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center border-[3px] border-[#171b33] bg-coral text-xl text-[#171b33]">
                  <FaEnvelope aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="hud-text block text-muted">Email</span>
                  <span className="block break-all font-semibold">{profile.email}</span>
                </span>
              </a>
            </li>
            <li>
              <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="pixel-card lift flex items-center gap-4 p-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center border-[3px] border-[#171b33] bg-denim text-xl text-[#171b33]">
                  <FaLinkedin aria-hidden />
                </span>
                <span>
                  <span className="hud-text block text-muted">LinkedIn</span>
                  <span className="block font-semibold">Rana Romdhane</span>
                </span>
              </a>
            </li>
            <li>
              <a href={profile.github} target="_blank" rel="noopener noreferrer" className="pixel-card lift flex items-center gap-4 p-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center border-[3px] border-[#171b33] bg-teal text-xl text-[#171b33]">
                  <FaGithub aria-hidden />
                </span>
                <span>
                  <span className="hud-text block text-muted">GitHub</span>
                  <span className="block font-semibold">@RanaRomdhane</span>
                </span>
              </a>
            </li>
            <li>
              <a href={profile.resume} download className="btn btn-gold w-full" onClick={() => award("resume", 20, "Loot collected!", "CV downloaded · +20 coins")}>
                <FaDownload aria-hidden /> Download my CV
              </a>
            </li>
          </ul>
        </Reveal>
      </div>
    </Section>
  );
}

export function Footer() {
  const { coins } = useGame();
  return (
    <footer className="px-4 pb-20 pt-12 text-center">
      <p className="hud-text text-gold">Thanks for playing</p>
      <p className="mt-3 font-display text-2xl font-bold">
        You collected <span className="text-gold">{coins}</span> coins on this run.
      </p>
      <p className="mt-2 text-muted">
        © {new Date().getFullYear()} {profile.name}. Designed and built with care in Tunisia.
      </p>
      <a href="#home" className="btn mt-6">
        ▲ Back to the start
      </a>
    </footer>
  );
}

/** Quietly reports one visit per browser session. */
export function VisitPing() {
  useEffect(() => {
    try {
      if (sessionStorage.getItem("rr-seen")) return;
      sessionStorage.setItem("rr-seen", "1");
      const visits = (Number(localStorage.getItem("rr-visits")) || 0) + 1;
      localStorage.setItem("rr-visits", String(visits));
      let referrer = "";
      try {
        referrer = document.referrer ? new URL(document.referrer).hostname : "";
      } catch {}
      void fetch("/api/visit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visits, referrer, lang: navigator.language, tz: Intl.DateTimeFormat().resolvedOptions().timeZone }),
        keepalive: true,
      }).catch(() => {});
    } catch {
      /* storage blocked: skip silently */
    }
  }, []);
  return null;
}
