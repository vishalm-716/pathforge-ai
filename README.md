# PathForge AI

PathForge AI is a full-stack personalized learning platform built for aspiring developers who want a structured, practical path into programming.
Instead of giving every learner the same static course, PathForge AI creates milestone-based learning plans using the learner's chosen domain, current level, weekly availability, and learning style.

## Overview

PathForge AI is designed to solve a common problem in self-learning: learners often know **what** they want to study, but not **how** to sequence it, how much to study each week, or how to measure real progress.

The platform converts onboarding data into a guided plan with:
- Curated video resources.
- Topic-based quizzes.
- Coding challenges.
- Weekly milestones.
- Progress tracking and learner activity logs.
- Personalized recommendations and insight-ready data models.

## Core Idea

A learner selects a domain such as DSA, Python, JavaScript, React, Java, Node.js, or SQL.
The system then generates a structured plan with tasks distributed across weeks, maps relevant resources to each topic, and tracks how the learner progresses through videos, quizzes, coding tasks, and revision checkpoints.

This makes PathForge AI more than a content library — it acts like a lightweight personal learning guide for developer skill-building.

## Features

- Personalized learning plan generation based on domain, current level, weekly hours, target weeks, and learning style.
- Weekly milestone creation with ordered tasks and due dates.
- Curated YouTube learning resources matched to track topics and difficulty.
- Quiz and coding practice integrated into the same learning flow.
- Track switching with automatic plan regeneration.
- Student profile, streak, progress, and activity tracking.
- Notifications and agent-insight-ready architecture for learner nudges and recommendations.
- Admin-ready data structure for content, progress, and learner management.

## Supported Learning Tracks

The seeded project data currently supports:
- Data Structures & Algorithms
- Python Programming
- JavaScript Development
- React.js Development
- Java Programming
- Node.js Backend Development
- SQL Database Management

Each track includes curated topics, resources, and assessment content structured for beginner and intermediate progression.

## Tech Stack

- **Frontend:** Next.js
- **Backend:** Next.js Route Handlers
- **ORM:** Prisma
- **Database:** PostgreSQL
- **Authentication:** Session-based auth architecture with user/profile models
- **Language:** TypeScript

## System Flow

1. The learner signs in and completes onboarding.
2. The platform stores preferences such as domain, current level, weekly hours, target duration, and learning style.
3. The plan generator creates milestones and tasks for the selected track.
4. Video tasks are enriched with the best matching curated resources.
5. The learner completes quizzes, coding tasks, and revision steps.
6. Progress, activity, submissions, and notifications are stored for tracking and personalization.

## Data Model Highlights

PathForge AI includes structured models for:
- Users and student profiles.
- Tracks and learning resources.
- Learning plans, milestones, and tasks.
- Questions, quiz attempts, and coding submissions.
- Notifications, activity logs, and agent insights.

This architecture makes the platform extensible for future features such as adaptive recommendations, instructor dashboards, placement analytics, and premium learner insights.

## Why PathForge AI

Most learners struggle because online learning is fragmented: one site for videos, another for coding practice, another for notes, and no clear roadmap connecting them.

PathForge AI brings these elements together into one guided system so learners can move from confusion to consistency with a plan that feels personalized, practical, and measurable.

## Getting Started

Clone the repository and install dependencies:

```bash
git clone <your-repo-url>
cd <your-project-folder>
npm install
```

Run the development server:

```bash
npm run dev
```

Open `http://localhost:7000` in your browser.

## Environment Setup

Copy `.env.example` to `.env` and configure:

```env
DATABASE_URL=your_postgresql_connection_string
AUTH_SECRET=your_nextauth_secret            # generate with: npx auth secret
AUTH_GOOGLE_ID=your_google_oauth_client_id
AUTH_GOOGLE_SECRET=your_google_oauth_client_secret

# Optional AI text features — DISABLED by default (see Known limitations)
FREEBUFF_API_KEY=""
# Optional: FREEBUFF_API_URL, FREEBUFF_MODEL

# Optional: enable the /demo hackathon page (non-production only)
DEMO_MODE=false
```

- **Google OAuth** is the student sign-in provider and is unchanged.
- **AI text features are off unless you supply a verified endpoint.** See
  *Known limitations* — no supported Freebuff inference API could be verified,
  so the deterministic templates are used and no network call is made.
- Secrets (`DATABASE_URL`, `AUTH_SECRET`, `*_API_KEY`, `*_SECRET`) must never
  be committed. `.gitignore` already excludes `.env*` (keeping `.env.example`).

## Database Setup

Run Prisma migrations and seed the database:

```bash
npx prisma migrate dev
npx prisma db seed
```

`prisma db seed` seeds **content only** (tracks, YouTube resources, and the
MCQ / coding question bank). It does not create an admin account or a public
demo student unless you explicitly opt in — see *Creating the production admin*
and `SEED_DEMO_DATA` in `.env.example`.

For production, use `npx prisma migrate deploy` (never `migrate reset` or
`db push`).

## Future Scope

- Smarter adaptive plan updates.
- AI-generated study suggestions.
- Placement-focused analytics.
- Institution dashboards for departments and training cells.
- Monetization through learner subscriptions and campus licensing.

## Project Status

PathForge AI is currently positioned as a strong MVP for personalized developer learning, combining structured planning, curated content, and practical skill evaluation in one platform.

## Deploying to Vercel

