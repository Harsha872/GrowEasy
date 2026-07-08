# Deployment Guide — Firebase

The app deploys to Firebase as **one project, one URL**:

| Part | Firebase service | Notes |
|------|------------------|-------|
| `client/` (Next.js static) | **Hosting** | Free (Spark tier OK) |
| `server/` (Express API) | **Cloud Functions (2nd gen)** | Requires **Blaze** plan |

The frontend calls the API at `/api/...` on its own origin; a Hosting **rewrite**
forwards `/api/**` to the `api` Cloud Function. Same origin = **no CORS setup**.

> ⚠️ **Blaze plan required for the backend.** Cloud Functions cannot run on the
> free Spark plan — you must upgrade the project to **Blaze (pay-as-you-go)**,
> which needs a billing card. Blaze includes a large always-free tier
> (~2M function invocations/month), so a demo effectively costs $0, but the card
> is mandatory. If you don't want to add billing, use the Render alternative at
> the bottom (backend on Render free tier, frontend still on Firebase).

Everything is already wired up in the repo:
- [`firebase.json`](firebase.json) — Hosting (`client/out`) + `/api/**` → `api` function
- [`.firebaserc`](.firebaserc) — set your project id here
- `server/src/functions.ts` — wraps the Express app as the `api` function
- `client/.env.production` — empty `NEXT_PUBLIC_API_URL` so the frontend calls `/api` same-origin

---

## One-time setup

```bash
npm i -g firebase-tools     # install the CLI
firebase login              # interactive Google login
```

Create a Firebase project (or reuse one) at https://console.firebase.google.com,
then upgrade it to the **Blaze** plan (Console → ⚙ → Usage and billing → Modify plan).

Point the repo at your project:

```bash
firebase use --add          # pick your project, alias it "default"
```

This writes your project id into `.firebaserc` (replacing the placeholder).

---

## Deploy

From the repo root:

```bash
# 1. Store your Groq key as a Functions secret (one time; re-run to rotate)
firebase functions:secrets:set GROQ_API_KEY
#    → paste your gsk_... key when prompted

# 2. Build the static frontend
cd client && npm install && npm run build && cd ..
#    → produces client/out

# 3. Deploy hosting + functions together
#    (the functions predeploy hook runs `npm run build` in server/ automatically)
firebase deploy --only hosting,functions
```

When it finishes, the CLI prints your **Hosting URL**, e.g.
`https://<project-id>.web.app` — that's your live app. Open it and import a CSV
(there's a sample in `sample-data/`).

### Redeploying after changes
- Frontend change: `cd client && npm run build && cd .. && firebase deploy --only hosting`
- Backend change: `firebase deploy --only functions`

---

## Notes / gotchas

- **First deploy of a gen-2 function** enables Cloud Run + Artifact Registry APIs
  automatically; it can take a few minutes. If it errors asking to enable an API,
  wait a minute and re-run the deploy.
- **Cold starts:** an idle function takes ~1–3s on the first request.
- **Secret used at runtime:** `GROQ_API_KEY` is injected only into the `api`
  function (via `defineSecret` in `functions.ts`). Other settings (`AI_MODEL`,
  `BATCH_SIZE`, `MAX_RETRIES`) fall back to sensible defaults in code; set them as
  additional secrets/params only if you want to override.
- **Function timeout** is set to 300s in `functions.ts`, but Firebase Hosting caps
  a request at 60s. Very large CSVs may hit the Hosting limit — fine for demos.
- **Local test before deploy:** `firebase emulators:start --only functions,hosting`
  (run `cd client && npm run build` first so `client/out` exists).

---

## Alternative: keep it free (no Blaze)

Frontend on Firebase Hosting (free), backend on Render (free) — no billing card.

1. Deploy the backend on Render using [`render.yaml`](render.yaml)
   (New → Web Service → pick this repo → set `GROQ_API_KEY`). Note its URL.
2. In `client/.env.production`, set `NEXT_PUBLIC_API_URL=https://<your-render-url>`
   (full backend URL — cross-origin now, so CORS matters).
3. On Render, set `ALLOWED_ORIGINS` to your Firebase Hosting URL.
4. Remove the `functions` block and the `/api/**` rewrite from `firebase.json`
   (Hosting-only), then:
   ```bash
   cd client && npm run build && cd ..
   firebase deploy --only hosting
   ```
