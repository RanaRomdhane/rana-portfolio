"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { FaArrowUpRightFromSquare, FaEnvelope, FaFilePdf, FaGithub, FaLinkedin, FaMicrophone, FaPaperPlane, FaStop, FaVolumeHigh, FaVolumeXmark } from "react-icons/fa6";
import { data } from "@/lib/data";
import { useGame } from "./GameProvider";
import { Reveal, Section } from "./Section";

const { profile } = data;

type Status = "idle" | "listening" | "transcribing" | "thinking" | "speaking";
interface Msg {
  role: "user" | "assistant";
  content: string;
}

const GREETING = "Hi, I'm Rana's AI twin! Ask me about my projects, my research or my experience. You can type, or press the microphone and just talk.";
const SUGGESTIONS = [
  "Tell me about your published paper",
  "What is TransportAI?",
  "Which tools do you use to build LLM apps?",
  "What makes you a strong AI engineer?",
];
const STATUS_LABEL: Record<Status, string> = {
  idle: "Ready to chat",
  listening: "Listening…",
  transcribing: "Got it, one second…",
  thinking: "Thinking…",
  speaking: "Speaking…",
};
// A few milliseconds of silence, used to unlock audio playback on the first tap (needed on iPhone).
const SILENCE = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=";

const LINK = /(https?:\/\/[^\s<>"']+|[\w.+-]+@[\w-]+\.[\w.-]+)/g;

function splitTail(raw: string): [string, string] {
  const m = raw.match(/[.,;:!?)\]]+$/);
  return m ? [raw.slice(0, -m[0].length), m[0]] : [raw, ""];
}

function linkLabel(url: string) {
  if (!url.startsWith("http")) return { text: url, Icon: FaEnvelope };
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    const last = decodeURIComponent(u.pathname.split("/").filter(Boolean).pop() || "");
    if (/\.pdf$/i.test(last)) return { text: "Read the paper (PDF)", Icon: FaFilePdf };
    if (host === "github.com") return { text: last ? `GitHub: ${last}` : "GitHub", Icon: FaGithub };
    if (host.endsWith("linkedin.com")) return { text: "LinkedIn profile", Icon: FaLinkedin };
    return { text: host, Icon: FaArrowUpRightFromSquare };
  } catch {
    return { text: "Open link", Icon: FaArrowUpRightFromSquare };
  }
}

