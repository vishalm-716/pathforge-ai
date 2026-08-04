# Implementation Plan

## Overview

Implement a complete YouTube/video learning flow for students in the PathForge app, covering resource seeding for all 5 tracks, plan generation with resource linking, student task detail UI, admin features, and build verification.

## Tasks

- [x] 1. Fix Seed Script — Full Resource and Question Data for All 5 Tracks
  - Rewrite `prisma/seed.ts` to use `upsert` (keyed on `youtubeUrl` for resources, `questionText` for questions) for all creates so re-runs are idempotent
  - Add 4 BEGINNER + 4 INTERMEDIATE YouTube resources for Python track with real YouTube URLs
  - Add 4 BEGINNER + 4 INTERMEDIATE YouTube resources for JavaScript track with real YouTube URLs
  - Add 4 BEGINNER + 4 INTERMEDIATE YouTube resources for React track with real YouTube URLs
  - Add 4 BEGINNER + 4 INTERMEDIATE YouTube resources for Java track with real YouTube URLs
  - Convert existing DSA resource `create` calls to `upsert` so they don't error on re-run
  - Add 5 BEGINNER MCQ + 5 INTERMEDIATE MCQ + 2 BEGINNER CODING + 2 INTERMEDIATE CODING questions for each of the 5 remaining tracks (JS, React, Java) — Python and DSA already exist but must also be converted to upsert
  - Run `npx prisma db seed` and confirm no errors; confirm all 5 tracks show non-zero resource and question counts
  - _Requirements: 1_

- [x] 2. Plan Generator — DB-Lookup of resourceId for VIDEO Tasks
  - Add a new async function `generatePlanWithResources(profile, prismaClient)` in `lib/agent/plan-generator.ts` that queries Resources by track slug + topic + difficulty preference
  - Update `app/api/onboarding/route.ts` to call `generatePlanWithResources` instead of `generatePlan`, passing the prisma client
  - Ensure returned `PlanTask` objects carry a `resourceId` field when a matching Resource is found; `null` otherwise
  - Pass `resourceId` through to `prisma.learningPlan.create` task creates in the onboarding route
  - _Requirements: 2_

- [x] 3. Dashboard API — Include Resource Relation on Tasks
  - Update `app/api/dashboard/route.ts` tasks include to add `resource: true` on the tasks query
  - Ensure `upcomingTasks` array also carries the `resource` field
  - _Requirements: 7, 8_

- [x] 4. Student Task Detail Page — Full VIDEO Task UI
  - Fetch task data via dashboard API and find the task including its `resource` relation
  - Display resource `title`, `topic`, `estimatedMinutes` as "{n} min", `difficulty` badge when resource is present
  - Add Video/Playlist badge based on whether `youtubeUrl` contains `/playlist` or `list=`
  - Add a video-type icon adjacent to the badge
  - Render `<a href={resource.youtubeUrl} target="_blank" rel="noopener noreferrer">` with label "Watch Video" or "Open Playlist" (NOT `href="#"`)
  - Show clean fallback "No video resource available for this task yet." when `resourceId` is null or resource has no URL — no broken button
  - Ensure clicking the link does NOT trigger task completion
  - Keep "Mark as Complete" + `actualMinutes` input as separate controls; show completion error inline on non-2xx response
  - _Requirements: 3, 4, 5, 6_

- [x] 5. Admin Delete Student
  - Add `DELETE` handler to `app/api/admin/students/route.ts` that deletes user by id (cascade handles profile/plan); guard against deleting currently logged-in admin
  - Add confirmation modal component (not browser `confirm()`) to `app/admin/students/page.tsx`
  - Add delete button per student row that opens the modal
  - On confirm: call `DELETE /api/admin/students?id={id}`, show success/error toast, refresh table
  - _Requirements: 9_

- [x] 6. Weekly Hours — Settings Persist + Dashboard Display Fix
  - Add `GET` handler to `app/api/settings/route.ts` that returns current `weeklyHours` from StudentProfile
  - Confirm `PUT` handler already persists `weeklyHours` to `StudentProfile` (it does — verify only)
  - Update `app/student/dashboard/page.tsx` stats section to show `profile.weeklyHours` as "Weekly Goal" card instead of or in addition to the current "Completed" card
  - Dashboard must read `weeklyHours` fresh from `profile.weeklyHours` returned by `/api/dashboard` on every load
  - _Requirements: 7_

- [x] 7. Difficulty-Aware Quiz and Coding APIs
  - Update `app/api/quiz/questions/route.ts` to filter questions by `difficulty: profile.currentLevel`
  - Shuffle returned questions (Fisher-Yates or array sort with random)
  - Add fallback: if fewer than 5 questions at student's level, fill from other difficulty and return `fallbackUsed: true`
  - Update `app/api/code/questions/route.ts` to filter by `difficulty: profile.currentLevel`
  - Shuffle and return coding questions filtered by difficulty
  - _Requirements: 1_

