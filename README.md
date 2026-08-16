# Panchangam

Today's Panchangam, beautifully simplified.

A modern web landing page for Panchangam — a premium Panchangam experience that makes traditional information easy to understand and use, plus a versioned API scaffold.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the landing page.

## Pages

- `/` — Marketing landing page
- `/today` — Today's Panchangam (stub product page)
- `/premium` — Premium information
- `/docs` — API documentation
- `/about`, `/contact`, `/privacy`, `/terms` — Footer pages

## API

The app now exposes versioned endpoints under `/api/v1/` for:

- Panchangam date, today, yesterday, tomorrow, range, month
- Calendar date, month, year
- Festivals date, month, year
- Tithis, nakshatras, yogas, and karanas search/date routes

The current implementation uses reference/precomputed data and validates
`latitude`, `longitude`, and `timezone` at the API boundary. It does not yet
contain a real astronomical calculation engine.

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- Framer Motion
- Radix UI (Accordion, Dialog)
- System font stack

## Build

```bash
npm run build
npm start
```

Run the API contract tests:

```bash
npm test
```
