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

Create a `.env` file and configure at least:

```env
DATABASE_URL=your_postgresql_connection_string
```

If your local setup also uses auth configuration or seeded credentials, add the required auth environment values before running the project.

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

## License

This project is for educational and portfolio/demo purposes unless otherwise specified by the repository owner.