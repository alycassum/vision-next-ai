import PROMPTS from "./prompt.generated.js";

// Add your real sites. GitHub Pages origin is for testing.
const ALLOWED_ORIGINS = ["https://visionnext.co", "https://www.visionnext.co", "https://alycassum.github.io"];
const MAX_MESSAGES = 24, MAX_CHARS = 2000;
const WA = { visionnext: "923360839136", globalspace: "923282277370" };

async function askClaude(env, system, messages) {
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model: env.MODEL || "claude-haiku-5-5", max_tokens: 500, system, messages }),
  });
  const data = await r.json();
  return data?.content?.filter(b => b.type === "text").map(b => b.text).join("");
}

async function askWorkersAI(env, system, messages) {
  // Free tier: Cloudflare Workers AI (10,000 free Neurons/day). Pick the model in env.AI_MODEL.
  const out = await env.AI.run(env.AI_MODEL || "@cf/google/gemma-4-26b-a4b-it", {
    messages: [{ role: "system", content: system }, ...messages],
    max_tokens: 500,
  });
  return out?.response ?? out?.choices?.[0]?.message?.content;
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const ok = ALLOWED_ORIGINS.includes(origin);
    const cors = {
      "Access-Control-Allow-Origin": ok ? origin : ALLOWED_ORIGINS[0],
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };
    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    if (request.method !== "POST" || !ok) return new Response("Forbidden", { status: 403, headers: cors });

    let body;
    try { body = await request.json(); } catch { return new Response("Bad request", { status: 400, headers: cors }); }
    const persona = PROMPTS[body.persona] ? body.persona : "visionnext";
    let messages = body.messages;
    if (!Array.isArray(messages) || !messages.length) return new Response("Bad request", { status: 400, headers: cors });
    messages = messages.slice(-MAX_MESSAGES).map(m => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: String(m.content).slice(0, MAX_CHARS),
    }));

    let reply;
    try {
      // If an Anthropic key is set, use Claude (paid). Otherwise use the free Workers AI.
      reply = env.ANTHROPIC_API_KEY
        ? await askClaude(env, PROMPTS[persona], messages)
        : await askWorkersAI(env, PROMPTS[persona], messages);
    } catch (e) { reply = null; }
    if (!reply) reply = "I've hit my limit for now. Please message the team directly on WhatsApp: https://wa.me/" + WA[persona];
    return new Response(JSON.stringify({ reply }), { headers: { ...cors, "content-type": "application/json" } });
  },
};
