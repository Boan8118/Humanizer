/**
 * Humanizer Pro Mode — Cloudflare Worker
 *
 * This proxies rewrite requests to the Anthropic API so your API key
 * never sits in browser-side JS. Deploy this separately from GitHub Pages.
 *
 * Setup:
 *   1. npm install -g wrangler
 *   2. wrangler login
 *   3. wrangler secret put ANTHROPIC_API_KEY      (paste your key when prompted)
 *   4. wrangler secret put SHARED_SECRET          (any password you choose —
 *      the tool.html frontend sends this so randoms can't spam your worker)
 *   5. wrangler deploy
 *
 * You'll get a URL like: https://humanizer-pro.YOURNAME.workers.dev
 * Paste that into the "Pro mode endpoint" field in tool.html.
 */

export default {
  async fetch(request, env) {
    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders() });
    }

    if (request.method !== "POST") {
      return json({ error: "Use POST" }, 405);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: "Invalid JSON body" }, 400);
    }

    const { text, tone, intensity, secret } = body;

    if (secret !== env.SHARED_SECRET) {
      return json({ error: "Unauthorized" }, 401);
    }
    if (!text || typeof text !== "string") {
      return json({ error: "Missing 'text' field" }, 400);
    }

    const prompt = buildPrompt(text, tone, intensity);

    const apiRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1500,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!apiRes.ok) {
      const errText = await apiRes.text();
      return json({ error: "Upstream error", detail: errText }, 502);
    }

    const data = await apiRes.json();
    const rewritten = (data.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();

    return json({ result: rewritten });
  },
};

function buildPrompt(text, tone = "conversational", intensity = "medium") {
  return `Rewrite the following text so it reads naturally, like a person wrote it — not an AI. ` +
    `Tone: ${tone}. Rewrite intensity: ${intensity} (light = minor word swaps only, ` +
    `medium = vary sentence rhythm and cut stiff phrasing, heavy = substantially restructure while keeping the same meaning). ` +
    `Do not add commentary, headers, or quotation marks — return only the rewritten text.\n\n` +
    `Text:\n${text}`;
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders() },
  });
}
