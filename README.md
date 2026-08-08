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

# AI features use the Freebuff API (replaces the old GEMINI_API_KEY)
FREEBUFF_API_KEY=your_freebuff_api_key
# Optional: FREEBUFF_API_URL, FREEBUFF_MODEL

# Optional: enable the /demo hackathon page (non-production only)
DEMO_MODE=false
```

- **Google OAuth** is the student sign-in provider and is unchanged.
- **Freebuff API key** powers the optional AI text features (explanation
  enhancement, plan summary). When it is empty, the app gracefully falls back
  to deterministic templates — no key is required to run the core experience.
- Secrets (`DATABASE_URL`, `AUTH_SECRET`, `*_API_KEY`, `*_SECRET`) must never
  be committed. `.gitignore` already excludes `.env*` (keeping `.env.example`).

## Database Setup

Run Prisma migrations and seed the database:

```bash
npx prisma migrate dev
npx prisma db seed
```

## Future Scope

- Smarter adaptive plan updates.
- AI-generated study suggestions.
- Placement-focused analytics.
- Institution dashboards for departments and training cells.
- Monetization through learner subscriptions and campus licensing.

## Project Status

PathForge AI is currently positioned as a strong MVP for personalized developer learning, combining structured planning, curated content, and practical skill evaluation in one platform.

## Deploying to Vercel

The project deploys to Vercel **without any Prisma schema changes**.

1. Push the repository to GitHub and import it in Vercel.
2. Add environment variables in the Vercel dashboard (Production + Preview):
   `DATABASE_URL`, `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`,
   `FREEBUFF_API_KEY` (optional), `AUTH_TRUST_HOST=true`.
3. `postinstall` runs `prisma generate` automatically; the build runs
   `prisma migrate deploy` (or apply migrations manually) before `next build`.
4. For a database migration, run `npx prisma migrate deploy` against the
   production database (e.g. via a Vercel Postgres connection or CI step).

### Deployment readiness checklist

- [ ] `DATABASE_URL` points to a reachable Postgres (local or hosted).
- [ ] `AUTH_SECRET` is a long random string (`npx auth secret`).
- [ ] Google OAuth credentials configured and authorized redirect URIs set
      (``https://<your-app>/api/auth/callback/google``).
- [ ] `AUTH_TRUST_HOST=true` set on Vercel (behind the proxy).
- [ ] `FREEBUFF_API_KEY` set if AI text features are wanted (optional).
- [ ] `DEMO_MODE` unset/false in production (the `/demo` route is disabled).
- [ ] Migrations applied to the production database (`prisma migrate deploy`).
- [ ] Change the seeded admin password (`prisma/seed.ts` uses `Vishalm_16`)
      before real users sign up.
- [ ] Run `npm run typecheck` and `npm run build` locally — both must pass.

## Security notes

- Admin pages and `/api/admin/*` routes require an `ADMIN` role (checked in
  middleware and in every admin route via `requireAdmin`).
- The credentials login is rate-limited in-app (5 attempts / 15 min per
  email); pair with a hosted rate limiter for hard guarantees.
- The `/demo` route is disabled in production and never prints credentials.

## License

This project is for educational and portfolio/demo purposes unless otherwise specified by the repository owner.