- [x] 8. Admin Tracks Page — Per-Difficulty Content Breakdown
  - Update `app/api/admin/tracks/route.ts` GET to include resource and question counts broken down by difficulty
  - Update `app/admin/tracks/page.tsx` to display "Beginner: X resources, Y MCQs, Z coding" and "Intermediate: X resources, Y MCQs, Z coding" per track
  - Show a warning badge on tracks that have 0 resources or 0 questions for either difficulty level
  - _Requirements: 9_

- [-] 9. Seed Node.js and SQL Tracks — Resources, Questions, and Track Records
  - Add `nodejsTrack` and `sqlTrack` upserts in `prisma/seed.ts` (slugs: `"nodejs"`, `"sql"`) so the plan generator can resolve resources for those domains
  - Seed 8 YouTube resources for Node.js track (4 BEGINNER, 4 INTERMEDIATE) covering topics matching `NODEJS_TOPICS` keys in `plan-generator.ts`: `"Node.js Fundamentals"`, `"HTTP & Express.js"`, `"Async Patterns & Databases"` — at least 2 resources per topic
  - Seed 8 YouTube resources for SQL track (4 BEGINNER, 4 INTERMEDIATE) covering topics matching `SQL_TOPICS` keys: `"SQL Fundamentals"`, `"Joins & Aggregations"`, `"Subqueries & Database Design"` — at least 2 resources per topic
  - Add 5 BEGINNER MCQ + 5 INTERMEDIATE MCQ + 2 BEGINNER CODING + 2 INTERMEDIATE CODING questions for Node.js track, topics aligned with `NODEJS_TOPICS` keys
  - Add 5 BEGINNER MCQ + 5 INTERMEDIATE MCQ + 2 BEGINNER CODING + 2 INTERMEDIATE CODING questions for SQL track, topics aligned with `SQL_TOPICS` keys
  - All resource and question inserts must use `upsert` keyed on `youtubeUrl` (resources) and `questionText` (questions) for idempotency
  - _Requirements: 1_

- [ ] 10. Fix JS Coding Question Topic Mismatch — Seed Idempotency Guard
  - In `prisma/seed.ts`, locate the `"Flatten a nested array"` CODING question upsert and confirm its `update` clause sets `topic: "JavaScript Basics"` (not `"Async JavaScript"`) — add the `update` field if missing so a re-run corrects any stale row already in the database
  - Scan all other JS, React, and Java CODING questions to verify their `topic` values match the `JS_TOPICS` / `REACT_TOPICS` / `JAVA_TOPICS` map keys used in `plan-generator.ts`; fix any mismatches by updating both `create.topic` and `update.topic` in the same upsert
  - _Requirements: 1_

- [ ] 11. Build Verification and Full Content Audit
  - Run `npx prisma generate`
  - Run `npx prisma db seed` and confirm no errors
  - Query the database to verify all 7 tracks (DSA, Python, JavaScript, React, Java, Node.js, SQL) have: ≥ 4 resources (≥ 2 BEGINNER, ≥ 2 INTERMEDIATE) and ≥ 10 questions (≥ 5 MCQ BEGINNER, ≥ 5 MCQ INTERMEDIATE, ≥ 2 CODING)
  - Run `npm run build` and confirm zero TypeScript/build errors
  - Report terminal output and list every changed file
  - _Requirements: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10_

## Task Dependency Graph

```json
{
  "waves": [
    { "wave": 1, "tasks": ["1"] },
    { "wave": 2, "tasks": ["2", "5", "7", "8"] },
    { "wave": 3, "tasks": ["3"] },
    { "wave": 4, "tasks": ["4", "6"] },
    { "wave": 5, "tasks": ["9", "10"] },
    { "wave": 6, "tasks": ["11"] }
  ]
}
```

## Notes

- Task 1 must complete before Tasks 2 and 7 (seed data required for plan generation and quiz filtering)
- Task 2 must complete before Task 3 (resourceId must be in DB before dashboard query)
- Task 3 must complete before Tasks 4 and 6 (resource relation needed for UI)
- Tasks 9 and 10 can run in parallel — both modify `seed.ts` in independent sections (Node.js/SQL additions vs. JS topic fix)
- Task 11 (Build Verification) depends on all feature tasks completing successfully
- All seed operations must use upsert to be idempotent
- Node.js and SQL `TOPICS` maps already exist in `plan-generator.ts` — seed topic strings must match those map keys exactly (case-sensitive)
