# Contract Playbook (prototype)

A personal portfolio project: a dynamic playbook for SaaS contract
negotiation. Built on Next.js + Payload CMS + Postgres, deployed on Vercel.

This repo currently covers **Chunk 1**: the data model and an admin UI to
create, view, edit and delete records. The review workflow (Chunk 2) and
pattern surfacing (Chunk 3) come later.

## Stack

- **Next.js 15** (App Router) — the web framework.
- **Payload CMS 3** — auto-generates the admin UI from collection schemas
  defined in TypeScript. Acts as the "Django admin" of the JS world.
- **Postgres** — primary data store. Hosted via Vercel's Neon integration.
- **Vercel** — hosting and CI.

## The data model

Five collections, all in `src/collections/`:

| Collection | What it represents |
|---|---|
| `ClauseFamilies` | Reference list — e.g. *Limitation of Liability*, *IP Indemnity*. |
| `SubClauses` | Reference list — e.g. *General cap*, *Confidentiality cap*. Independent of family. |
| `PlaybookEntries` | One position on one clause family + sub-clause at one tier. |
| `CounterpartyDrafts` | One incoming clause to review, with deal context. |
| `NegotiationLogEntries` | One closed negotiation, linked to a draft and (usually) a playbook entry. |

Shared dropdown values — tiers, approval levels, industries, deal-value
bands, etc. — live in `src/collections/options.ts`. To add a new option,
add an entry to the relevant list and redeploy.

The admin user is the `Users` collection (auth-enabled). The first user is
created on first visit to `/admin`.

## Running locally

```bash
npm install
cp .env.example .env
# Edit .env: paste a Postgres connection string and a random PAYLOAD_SECRET
npm run dev
```

Then open <http://localhost:3000/> — it links to the admin at `/admin`.

## Deploying to Vercel

The repo is wired to deploy to Vercel out of the box. You need two env vars
in the Vercel project:

- `DATABASE_URL` — Postgres connection string (auto-set if you provision via
  Vercel → Storage → Neon).
- `PAYLOAD_SECRET` — any long random string (used to sign auth cookies).

On first deploy, Payload runs schema migrations against the database
automatically the first time the app starts.
