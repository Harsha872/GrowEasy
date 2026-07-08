# Deployment Guide

This app has two parts that deploy separately, both on **free** tiers:

| Part | Stack | Free host | Why |
|------|-------|-----------|-----|
| `client/` | Next.js (static) | **Vercel** | Zero-config Next.js hosting, free URL |
| `server/` | Express + Groq | **Render** | Free Node web service, runs the API |

> Firebase's free (Spark) plan only serves static files, so it can't run the
> Express backend. The frontend *could* go on Firebase Hosting (it builds to
> static output), but Vercel is simpler for Next.js. Steps for Firebase static
> hosting are at the bottom if you prefer it for the frontend.

Deploy the **backend first** so you have its URL for the frontend, then the
frontend, then wire CORS back to the frontend URL.

---

## 1. Push to GitHub (both hosts deploy from the repo)

Create an empty repo on GitHub (no README), then:

```bash
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```

The commit is already made. `.env`, `.env.local`, `node_modules/`, `dist/`,
and `.next/` are gitignored, and the real Groq key was redacted from
`.env.example`.

---

## 2. Backend → Render (free)

1. Go to https://render.com → **New** → **Web Service** → connect your GitHub repo.
2. Render auto-detects [`render.yaml`](render.yaml). Confirm:
   - Root directory: `server`
   - Build: `npm install --include=dev && npm run build`
   - Start: `npm start`
   - Plan: **Free**
3. Set the two secret env vars (marked `sync: false`):
   - `GROQ_API_KEY` = your Groq key (`gsk_...`)
   - `ALLOWED_ORIGINS` = leave as `*` for now; tighten to your Vercel URL in step 4.
4. Deploy. Note the URL, e.g. `https://groweasy-csv-importer-api.onrender.com`.
   Verify: open `<url>/health` → `{"status":"ok",...}`.

> Note: Render's free tier **sleeps after ~15 min idle**; the first request
> after sleeping takes ~30–60s to wake. Fine for a demo.

---

## 3. Frontend → Vercel (free)

1. Go to https://vercel.com → **Add New** → **Project** → import your repo.
2. Set **Root Directory** to `client` (Framework auto-detects as Next.js).
3. Add an environment variable:
   - `NEXT_PUBLIC_API_URL` = your Render backend URL from step 2
     (e.g. `https://groweasy-csv-importer-api.onrender.com`)
4. Deploy. You get a free URL, e.g. `https://groweasy-csv-importer.vercel.app`.

> `NEXT_PUBLIC_API_URL` is baked in at build time. If you change it later,
> redeploy the frontend.

---

## 4. Wire CORS back to the frontend

On **Render**, set `ALLOWED_ORIGINS` to your exact Vercel URL:

```
ALLOWED_ORIGINS=https://groweasy-csv-importer.vercel.app
```

Save → Render redeploys. Done — open your Vercel URL and import a CSV
(there's a sample in `sample-data/`).

---

## Alternative: frontend on Firebase Hosting (free static)

The Next.js app builds to static output, so it can be hosted on Firebase's free
tier. The **backend still needs Render** (Firebase free can't run it).

```bash
npm i -g firebase-tools
firebase login              # interactive
cd client
# add  output: 'export'  to next.config.js, then:
npm run build               # produces client/out
firebase init hosting       # public dir: out ; SPA: yes
firebase deploy --only hosting
```

Set `NEXT_PUBLIC_API_URL` to the Render URL before building, and add the
Firebase URL to the backend's `ALLOWED_ORIGINS`.