The project deploys to Vercel **without any Prisma schema changes**. The
frontend and the `app/api/*` routes deploy together as one Next.js serverless
app — there is no separate backend service.

### What actually happens on Vercel

- `postinstall` runs `prisma generate` automatically (see `package.json`), so
  the Prisma client is built on Vercel's machines. **No** database connection is
  needed at build time.
- The build command is plain `next build`. **Migrations are NOT run during the
  build** — this is deliberate. Preview builds must never be able to mutate the
  production database.
- Apply migrations to the production database explicitly, once, from a machine
  that holds the production `DATABASE_URL`:
  `npx prisma migrate deploy`
- The Framework Preset must be **Next.js** (Vercel dashboard → Settings →
  General, or `vercel project update pathforge-ai --framework nextjs`). With the
  preset left as “Other”, Vercel treats the build as a static site and the
  deploy fails with `Unable to find lambda for route: /…`.
- Next.js default output is used — **no** `output: "export"`, which would break
  every `app/api/*` route.
- Do **not** add an `engines` block to a `vercel.json`. Vercel rejects the file
  outright with `Invalid vercel.json - should NOT have additional property
  'engines'`. Set the Node.js version in the project settings instead.

### Environment variables (set in the Vercel dashboard, never in Git)

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | yes | Hosted PostgreSQL connection string. Must **not** point at `localhost` / `127.0.0.1`. |
| `AUTH_SECRET` | yes | Read automatically by Auth.js. Generate with `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`. |
| `AUTH_GOOGLE_ID` | yes | Google OAuth client ID. Read by `lib/auth.ts`. |
| `AUTH_GOOGLE_SECRET` | yes | Google OAuth client secret. Read by `lib/auth.ts`. |
| `DEMO_MODE` | no | Must be `false` in production — disables the `/demo` route. |

`trustHost: true` is hard-coded in `lib/auth.ts`, so `AUTH_TRUST_HOST` is **not**
required. There is no `NEXT_PUBLIC_*` server secret in this project.

### Google OAuth

In Google Cloud Console → *APIs & Services* → *Credentials* → your OAuth
client → *Authorized redirect URIs*, add the exact production domain:

```
https://<your-vercel-domain>/api/auth/callback/google
```

Add a second entry for local development (`http://localhost:7000/api/auth/callback/google`)
if you still develop locally. Google rejects wildcard domains, so the real
production domain must be known first.

### Creating the production admin

`prisma/seed.ts` never creates a default or shared admin account. To create one,
supply the credentials **out of band** (never commit them, never type a password
into a shell you share):

```bash
SEED_ADMIN_EMAIL="you@example.com" \
SEED_ADMIN_PASSWORD="<generated, 12+ chars>" \
npx prisma db seed
```

The password is bcrypt-hashed (cost 12) before storage. An existing user's
password is never overwritten by the seed.

### Deployment readiness checklist

- [ ] `DATABASE_URL` points to a reachable hosted Postgres (no localhost).
- [ ] `AUTH_SECRET` is a fresh, long random string (rotate any secret ever
      exposed in a screenshot, log, or chat).
- [ ] Google OAuth authorized redirect URI set to the real production domain.
- [ ] `DEMO_MODE` unset / `false` in production.
- [ ] `npx prisma migrate deploy` applied to the production database.
- [ ] Production admin created via `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`.
- [ ] `npm run typecheck` and `npm run build` pass.

## Known limitations

- **AI text features are disabled by default.** The app's AI paths call an
  OpenAI-compatible endpoint configured through `FREEBUFF_API_URL` /
  `FREEBUFF_API_KEY`. As of the last review, Freebuff (freebuff.com) is
  documented as a free *CLI coding agent* — no public, documented runtime
  inference API or key issuance could be verified. With the key empty, the app
  uses deterministic templates and makes no network call. The flag
  `FREEBUFF_API_URL` defaults to empty precisely so an unverified endpoint is
  never contacted.
- **The coding evaluator is heuristic, not a real judge.** Coding submissions
  are scored by keyword/structure matching (`expectedKeywords`), not by
  compiling or executing code against test cases.
- **Login rate limiting is in-process.** The credentials (admin) provider
  limits 5 failed attempts per email per 15 minutes using in-memory state, which
  is per serverless instance on Vercel. Use a hosted limiter for hard guarantees.
- **No automated test suite.** Verification is manual (`typecheck` + `build` +
  manual testing against the deployed domain).
- **Preview deployments share one database.** Preview branches point at the
  same `DATABASE_URL` as production unless you provision a separate database, so
  a preview can read/write real data.

## Security notes

- Admin pages and `/api/admin/*` routes require an `ADMIN` role (checked in
  middleware and in every admin route via `requireAdmin`).
- API routes perform ownership checks before reading or writing another
  student's rows (tasks, notifications, quiz attempts).
- Task completion is idempotent, so a double-submit cannot double-count
  minutes, progress, or streaks.
- The credentials login is rate-limited in-app (5 attempts / 15 min per
  email); pair with a hosted rate limiter for hard guarantees.
- The `/demo` route is disabled in production and never prints credentials.
- Never commit `.env*` (except `.env.example`). If a secret was ever committed,
  `.gitignore` alone is not enough — the secret must be rotated **and** the git
  history rewritten.

## License


This project is for educational and portfolio/demo purposes unless otherwise specified by the repository owner.