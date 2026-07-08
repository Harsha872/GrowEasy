# GrowEasy CSV Importer

An AI-powered CSV importer that maps any CSV structure into standardized
GrowEasy CRM lead records using LLM-based field extraction — powered by the
**Groq API**.

**Position Applied For:** Intern

---

## What It Does

Lead data gets exported from dozens of different sources — Facebook Ads, Google
Ads, real-estate CRMs, random Excel sheets — each with different column names
and layouts. This tool accepts **any valid CSV**, uses an LLM to figure out what
each column represents, and outputs clean, standardized CRM records.

**Example:** columns `Phone No.`, `Full Name`, `Email Address`, `Remark` get
automatically mapped to `mobile_without_country_code`, `name`, `email`,
`crm_note` — no manual column mapping needed.

---

## Tech Stack

| Layer       | Technology                                        |
|-------------|---------------------------------------------------|
| Frontend    | Next.js 14 (App Router), Tailwind CSS, TypeScript |
| Backend     | Node.js, Express, TypeScript                      |
| AI          | **Groq API** (`groq-sdk`, OpenAI-compatible)      |
| CSV Parsing | PapaParse (frontend), csv-parser (backend)        |

The AI provider is isolated in [`server/src/services/ai.service.ts`](server/src/services/ai.service.ts).
Swapping models is just the `AI_MODEL` env var; swapping providers is one file.

---

## Project Structure

```
groweasy-csv-importer/
├── client/                     # Next.js frontend
│   └── src/
│       ├── app/
│       │   ├── page.tsx        # redirects to /import
│       │   └── import/page.tsx # 4-step import flow (state machine)
│       ├── components/         # ui/ upload/ preview/ results/
│       ├── hooks/              # useCSVParser, useImport
│       ├── lib/                # api, constants, download
│       └── types/
├── server/                     # Express backend
│   └── src/
│       ├── index.ts            # app entry
│       ├── routes/             # POST /api/import
│       ├── controllers/        # request handling
│       ├── services/           # csv, ai (Groq), mapper
│       ├── prompts/            # extraction system + user prompts
│       ├── middleware/         # multer upload, validation, errors
│       ├── utils/              # batch, retry, logger
│       └── types/
├── sample-data/                # example CSV to try
└── .env.example
```

---

## How It Works

### User Flow (4 Steps)

```
UPLOAD  ──▶  PREVIEW  ──▶  CONFIRM  ──▶  RESULTS
(drag/drop) (client-side  (calls        (CRM records
             PapaParse)    backend API)  + stats + CSV export)
```

### Backend Pipeline

```
CSV File → Parse → Validate → Batch (25/batch) → Groq extraction → Normalize → JSON
                                                        │
                                                  retry w/ backoff,
                                                  per-batch error isolation
```

Each batch is sent to Groq with a system prompt that instructs it to map any
column layout to the 15 CRM fields, enforce enum values for `crm_status` /
`data_source`, format `created_at` as a JS-parseable date, route extra
emails/phones into `crm_note`, and skip rows with neither email nor phone.

---

## CRM Fields Reference

| Field | Constraints |
|-------|-------------|
| `created_at` | Must be `new Date()` parseable |
| `name` | — |
| `email` | First email; extras go to crm_note |
| `country_code` | e.g. `+91` |
| `mobile_without_country_code` | First number; extras go to crm_note |
| `company` / `city` / `state` / `country` / `lead_owner` | — |
| `crm_status` | One of: `GOOD_LEAD_FOLLOW_UP`, `DID_NOT_CONNECT`, `BAD_LEAD`, `SALE_DONE`, or blank |
| `crm_note` | Catch-all for extras |
| `data_source` | One of: `leads_on_demand`, `meridian_tower`, `eden_park`, `varah_swamy`, `sarjapur_plots`, or blank |
| `possession_time` / `description` | — |

---

## Setup

### Prerequisites
- Node.js 18+
- A [Groq API key](https://console.groq.com/keys)

### 1. Environment variables

```bash
# Backend
cp .env.example server/.env      # then set GROQ_API_KEY

# Frontend
echo "NEXT_PUBLIC_API_URL=http://localhost:4000" > client/.env.local
```

### 2. Install & run

```bash
# Terminal 1 — backend
cd server
npm install
npm run dev            # http://localhost:4000

# Terminal 2 — frontend
cd client
npm install
npm run dev            # http://localhost:3000
```

Open http://localhost:3000, drop in `sample-data/facebook_leads_export.csv`,
and confirm the import.

---

## API Reference

### `POST /api/import`

**Request:** `multipart/form-data` with a `file` field (the CSV).

**Response:**
```json
{
  "success": true,
  "data": {
    "records": [ { "created_at": "...", "name": "...", "...": "all 15 fields" } ],
    "skipped": [ { "row": 4, "reason": "No email or mobile number found" } ],
    "stats": { "total_uploaded": 5, "total_imported": 4, "total_skipped": 1 }
  }
}
```

**Error:**
```json
{ "success": false, "error": "Invalid file format. Please upload a CSV file." }
```

---

## Testing

```bash
cd server
npm test          # normalization / mapper unit tests (Vitest)
```

---

## Environment Variables

| Variable              | Required | Default                    | Description                    |
|-----------------------|----------|----------------------------|--------------------------------|
| `PORT`                | No       | `4000`                     | Backend port                   |
| `GROQ_API_KEY`        | **Yes**  | —                          | Groq API key                   |
| `AI_MODEL`            | No       | `llama-3.3-70b-versatile`  | Groq chat model (JSON mode)    |
| `BATCH_SIZE`          | No       | `25`                       | Records per AI batch           |
| `MAX_RETRIES`         | No       | `3`                        | Retries per failed batch       |
| `ALLOWED_ORIGINS`     | No       | `*`                        | CORS allowed origins           |
| `NEXT_PUBLIC_API_URL` | **Yes**  | `http://localhost:4000`    | Backend URL for the frontend   |

---

## Key Design Decisions

1. **Client-side CSV parsing** — PapaParse runs in the browser so the preview is
   instant; only confirmed imports hit the backend.
2. **Batch processing** — records go to the LLM in batches of 25 for token
   limits and partial success; a failed batch doesn't sink the others.
3. **Retry with exponential backoff** — 1s / 2s / 4s on transient Groq errors.
4. **Prompt engineering over brittle code** — all mapping intelligence lives in
   the prompt, so oddly-named columns work without code changes.
5. **Provider-isolated** — Groq lives behind `ai.service.ts`; the rest of the
   pipeline is provider-agnostic.
6. **Stateless** — no database; each import is a self-contained request/response.

## License

MIT
