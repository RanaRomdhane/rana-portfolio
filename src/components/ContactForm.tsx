"use client";

import { FormEvent, useState } from "react";
import { ArrowUpRight, Send } from "lucide-react";
import { profile } from "@/data/portfolio";

type FormState = "idle" | "sending" | "success" | "error";
const formId = process.env.NEXT_PUBLIC_FORMSPREE_ID?.trim() || "mljdopbw";

export function ContactForm() {
  const [status, setStatus] = useState<FormState>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const fields = new FormData(form);
    if (fields.get("website")) return;
    setStatus("sending");
    setMessage("");
    try {
      const response = await fetch(`https://formspree.io/f/${encodeURIComponent(formId)}`, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ name: fields.get("name"), email: fields.get("email"), subject: fields.get("subject"), message: fields.get("message"), _gotcha: fields.get("website") }),
      });
      if (!response.ok) throw new Error("Delivery failed");
      form.reset();
      setStatus("success");
      setMessage("Message sent. Rana will get back to you soon.");
    } catch {
      setStatus("error");
      setMessage("The message could not be sent. Please try again or email Rana directly.");
    }
  }

  return <div className="contact-form-panel">
    <div className="form-heading"><span className="eyebrow">SEND A SIGNAL</span><span className="form-sparkle" aria-hidden="true">✳</span></div>
    <form onSubmit={handleSubmit} noValidate={false}>
      <div className="form-row"><label>Your name<input name="name" type="text" autoComplete="name" required minLength={2} maxLength={100} placeholder="How should I call you?" /></label><label>Your email<input name="email" type="email" autoComplete="email" required maxLength={200} placeholder="you@example.com" /></label></div>
      <label>What is this about?<input name="subject" type="text" required minLength={3} maxLength={150} placeholder="A project, opportunity, or hello..." /></label>
      <label>Your message<textarea name="message" required minLength={10} maxLength={5000} rows={5} placeholder="Tell me a little about what you have in mind." /></label>
      <div className="honeypot" aria-hidden="true"><label>Leave this field empty<input type="text" name="website" tabIndex={-1} autoComplete="off" /></label></div>
      <div className="form-footer"><p>Usually happy to talk about AI, research, and ambitious ideas.</p><button className="button button-primary" type="submit" disabled={status === "sending"}>{status === "sending" ? "Sending..." : "Send message"}<Send size={17} aria-hidden="true" /></button></div>
      {message && <p className={`form-message ${status}`} role={status === "error" ? "alert" : "status"}>{message}</p>}
    </form>
    <a className="form-email-fallback" href={`mailto:${profile.email}`}>Or email {profile.email} <ArrowUpRight size={15} aria-hidden="true" /></a>
  </div>;
}
