# PDF Library

A proof-of-concept PDF library web app: browse, upload, and download PDF files.
Built with React, Vite, TypeScript, Tailwind CSS, and shadcn/ui.

This is a frontend client only — it talks to an existing serverless backend
(Cloudflare Worker + R2 + D1) described in `src/lib/api.ts` and `src/lib/types.ts`.

## Setup

```bash
npm install
cp .env.example .env   # then set VITE_API_BASE to your Worker URL
npm run dev
```

## Scripts

- `npm run dev` — start the Vite dev server
- `npm run build` — type-check and build for production
- `npm run lint` — run ESLint
- `npm run preview` — preview the production build

## Backend contract

See `src/lib/api.ts` for the exact endpoints this app calls
(`POST /upload-url`, `POST /files`, `GET /files`, `GET /files/:id/download`).
