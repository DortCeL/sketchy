# sketchy?

A small web app that reviews job descriptions for scam-like or otherwise shady signals. Paste a posting, submit it, and get a short verdict with any red flags the model finds.

Built with Next.js and Google Gemini.

## What it does

1. You paste a job description into the form.
2. The app sends that text to a Next.js API route.
3. Gemini scores the posting and returns JSON:
   - whether it looks sketchy
   - confidence (`low` / `medium` / `high`)
   - a short summary
   - a list of red flags (if any)

This is a heuristic check, not legal or career advice. Treat the output as a second opinion.

## Stack

- Next.js (App Router)
- React / TypeScript
- `@google/generative-ai` (Gemini `gemini-2.5-flash-lite`)

## Setup

Requirements: Node.js and a Gemini API key.

```bash
npm install
```

Create a `.env` file in the project root (see `.env.example`):

```
GEMINI_API_KEY=your_key_here
```

Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command         | Description              |
| --------------- | ------------------------ |
| `npm run dev`   | Local development server |
| `npm run build` | Production build         |
| `npm run start` | Serve the production build |
| `npm run lint`  | Run ESLint               |

## Project layout

```
app/
  page.tsx           # UI (textarea + results)
  layout.tsx
  globals.css
  api/check/route.ts # Gemini request + JSON parsing
```

## Notes

- Keep your API key out of git. `.env` is ignored.
- If the API returns an error about a missing key, check that `GEMINI_API_KEY` is set and restart `npm run dev`.
