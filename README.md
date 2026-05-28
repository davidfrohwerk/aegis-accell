# Aegis Accell

Open-source epistemic resilience layer for AI-accelerated research environments.

This MVP is a local-first TypeScript web app for tracking research sessions, claims, assumptions, provenance, contradictions, failure markers, red-team checkpoints, and salvage notes.

## Stack

- Next.js App Router
- TypeScript
- Local JSON storage in `data/sessions.json`
- Vitest unit tests for the core model and export functions

## Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

On this Windows machine, if `npm` points at a missing `AppData\Roaming\npm` CLI, run this in the same PowerShell session first:

```powershell
$env:npm_config_prefix='C:\Program Files\nodejs'
```

## Scripts

```bash
npm run dev
npm run typecheck
npm test
npm run build
```

## Storage

Sessions are stored as a JSON array in `data/sessions.json`. The app reads and writes that file through local Next.js API routes. There is no authentication and no database in this MVP.

## Exports

Open a saved session and use:

- `JSON` for a pretty-printed session export.
- `Markdown` for a readable research brief export.

Export buttons are active after the current session has been saved.

## Vision

See `docs/vision.md`.
