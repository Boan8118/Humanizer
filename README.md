# Humanizer

A browser-based tool that rewrites AI-flattened text to sound more natural — varied sentence rhythm, plainer words, tone-aware contractions, and a diff view so you can see exactly what changed.

**Live demo:** enable GitHub Pages on this repo (see below) to get a free public URL.

## What's in here

```
├── index.html        Landing page
├── tool.html          The actual humanizer app (rule-based, runs 100% in-browser)
└── worker/
    ├── worker.js       Optional Cloudflare Worker for model-powered "Pro Mode"
    └── wrangler.toml   Worker config
```

## 1. Host it for free (GitHub Pages)

```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/YOURNAME/humanizer.git
git branch -M main
git push -u origin main
```

Then: **Settings → Pages → Source → Deploy from branch → main / (root)**.

You'll get a live URL like `https://yourname.github.io/humanizer/`. `index.html` is the landing page; it links to `tool.html`, the actual app.

The free rule-based engine in `tool.html` needs no backend, no API key, and no server costs — it's just static files.

## 2. Optional: Pro Mode (model-powered rewrites)

The free engine uses word/phrase substitution rules. For heavier rewrites, `tool.html` has a "⚙ Pro Mode" panel that can call a small backend running a real language model, without ever putting an API key in the browser.

To deploy it:

```bash
cd worker
npm install -g wrangler
wrangler login
wrangler secret put ANTHROPIC_API_KEY
wrangler secret put SHARED_SECRET
wrangler deploy
```

This gives you a URL like `https://humanizer-pro.yourname.workers.dev`. Paste that URL (and your shared secret) into the "⚙ Pro Mode" panel inside `tool.html`, check "Use Pro Mode," and future rewrites route through your worker.

The `SHARED_SECRET` is just a password of your choosing — it stops random visitors from spamming your worker (and your API bill) if they find the URL. It is not meant to be strong security; if you're selling access, put real auth in front of this (e.g. a Stripe-gated login) before launch.

## 3. Selling it as a product

Ideas, roughly in order of effort:
- **Free tier**: `tool.html` as-is, hosted on GitHub Pages, as a lead magnet.
- **Paid tier**: gate Pro Mode behind a simple login + Stripe check (Cloudflare Workers can verify a Stripe session before proxying to the API).
- **License the code**: sell the repo itself to other creators as a white-label tool they can re-skin.

## License / attribution

This is your code — do whatever you want with it.
