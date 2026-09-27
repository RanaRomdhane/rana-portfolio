# Rana Romdhane — AI/ML portfolio

A responsive, game-inspired portfolio built with Next.js App Router and TypeScript. The home page has a large avatar beside the AI Twin chat, interactive About, experience, skills, and language panels, searchable project files, publications, visual education and certification cards, and a contact form. `/assistant` offers a larger version of the same chat.

## Requirements

- Node.js 20.9+ and npm
- A Groq API key for live chat and microphone transcription
- A Fish Audio API key and a voice model ID for cloned speech
- The existing Formspree form `mljdopbw` for contact delivery; no custom domain is required

## Run locally

1. Run `npm install`.
2. Copy `.env.example` to `.env.local` and fill in your **new** API keys. The keys previously posted in chat should be revoked and replaced before any deployment. The supplied Formspree ID is already the default.
3. Run `npm run dev` and open `http://localhost:3000`.

The portfolio renders without any API keys. Chat provides a clearly labeled résumé-based preview if Groq is missing or unavailable. Microphone transcription and cloned speech require their configured providers. The contact form posts to the supplied Formspree endpoint.

```dotenv
GROQ_API_KEY=your_new_groq_key
GROQ_MODEL=openai/gpt-oss-20b
FISH_API_KEY=your_new_fish_key
FISH_VOICE_ID=your_fish_voice_model_id
FISH_MODEL=s2.1-pro-free
NEXT_PUBLIC_FORMSPREE_ID=mljdopbw
NEXT_PUBLIC_SITE_URL=https://your-portfolio.vercel.app
```

Only the form ID and canonical site URL use `NEXT_PUBLIC_`; provider keys stay on the server. `.env.local` is gitignored. Do not commit or paste your keys into source files, browser code, or Vercel's public environment variables.

## Set up the contact form without a domain

1. In the supplied [Formspree form](https://formspree.io/f/mljdopbw), verify that notifications go to `ranaromdhane1@gmail.com`.
2. Keep `NEXT_PUBLIC_FORMSPREE_ID=mljdopbw` in Vercel, or omit it and use the built-in default.
3. Send a test message after deployment and check both the inbox and Formspree submissions.

The form validates name, email, subject, and message before sending. A honeypot and Formspree's spam handling provide basic abuse protection. In Formspree, restrict submissions to the final Vercel domain when available.

## Deploy to Vercel

1. Push this folder to a Git repository and import it in [Vercel](https://vercel.com/new). Keep the Next.js framework preset and default build command (`npm run build`).
2. Add the environment variables above in Vercel Project Settings → Environment Variables. Use freshly rotated Groq and Fish keys. Enter the public Formspree ID and the final site URL.
3. Deploy, then test the contact form, chat, transcription, speech, and CV download on the live URL. Redeploy after changing any `NEXT_PUBLIC_` value.
4. Configure Vercel Firewall rate limits for `/api/chat`, `/api/transcribe`, and `/api/speech` before promoting a public high-traffic launch. The routes already cap input sizes and have a local per-instance burst limiter; the firewall provides shared protection across serverless instances.

Groq's free-tier quotas and Fish Audio's `s2.1-pro-free` access can change. Review the provider dashboards before launch and adjust `GROQ_MODEL` or `FISH_MODEL` if needed. The TTS free tier is best effort rather than an uptime guarantee. The app shows text even when speech is unavailable.

Voice recordings are limited to 15 seconds and 4 MB to fit Vercel's Function request limit. Audio is sent to Groq only after the visitor uses the microphone; generated replies are sent to Fish Audio only when the visitor enables voice mode.

## Edit résumé content and project media

- `src/data/portfolio.ts` holds all résumé details, links, project cards, skills, certifications, and assistant grounding data. Edit facts there rather than duplicating copy in the API.
- Replace `public/Rana.Romdhane.Resume.pdf` with an updated CV under the same filename to keep the download link.
- `public/media/rana-profile.jpg` is the still portrait. `rana-talking.*` is the optimized MP4/WebM version of the supplied talking GIF. The portrait is still until a text response streams or speech plays; the talking video fades in over 700 ms and stops when the response ends.
- `public/brands/` contains locally stored [Devicon](https://github.com/devicons/devicon) and [Simple Icons](https://github.com/simple-icons/simple-icons) SVGs for recognizable technology logos. General concepts such as RAG and Random Forest use designed pictograms, with readable labels beside them. Replace or add SVGs there as desired.
- Project cards currently have designed CSS media panels, so they remain complete without outside screenshots. To add real images, place optimized WebP/AVIF files in `public/media/projects/`, add an image path to the project data, and render it with `next/image` in `ProjectVisual`. Provide descriptive alt text if an image communicates project information.

The original GIFs are intentionally not loaded by the site because together they exceed 18 MB. The laughing animation is no longer used. Keep it as an editing source outside the deployed project.

## Check before publishing

Run `npm run typecheck`, `npm run lint`, and `npm run build`. Then review the desktop and mobile layout, project filters and search, theme persistence, keyboard navigation, reduced-motion behavior, provider errors, and all links. Live email delivery and provider calls require your configured accounts.
