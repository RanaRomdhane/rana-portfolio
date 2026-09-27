"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, ReactNode, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowUpRight, Mic, MicOff, Send, Sparkles, Square, Volume2, VolumeX } from "lucide-react";

type Message = { role: "user" | "assistant"; content: string; fallback?: boolean };
const prompts = ["Which project best shows your computer vision work?", "How did TransportAI improve planning?", "Explain your research in simple terms", "Where did your AI work create measurable impact?"];

function MessageText({ text }: { text: string }) {
  const plain = text.replace(/\[([^\]]+)\]\((https:\/\/[^\s)]+)\)/g, "$1 — $2").replace(/\*\*/g, "");
  return <>{plain.split(/(https:\/\/[^\s]+)/g).map((part, index) => part.startsWith("https://") ? <a key={index} href={part} target="_blank" rel="noopener noreferrer">{part}</a> : <span key={index}>{part}</span>)}</>;
}

export function AssistantExperience({ embedded = false, intro }: { embedded?: boolean; intro?: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [responding, setResponding] = useState(false);
  const [notice, setNotice] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [messages, busy]);
  useEffect(() => () => {
    abortRef.current?.abort();
    recorderRef.current?.stream.getTracks().forEach((track) => track.stop());
    audioRef.current?.pause();
    if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);
  const avatarTalking = speaking || (!voiceMode && responding);
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (avatarTalking) { video.currentTime = 0; void video.play().catch(() => {}); }
    else { video.pause(); video.currentTime = 0; }
  }, [avatarTalking]);

  function stopAudio() {
    audioRef.current?.pause();
    audioRef.current = null;
    if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    audioUrlRef.current = null;
    setSpeaking(false);
  }

  async function speak(text: string) {
    try {
      const response = await fetch("/api/speech", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: text.slice(0, 1000) }) });
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error || "Voice is unavailable. The answer is still here in text.");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audioUrlRef.current = url;
      audio.onended = stopAudio;
      audio.onerror = () => { stopAudio(); setNotice("Audio playback failed. The answer is still available above."); };
      await audio.play();
      setSpeaking(true);
    } catch (error) {
      stopAudio();
      setNotice(error instanceof Error ? error.message : "Voice is unavailable. The answer is still available as text.");
    }
  }

  async function sendMessage(text: string) {
    const question = text.trim();
    if (!question || busy || transcribing) return;
    stopAudio();
    setNotice("");
    setInput("");
    setBusy(true);
    setResponding(false);
    const history: Message[] = [...messages, { role: "user" as const, content: question }].slice(-12);
    setMessages((previous) => [...previous, { role: "user" as const, content: question }, { role: "assistant" as const, content: "" }]);
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const response = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: history.map(({ role, content }) => ({ role, content })) }), signal: controller.signal });
      if (!response.ok || !response.body) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error || "The assistant could not answer right now.");
      }
      const fallback = response.headers.get("X-Portfolio-Fallback") === "true";
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let complete = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        complete += decoder.decode(value, { stream: true });
        if (!voiceMode) setResponding(true);
        const currentText = complete;
        setMessages((previous) => previous.map((item, index) => index === previous.length - 1 ? { role: "assistant", content: currentText, fallback } : item));
      }
      if (!complete.trim()) throw new Error("The assistant returned an empty answer. Please try again.");
      if (voiceMode && !fallback) await speak(complete.replace(/\[([^\]]+)\]\(https:\/\/[^\s)]+\)/g, "$1").replace(/\*\*/g, ""));
    } catch (error) {
      if (controller.signal.aborted) return;
      const reason = error instanceof Error ? error.message : "The assistant could not answer right now.";
      setMessages((previous) => previous.map((item, index) => index === previous.length - 1 ? { role: "assistant", content: `${reason} You can still explore the projects below or contact Rana directly.` } : item));
    } finally { setBusy(false); setResponding(false); abortRef.current = null; }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); void sendMessage(input); }

  async function startRecording() {
    setNotice("");
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") { setNotice("Microphone recording is unavailable in this browser. Please type your question."); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = ["audio/webm;codecs=opus", "audio/mp4", "audio/webm", "audio/ogg"].find((type) => MediaRecorder.isTypeSupported(type));
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      const chunks: BlobPart[] = [];
      recorderRef.current = recorder;
      recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        if (timerRef.current) clearTimeout(timerRef.current);
        setRecording(false);
        if (chunks.length === 0) { setNotice("No audio was captured. Please try again."); return; }
        setTranscribing(true);
        try {
          const blob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
          if (blob.size > 4_000_000) throw new Error("Recording is too large. Please ask a shorter question.");
          const extension = blob.type.includes("mp4") ? "mp4" : blob.type.includes("ogg") ? "ogg" : "webm";
          const body = new FormData();
          body.append("audio", blob, `question.${extension}`);
          const response = await fetch("/api/transcribe", { method: "POST", body });
          const result = await response.json();
          if (!response.ok) throw new Error(result.error || "Could not understand the recording.");
          setInput(result.text);
          setNotice("Transcription ready. Review it, then press send.");
        } catch (error) { setNotice(error instanceof Error ? error.message : "Could not transcribe the recording."); }
        finally { setTranscribing(false); }
      };
      recorder.start();
      setRecording(true);
      timerRef.current = setTimeout(() => recorder.state === "recording" && recorder.stop(), 15000);
    } catch { setNotice("Microphone access was denied. Please type your question."); }
  }

  function stopRecording() { if (recorderRef.current?.state === "recording") recorderRef.current.stop(); }

  return <div className={`assistant-layout page-shell ${embedded ? "assistant-embedded" : ""}`}>
    <div className="assistant-left">{intro}{!embedded && <Link href="/" className="assistant-back"><ArrowLeft size={16} aria-hidden="true" /> BACK TO PORTFOLIO</Link>}{!embedded && <div className="assistant-heading"><span className="eyebrow">AN INTERACTIVE INTRODUCTION</span><h1>Meet my <em>AI twin.</em></h1><p>Ask about the research, the projects, or the thinking behind the work. A different way to explore my story.</p></div>}
      <div className="avatar-stage"><div className="avatar-halo" /><div className="avatar-screen">
        <Image className="avatar-still" src="/media/rana-profile.jpg" fill sizes="(max-width: 900px) 85vw, 440px" alt="Pixel art avatar of Rana Romdhane" priority />
        <video ref={videoRef} className={`avatar-video avatar-talking ${avatarTalking ? "active" : "inactive"}`} muted loop playsInline preload="metadata" poster="/media/rana-profile.jpg" aria-hidden="true"><source src="/media/rana-talking.webm" type="video/webm" /><source src="/media/rana-talking.mp4" type="video/mp4" /></video>
      </div><div className="avatar-caption"><span className={`avatar-live-dot ${avatarTalking ? "is-speaking" : ""}`} /> {avatarTalking ? "SPEAKING" : recording ? "LISTENING" : "READY TO TALK"}<span>AI-GENERATED VOICE</span></div></div>
      <div className="assistant-disclosure"><Sparkles size={17} aria-hidden="true" /><p>Ask about Rana&apos;s work and research. Answers may be imperfect; the voice is AI-generated. For direct contact, <a href="mailto:ranaromdhane1@gmail.com">email Rana</a>.</p></div>
    </div>
    <section className="chat-panel" aria-label="Chat with Rana's AI twin"><div className="chat-topbar"><div><span className="chat-bot-icon">✦</span><span><strong>Rana&apos;s AI Twin</strong><small>Explore my work through conversation</small></span></div>{embedded ? <Link className="chat-expand" href="/assistant" aria-label="Open AI Twin in a larger view">OPEN ↗</Link> : <span className="chat-top-status"><span /> READY</span>}</div>
      <div className="chat-messages" role="log" aria-live="polite" aria-relevant="additions text"><div className="chat-intro"><span className="chat-intro-icon">✳</span><h2>Hi, I&apos;m Rana&apos;s AI twin.</h2><p>Ask about projects, research results, tools, or the problems I love solving.</p></div>
        {messages.map((message, index) => <div className={`chat-message ${message.role}`} key={`${index}-${message.role}`}><span className="message-avatar" aria-hidden="true">{message.role === "assistant" ? "✦" : "YOU"}</span><div className="message-bubble"><MessageText text={message.content || "Thinking…"} />{message.fallback && <small>RÉSUMÉ PREVIEW</small>}</div></div>)}
        <div ref={bottomRef} />
      </div>
      {messages.length === 0 && <div className="prompt-suggestions" aria-label="Suggested questions">{prompts.map((prompt) => <button key={prompt} type="button" onClick={() => void sendMessage(prompt)}>{prompt} <ArrowUpRight size={14} aria-hidden="true" /></button>)}</div>}
      <div className="chat-composer"><div className="chat-tools"><span><span className="tool-pixel" /> TEXT + VOICE</span><button type="button" className={voiceMode ? "voice-toggle active" : "voice-toggle"} aria-pressed={voiceMode} onClick={() => { if (voiceMode) stopAudio(); setVoiceMode(!voiceMode); }} title="Opt in to AI-generated cloned voice">{voiceMode ? <Volume2 size={16} /> : <VolumeX size={16} />} {voiceMode ? "Voice on" : "Voice off"}</button></div>
        <form onSubmit={handleSubmit}><label className="sr-only" htmlFor="assistant-question">Your question</label><textarea id="assistant-question" rows={2} maxLength={2000} value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask me about a project, research, or my journey..." onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void sendMessage(input); } }} />
          <div className="composer-actions"><span>{recording ? "Recording… click stop when done" : transcribing ? "Transcribing…" : "ENTER TO SEND · SHIFT+ENTER FOR NEW LINE"}</span><div><button className={recording ? "composer-icon recording" : "composer-icon"} type="button" onClick={recording ? stopRecording : () => void startRecording()} disabled={busy || transcribing} aria-label={recording ? "Stop recording" : "Record a question"}>{recording ? <Square size={17} /> : transcribing ? <MicOff size={18} /> : <Mic size={18} />}</button><button className="composer-send" type="submit" disabled={busy || transcribing || !input.trim()} aria-label="Send question"><Send size={18} /></button></div></div>
        </form>
        {notice && <p className="chat-notice" role="status">{notice}</p>}
        <p className="chat-privacy">Voice questions and spoken replies use external speech services. Chat history stays in this tab.</p>
      </div>
    </section>
  </div>;
}
