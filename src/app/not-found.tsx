import Link from "next/link";

export default function NotFound() {
  return <main className="not-found page-shell"><span className="eyebrow">LOST IN THE LEVELS</span><h1>404<span>✦</span></h1><p>That page slipped into another dimension.</p><Link className="button button-primary" href="/">Back to home</Link></main>;
}
