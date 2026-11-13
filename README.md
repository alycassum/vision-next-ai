# Vision Next AI Assistant
One AI engine, two personas: **visionnext** (all four firms) and **globalspace** (real estate only). Built on the Claude API. Persona and knowledge live in this public repo; the API key, client data and staff details never do.

## Structure
- `prompts/base.md` shared rules, trust-building, enquiry capture; `persona-*.md` per persona
- `knowledge/<firm>/` one folder per firm (company, design, scanline, woodhouse, global-space)
- `scripts/build.js` bundles prompts + knowledge per persona into the worker
- `worker/` Cloudflare Worker that holds the key and relays chat (selects persona from the request)
- `docs/index.html` test chat page. `?persona=globalspace` for the Global Space version. Starts in TEST MODE (nothing is sent to the real form).

## Setup
1. `node scripts/build.js`
2. `cd worker && npx wrangler deploy` (free AI is enabled in wrangler.toml; no key needed)
3. Put the worker URL in `docs/index.html` (`WORKER_URL`); check `ALLOWED_ORIGINS` in `worker/index.js`
4. Host `docs/` on GitHub Pages and test. When happy, set `SEND_LIVE = true` or move the widget into visionnext.co.

## Rules
- Never commit keys, client names, staff names or internal margins.
- Date every price in knowledge files.

## Cost notes
- Everything is free by default: GitHub Pages (public repo), Cloudflare Workers, and Cloudflare Workers AI (free daily allowance, no card needed on the free plan).
- When the daily free allowance runs out, the bot shows a WhatsApp fallback message and resumes after the daily reset (00:00 UTC).
- Optional upgrade: set the `ANTHROPIC_API_KEY` secret and the worker switches to Claude (paid, small per-message cost). No code change needed.
- Free open models follow instructions less reliably than Claude. Test the hard rules (no building names, no cash-deal talk, enquiry tag format) before going live.
