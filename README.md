# Rana Romdhane · Portfolio

A game-inspired personal portfolio: collect coins while you explore, hit mystery blocks, open project "worlds", play a bonus stage, and talk to an AI twin that answers by text or in Rana's own cloned voice.

Built with Next.js (App Router), TypeScript, Tailwind CSS, Three.js and Motion.

## What is inside

| Area | What it does |
| --- | --- |
| Home | 3D scene (floating blocks, coins, neural network), typed roles, mystery blocks, CV download |
| About | Character sheet, animated "high scores", languages |
| Experience | Quest log with expandable quests |
| Projects | Filter by domain, search, detail window with links |
| Publications | Paper and article cards with links |
| Education | Schools and verified certification badges |
| Skills | Inventory with technology logos |
| Ask AI | Chat by text or microphone, replies spoken in the cloned voice with a talking avatar |
| Contact | Validated form (Formspree), email, LinkedIn, GitHub |
| Extras | Day/night mode (remembered), sound effects, coins and achievements (remembered), Bug Hunt mini-game, silent Telegram visit alerts, SEO |

## Run it on your computer

1. Install [Node.js](https://nodejs.org) 20 or newer.
2. Install the packages:

   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env.local` and fill in the values (see the table below).
4. Start the site:

   ```bash
   npm run dev
   ```

5. Open http://localhost:3000

Other commands: `npm run build` (production build), `npm run start` (serve the build), `npm run typecheck`.

## Environment variables

| Name | Needed for | Where to get it |
| --- | --- | --- |
| `GROQ_API_KEY` | AI chat and microphone input | https://console.groq.com/keys (free) |
| `GROQ_MODEL` | Which model answers (default `openai/gpt-oss-120b`) | Optional |
| `FISH_API_KEY` | Cloned voice | https://fish.audio |
| `FISH_VOICE_ID` | Your voice clone id | The id of your voice model on fish.audio |
| `FISH_MODEL` | Voice engine (default `s2.1-pro-free`) | Optional |
| `TELEGRAM_BOT_TOKEN` | Visit alerts | See "Visitor alerts" below |
| `TELEGRAM_CHAT_ID` | Visit alerts | See "Visitor alerts" below |
| `NEXT_PUBLIC_SITE_URL` | Correct links in search results and social previews | Your final site address |

Without the Fish keys the assistant still speaks, using the browser's built-in voice. Without the Telegram keys the site simply sends no alerts. Keys are only ever used on the server and never reach the visitor's browser.

## Visitor alerts on Telegram

Each time someone opens the site (once per browser session), you get a Telegram message with their country and city, device, where they came from, and whether they are new or returning. Visitors see nothing. Nothing is stored and no IP address is sent.

1. In Telegram, open **@BotFather**, send `/newbot`, and follow the steps. Copy the token it gives you: this is `TELEGRAM_BOT_TOKEN`.
2. Open your new bot and press **Start** (send it any message).
3. Open `https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates` in a browser. Find `"chat":{"id":123456789` : that number is `TELEGRAM_CHAT_ID`.
4. Add both values in Vercel (Project → Settings → Environment Variables) and redeploy.

Total visitor counts are available in the Vercel dashboard under **Analytics** (turn on Web Analytics once for the project).

## Change the content

Everything shown on the site, and everything the AI knows, comes from one file: [`src/data/portfolio.json`](src/data/portfolio.json). Edit it and the site and assistant update together.

## Add your own images

The site works without any extra image: covers and logos are generated. To use real ones, drop files in `public/` and point to them in `src/data/portfolio.json`.

| What | Put the file in | Then set |
| --- | --- | --- |
| Project screenshot or GIF | `public/projects/` (for example `vision-llm.jpg`, about 1200×675) | that project's `"image": "/projects/vision-llm.jpg"` |
| Company logo | `public/logos/` (square PNG, for example `soretrak.png`) | that experience's `"logo": "/logos/soretrak.png"` |
| School logo | `public/logos/` | that school's `"logo": "/logos/enicarthage.png"` |

| Talking video | replace `public/media/twin-talking.mp4` (square works best, no sound needed) | nothing |
| Idle video (optional) | `public/media/rana-idle.mp4` | `profile.idleVideo: "/media/rana-idle.mp4"` |
| CV | replace `public/Rana_Romdhane_Resume.pdf` | nothing |

The AI avatar stacks the portrait (or idle video) and the talking video and cross-fades between them over 700 ms while the voice plays.

## Deploy to Vercel

1. Push this folder to a GitHub repository.
2. On https://vercel.com choose **Add New → Project** and import the repository. The defaults are correct (framework: Next.js).
3. Under **Environment Variables**, add the values from the table above.
4. Press **Deploy**. Every later `git push` redeploys automatically.
5. After the first deploy, set `NEXT_PUBLIC_SITE_URL` to your final address and redeploy.

## Project structure

```
public/                 CV, portrait, talking video, your images
src/data/portfolio.json all content
src/lib/                typed data access, AI knowledge builder, server helpers
src/app/                layout, page, styles, SEO files
src/app/api/chat        AI answers (Groq, streamed)
src/app/api/stt         microphone to text (Groq Whisper)
src/app/api/tts         text to cloned voice (Fish Audio)
src/app/api/visit       silent Telegram visit alert
src/components/         HUD, hero + 3D scene, sections, projects, assistant, contact, mini-game
```
