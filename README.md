# Study Materials Library

Internal tool for a tuition business to upload, browse and download study materials (past papers, model papers, marking schemes, notes) by subject, grade/level and year. No user accounts yet — internal-access POC.

```
Browser (React + Vite)  ──REST──▶  Cloudflare Worker  ──▶  D1 (metadata, one row per file)
        │                               │
        │  PUT/GET signed URL           └─ signs short-lived R2 URLs (S3 API, keys = Worker secrets)
        └──────────────────────────────▶  R2 private bucket (PDF bytes only)
```

PDF bytes never pass through the Worker or the app: the browser uploads to / downloads from R2 directly using signed URLs.

| Path | What |
| --- | --- |
| `/` (`src/`) | React + Vite + TypeScript frontend (Tailwind v4, shadcn/ui, TanStack Query, react-hook-form + zod) |
| `/worker` | Cloudflare Worker API (Hono) + `schema.sql` |

## 1. Backend setup (`/worker`)

```bash
cd worker
npm install
npx wrangler login

npx wrangler d1 create study-materials-db      # copy the printed database_id into wrangler.toml
npx wrangler r2 bucket create study-materials
npm run db:init                                 # applies schema.sql to the remote D1
```

Edit [worker/wrangler.toml](worker/wrangler.toml): set `database_id`, `R2_ACCOUNT_ID`, and add your deployed frontend URL to `ALLOWED_ORIGINS` (comma-separated).

**R2 access keys** — Cloudflare dashboard → R2 → *Manage API tokens* → create a token with *Object Read & Write* on the `study-materials` bucket, then store both values as secrets (never in the repo or the frontend):

```bash
npx wrangler secret put R2_ACCESS_KEY_ID
npx wrangler secret put R2_SECRET_ACCESS_KEY
```

**Bucket CORS** — browsers PUT directly to R2, so the bucket must allow your frontend origin. Edit the origins in [worker/r2-cors.json](worker/r2-cors.json), then:

```bash
npx wrangler r2 bucket cors set study-materials --file r2-cors.json
```

Deploy with `npm run deploy` and note the `https://study-materials-api.<you>.workers.dev` URL.

### Local development

Copy `.dev.vars.example` to `.dev.vars` and fill in the R2 keys, run `npm run db:init:local`, then `npm run dev` (serves on `http://localhost:8787`). Local D1/R2 are emulated, but signed upload/download URLs always point at the real R2 endpoint, so a full upload test needs real credentials and the CORS rule above.

### API

| Endpoint | Description |
| --- | --- |
| `POST /upload-url` | `{ filename, contentType }` → `{ key, uploadUrl }` (signed PUT, 10 min). PDF only. |
| `POST /files` | `{ key, filename, size, contentType, title, subject, gradeLevel, paperType, year, term, description }` → `{ ok, id }`. 400 if title/subject/gradeLevel/paperType missing. |
| `GET /files` | `?page&pageSize&search&subject&gradeLevel&paperType` → `{ files, total, page, pageSize, totalPages }`, newest first. |
| `GET /subjects` | `{ subjects: [{ name, count }] }` — subjects that currently have files. New subjects are created simply by uploading a file under a new name. |
| `GET /files/counts` | `{ all, past_paper, model_paper, marking_scheme, notes, other }` |
| `GET /files/:id/download` | `{ downloadUrl }` (signed GET, 5 min) |
| `POST /files/delete` | `{ ids: [...] }` (max 100) → `{ ok, deleted }`. Permanently removes the rows and the R2 objects; unknown ids are ignored. |

`POST /files` checks that the object really exists in R2 and starts with `%PDF-`, takes the size from R2 rather than the client, and is idempotent per `key` (so a retry after a lost response doesn't create a duplicate).

## 2. Frontend setup

```bash
npm install
cp .env.example .env.local     # set VITE_API_BASE to your Worker URL
npm run dev                    # http://localhost:5173
```

Grades and paper types are defined in [src/lib/constants.ts](src/lib/constants.ts). **Subjects are open-ended**: the upload form is a pick-or-type box, the list comes from the subjects already in the library, and `DEFAULT_SUBJECTS` in the same file only supplies starter suggestions. Choosing a PDF auto-fills the form (see [src/lib/pdf-autofill.ts](src/lib/pdf-autofill.ts)), including a proposed new subject when the file does not match a known one.

Scripts: `npm run dev`, `npm run build`, `npm run lint`.