/** Shows a reply with links turned into tidy buttons instead of long raw addresses. */
function RichText({ text }: { text: string }) {
  return (
    <>
      {text.split(LINK).map((part, i) => {
        if (i % 2 === 0) return part;
        const [url, tail] = splitTail(part);
        const { text: label, Icon } = linkLabel(url);
        return (
          <span key={i}>
            <a
              href={url.startsWith("http") ? url : `mailto:${url}`}
              target={url.startsWith("http") ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="mx-0.5 my-1 inline-flex max-w-full items-center gap-2 border-2 border-teal bg-card px-2.5 py-1 align-middle text-[0.92rem] font-semibold text-teal hover:bg-teal hover:text-[var(--on-accent)]"
            >
              <Icon aria-hidden className="shrink-0" />
              <span className="truncate">{label}</span>
            </a>
            {tail}
          </span>
        );
      })}
    </>
  );
}

/** What the voice says: the same reply without web addresses or emails. */
function speechText(text: string) {
  return text
    .replace(LINK, (m) => splitTail(m)[1])
    .replace(/\s*[:,(]\s*([.!?])/g, "$1")
    .replace(/\s+([.,!?])/g, "$1")
    .replace(/\s{2,}/g, " ")
    .replace(/\s*[:,(]\s*$/, ".")
    .trim();
}

export function Assistant() {
  const { award, play } = useGame();
  const [messages, setMessages] = useState<Msg[]>([{ role: "assistant", content: GREETING }]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [voice, setVoice] = useState(true);
  const [error, setError] = useState("");

  const listRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const unlocked = useRef(false);
  const abortRef = useRef<AbortController | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const recTimer = useRef<number>(0);
  const voiceRef = useRef(true);
  const speaking = status === "speaking";
  const busy = status === "thinking" || status === "transcribing";

  useEffect(() => {
    try {
      if (localStorage.getItem("rr-voice") === "off") {
        setVoice(false);
        voiceRef.current = false;
      }
    } catch {}
    return () => {
      abortRef.current?.abort();
      audioRef.current?.pause();
      window.speechSynthesis?.cancel();
      window.clearTimeout(recTimer.current);
    };
  }, []);

  // Keep the newest message in view.
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, status]);

  // Cross-fade: play the talking clip only while the voice is speaking.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (speaking) void v.play().catch(() => {});
    else {
      const t = window.setTimeout(() => v.pause(), 700);
      return () => window.clearTimeout(t);
    }
  }, [speaking]);

  const getAudio = () => {
    if (!audioRef.current) audioRef.current = new Audio();
    return audioRef.current;
  };

  const unlockAudio = () => {
    if (unlocked.current) return;
    unlocked.current = true;
    const a = getAudio();
    a.src = SILENCE;
    void a.play().catch(() => {});
  };

  const stopSpeaking = useCallback(() => {
    audioRef.current?.pause();
    window.speechSynthesis?.cancel();
    setStatus((s) => (s === "speaking" ? "idle" : s));
  }, []);

  const browserSpeak = (text: string) => {
    if (!("speechSynthesis" in window)) return setStatus("idle");
    const u = new SpeechSynthesisUtterance(text);
    u.lang = /[؀-ۿ]/.test(text) ? "ar" : /\b(je|est|une|les|mon|pour|avec)\b/i.test(text) ? "fr-FR" : "en-US";
    u.onend = u.onerror = () => setStatus("idle");
    setStatus("speaking");
    window.speechSynthesis.speak(u);
  };

  const speak = async (text: string, signal: AbortSignal) => {
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
        signal,
      });
      if (!res.ok) throw new Error("voice");
      const url = URL.createObjectURL(await res.blob());
      const a = getAudio();
      a.onended = a.onerror = () => {
        URL.revokeObjectURL(url);
        setStatus((s) => (s === "speaking" ? "idle" : s));
      };
      a.src = url;
      setStatus("speaking");
      await a.play();
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      browserSpeak(text);
    }
  };

  const send = async (raw: string) => {
    const text = raw.trim();
    if (!text || busy) return;
    unlockAudio();
    stopSpeaking();
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setError("");
    setInput("");
    play("click");
    award("ai:first", 25, "First contact!", "You talked to the AI twin · +25 coins");

    const history: Msg[] = [...messages, { role: "user", content: text }];
    setMessages([...history, { role: "assistant", content: "" }]);
    setStatus("thinking");

    let answer = "";
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history.slice(1) }),
        signal: ctrl.signal,
      });
      if (!res.ok || !res.body) {
        const j = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(j?.error || "Something went wrong. Please try again.");
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        answer += decoder.decode(value, { stream: true });
        const snapshot = answer;
        setMessages((m) => [...m.slice(0, -1), { role: "assistant", content: snapshot }]);
      }
      if (!answer.trim()) throw new Error("I lost my train of thought. Could you ask again?");
      const spoken = speechText(answer);
      if (voiceRef.current && spoken) await speak(spoken, ctrl.signal);
      else setStatus("idle");
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      setMessages((m) => (m[m.length - 1]?.content ? m : m.slice(0, -1)));
      setError((e as Error).message || "Something went wrong. Please try again.");
      setStatus("idle");
      play("error");
    }
  };

  const toggleMic = async () => {
    if (status === "listening") {
      recorderRef.current?.stop();
      return;
    }
    if (busy) return;
    unlockAudio();
    stopSpeaking();
    setError("");
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setError("Voice input is not supported in this browser. You can type your question instead.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
      rec.onstop = async () => {
        window.clearTimeout(recTimer.current);
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunks, { type: rec.mimeType || "audio/webm" });
        setStatus("transcribing");
        try {
          const form = new FormData();
          form.append("audio", blob, `voice.${blob.type.includes("mp4") ? "mp4" : "webm"}`);
          const res = await fetch("/api/stt", { method: "POST", body: form });
          const j = (await res.json()) as { text?: string; error?: string };
          if (!res.ok || !j.text) throw new Error(j.error || "I could not hear anything. Try again?");
          setStatus("idle");
          void send(j.text);
        } catch (e) {
          setError((e as Error).message);
          setStatus("idle");
        }
      };
      recorderRef.current = rec;
      rec.start();
      setStatus("listening");
      play("open");
      recTimer.current = window.setTimeout(() => rec.state === "recording" && rec.stop(), 30_000);
    } catch {
      setError("I need microphone permission to hear you. Allow it in your browser, or type instead.");
    }
  };

  const toggleVoice = () => {
    const next = !voice;
    setVoice(next);
    voiceRef.current = next;
    if (!next) stopSpeaking();
    try {
      localStorage.setItem("rr-voice", next ? "on" : "off");
    } catch {}
  };

  return (
    <Section id="assistant" level={8} kicker="Boss room" title="Talk to my AI twin" intro="She knows my whole CV and answers in my own voice. Ask anything about my work.">
      <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        {/* Avatar: portrait and talking clip stacked, cross-fading over 700ms */}
        <Reveal>
          <div className="pixel-card mx-auto max-w-sm p-3" style={{ borderColor: speaking ? "var(--gold)" : undefined }}>
            <div className="scanlines relative aspect-square overflow-hidden border-[3px] border-line bg-bg2">
              {profile.idleVideo ? (
                <video src={profile.idleVideo} poster={profile.photo} autoPlay muted loop playsInline aria-hidden className="absolute inset-0 h-full w-full object-cover" />
              ) : (
                <Image src={profile.photo} alt="Rana's AI twin, a pixel art portrait" fill sizes="(max-width: 1024px) 90vw, 380px" className="pixelated breathe object-cover" />
              )}
              <video
                ref={videoRef}
                src={profile.talkingVideo}
                muted
                loop
                playsInline
                preload="auto"
                aria-hidden
                className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-in-out"
                style={{ opacity: speaking ? 1 : 0 }}
              />
            </div>

            <div className="flex items-center justify-between gap-3 px-1 pb-1 pt-3">
              <p role="status" className="hud-text flex items-center gap-2.5">
                <span
                  aria-hidden
                  className={`h-3 w-3 rounded-full ${status === "listening" ? "bg-coral" : status === "idle" ? "bg-teal" : "bg-gold"}`}
                  style={status === "listening" ? { animation: "pulse-ring 1.2s infinite" } : undefined}
                />
                {STATUS_LABEL[status]}
              </p>
              <span aria-hidden className="flex h-5 items-end gap-[3px]">
                {[0, 1, 2, 3, 4].map((i) => (
                  <span key={i} className="w-1.5 bg-gold" style={{ height: "20%", animation: speaking ? `eq 0.${5 + i}s ease-in-out ${i * 0.07}s infinite` : undefined }} />
                ))}
              </span>
            </div>
            <div className="mt-2 flex gap-2">
              <button type="button" className="btn flex-1" onClick={toggleVoice} aria-pressed={voice}>
                {voice ? <FaVolumeHigh aria-hidden /> : <FaVolumeXmark aria-hidden />} Voice {voice ? "on" : "off"}
              </button>
              {speaking && (
                <button type="button" className="btn" onClick={stopSpeaking}>
                  <FaStop aria-hidden /> Stop
                </button>
              )}
            </div>
          </div>
          <p className="mx-auto mt-4 max-w-sm text-center text-sm text-muted">
            This is an AI version of me. It answers from my CV, so please confirm anything important with me directly.
          </p>
        </Reveal>

        {/* Chat */}
        <Reveal delay={0.1}>
          <div className="pixel-card flex h-[560px] max-h-[78svh] flex-col">
            <div ref={listRef} role="log" aria-live="polite" aria-label="Conversation" tabIndex={0} className="scroll-thin flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    dir="auto"
                    className={`max-w-[85%] whitespace-pre-wrap break-words border-[3px] px-4 py-2.5 ${
                      m.role === "user" ? "border-[#171b33] bg-gold text-[#171b33]" : "border-line bg-bg2"
                    }`}
                  >
                    <span className="sr-only">{m.role === "user" ? "You: " : "Rana's AI: "}</span>
                    {m.content ? (
                      m.role === "assistant" ? <RichText text={m.content} /> : m.content
                    ) : (
                      <span aria-label="Thinking" className="flex gap-1.5 py-2">
                        {[0, 1, 2].map((d) => (
                          <span key={d} className="h-2.5 w-2.5 bg-teal" style={{ animation: `bob 0.7s ease-in-out ${d * 0.14}s infinite` }} />
                        ))}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {messages.length === 1 && (
              <div className="flex flex-wrap gap-2 px-4 pb-3 sm:px-5">
                {SUGGESTIONS.map((s) => (
                  <button key={s} type="button" className="chip cursor-pointer whitespace-normal py-1.5 text-left hover:border-teal" onClick={() => void send(s)}>
                    {s}
                  </button>
                ))}
              </div>
            )}

            {error && (
              <p role="alert" className="mx-4 mb-3 border-[3px] border-coral bg-bg2 px-3 py-2 text-[0.95rem] sm:mx-5">
                {error}
              </p>
            )}

            <form
              className="flex gap-2 border-t-[3px] border-line p-3 sm:p-4"
              onSubmit={(e) => {
                e.preventDefault();
                void send(input);
              }}
            >
              <button
                type="button"
                onClick={() => void toggleMic()}
                disabled={busy}
                aria-pressed={status === "listening"}
                aria-label={status === "listening" ? "Stop recording and send" : "Ask with your voice"}
                className={`btn btn-icon h-12 w-12 shrink-0 ${status === "listening" ? "!bg-coral !text-[#171b33]" : ""}`}
              >
                {status === "listening" ? <FaStop aria-hidden /> : <FaMicrophone aria-hidden />}
              </button>
              <label htmlFor="chat-input" className="sr-only">
                Your question
              </label>
              <input
                id="chat-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                maxLength={600}
                autoComplete="off"
                placeholder={status === "listening" ? "Listening… press stop when done" : "Ask about my projects…"}
                className="h-12 min-w-0 flex-1 border-[3px] border-line bg-bg2 px-3 placeholder:text-muted"
              />
              <button type="submit" disabled={busy || !input.trim()} className="btn btn-gold h-12 shrink-0" aria-label="Send question">
                <FaPaperPlane aria-hidden /> <span className="hidden sm:inline">Send</span>
              </button>
            </form>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
