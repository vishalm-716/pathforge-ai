# Requirements Document

## Introduction

This feature delivers a complete YouTube/video learning flow for students in the PathForge app. Students assigned a learning plan see their VIDEO tasks enriched with resource metadata (title, topic, duration, difficulty, video/playlist badge). Clicking a task opens the linked YouTube URL in a new tab without auto-completing the task. Students explicitly mark tasks done after watching. Admins can seed and manage YouTube resources that are automatically linked to generated VIDEO tasks. The scope covers five tracks (DSA, Python, JavaScript, React, Java), each seeded with at least four curated YouTube resources (two BEGINNER, two INTERMEDIATE).

---

## Glossary

- **Resource**: A database record holding a YouTube video or playlist URL, linked to a Track via `trackId`, with fields: `title`, `topic`, `youtubeUrl`, `estimatedMinutes`, `difficulty`, `description`, `orderIndex`.
- **LearningTask**: A planned unit of work inside a Milestone, optionally linked to a Resource via `resourceId`. When `taskType = VIDEO`, a `resourceId` MUST be present unless no matching Resource exists.
- **Track**: A named learning subject (DSA, Python, JavaScript, React, Java) identified by `slug`.
- **VideoTask**: A LearningTask whose `taskType` is `VIDEO`.
- **PlaylistUrl**: A YouTube URL whose path contains `/playlist` or query parameter `list=`.
- **VideoUrl**: A YouTube URL that is not a PlaylistUrl (single video).
- **Resource_Badge**: A UI label that displays "Playlist" for PlaylistUrls and "Video" for VideoUrls.
- **Task_Detail_Page**: The page at `/student/tasks/[id]` that shows task details and the completion control.
- **Admin_Resources_Page**: The page at `/admin/resources` where admins manage Resources.
- **Plan_Generator**: The `lib/agent/plan-generator.ts` module that maps domain topics to PlanTasks.
- **Seed_Script**: The `prisma/seed.ts` file that populates the database with initial data.

---

## Requirements

### Requirement 1: Seed YouTube Resources for All Tracks

**User Story:** As an administrator, I want the database to contain real, curated YouTube resources for every supported track, so that VIDEO tasks generated during onboarding always have a valid resource to link to.

#### Acceptance Criteria

1. THE Seed_Script SHALL create at least 2 BEGINNER-difficulty Resources and at least 2 INTERMEDIATE-difficulty Resources for each of the five tracks individually: DSA, Python, JavaScript, React, and Java — such that after the seed run, querying Resources grouped by `track.slug` yields at least 4 records per slug.
2. WHEN the Seed_Script is executed, THE Seed_Script SHALL associate every Resource with a valid `trackId` by first finding or creating the Track record by `slug`, then using that record's `id` as `trackId`.
3. THE Seed_Script SHALL use `upsert` keyed on a stable unique field (e.g., `youtubeUrl`) so that re-running the script does not create duplicate Resources; if the schema lacks a unique constraint on `youtubeUrl`, the Seed_Script SHALL add it via a migration before seeding.
4. WHEN a Resource's `youtubeUrl` is a playlist URL (contains `/playlist` or `list=` parameter), THE Seed_Script SHALL store the URL verbatim without stripping query parameters or modifying the path.
5. THE Seed_Script SHALL set `estimatedMinutes` to a positive integer (≥ 1) for every Resource record; a value of 0 or negative SHALL cause the seed to throw an error and halt.
6. THE Seed_Script SHALL set `youtubeUrl` to a non-empty string that starts with `https://` for every Resource record; an empty or non-HTTPS URL SHALL cause the seed to throw an error and halt.

---

### Requirement 2: Link VIDEO Tasks to Resources During Plan Generation

**User Story:** As a student, I want every VIDEO task in my learning plan to reference a real YouTube resource, so that I can always find and watch the relevant content.

#### Acceptance Criteria

1. WHEN the Plan_Generator creates a task with `taskType = VIDEO` for a given `domain` and `topic`, THE Plan_Generator SHALL query the database for Resources where `track.slug` matches the `domain` and `resource.topic` matches the task's `topic` (case-insensitive), then assign the best-matching Resource's `id` to the task's `resourceId`.
2. WHEN no Resource matches both `track.slug` and `topic` for a VIDEO task, THE Plan_Generator SHALL set `resourceId = null` on that task and still persist the task with `taskType = VIDEO`.
3. THE Plan_Generator SHALL return each resolved `resourceId` as part of its output plan structure, and the Onboarding route SHALL pass these values directly into the Prisma `LearningTask.create` call — the lookup responsibility belongs to the Plan_Generator, not the Onboarding route.
4. WHEN a BEGINNER-level student is onboarded and multiple Resources exist for the same `track.slug` + `topic` combination, THE Plan_Generator SHALL select the Resource with `difficulty = BEGINNER`; if no BEGINNER-difficulty Resource exists for that combination, THE Plan_Generator SHALL fall back to any available Resource for that `track.slug` + `topic`, selecting the one with the lowest `orderIndex`.
5. WHEN an INTERMEDIATE-level student is onboarded and multiple Resources exist for the same `track.slug` + `topic` combination, THE Plan_Generator SHALL select the Resource with `difficulty = INTERMEDIATE`; if no INTERMEDIATE-difficulty Resource exists for that combination, THE Plan_Generator SHALL fall back to any available Resource for that `track.slug` + `topic`, selecting the one with the lowest `orderIndex`.

---

### Requirement 3: Display VIDEO Task Details with Resource Metadata

**User Story:** As a student, I want to see the video's title, topic, duration, difficulty, and a resource type badge when I open a VIDEO task, so that I know exactly what I am about to watch before clicking.

#### Acceptance Criteria

1. WHEN a student navigates to the Task_Detail_Page for a VideoTask that has a linked Resource, THE Task_Detail_Page SHALL display the Resource's `title` as visible text in the page body.
2. WHEN a student navigates to the Task_Detail_Page for a VideoTask that has a linked Resource, THE Task_Detail_Page SHALL display the Resource's `topic` as visible text in the page body.
3. WHEN a student navigates to the Task_Detail_Page for a VideoTask that has a linked Resource, THE Task_Detail_Page SHALL display the Resource's `estimatedMinutes` value formatted as "{n} min" (e.g., "15 min").
4. WHEN a student navigates to the Task_Detail_Page for a VideoTask that has a linked Resource, THE Task_Detail_Page SHALL display the Resource's `difficulty` value verbatim as stored (either "BEGINNER" or "INTERMEDIATE").
5. WHEN a student navigates to the Task_Detail_Page for a VideoTask that has a linked Resource whose `youtubeUrl` contains `/playlist` or `list=`, THE Task_Detail_Page SHALL display the Resource_Badge labelled "Playlist".
6. WHEN a student navigates to the Task_Detail_Page for a VideoTask that has a linked Resource whose `youtubeUrl` does not contain `/playlist` or `list=`, THE Task_Detail_Page SHALL display the Resource_Badge labelled "Video".
7. WHEN a student navigates to the Task_Detail_Page for a VideoTask that has a linked Resource, THE Task_Detail_Page SHALL render a video-type icon (such as a play button or video camera symbol) positioned immediately adjacent to the Resource_Badge, visually distinct from icons used for non-video task types.

---

### Requirement 4: Open YouTube URL Safely in a New Tab

**User Story:** As a student, I want clicking the "Watch Video" or "Open Playlist" button to open YouTube in a new browser tab, so that I do not lose my current learning progress page.

#### Acceptance Criteria

1. WHEN a student activates the watch action button on the Task_Detail_Page for a VideoTask with a linked Resource, THE Task_Detail_Page SHALL navigate to the Resource's `youtubeUrl` in a new browser tab without navigating away from the current page.
2. THE Task_Detail_Page SHALL render the watch action anchor element with both `target="_blank"` and `rel="noopener noreferrer"` attributes set simultaneously.
3. WHEN a VideoTask has a non-null `resourceId` with an associated Resource record containing a non-empty `youtubeUrl`, THE Task_Detail_Page SHALL render the watch action as an `<a>` element whose `href` is set exactly to the Resource's `youtubeUrl`.
4. WHEN the `youtubeUrl` of a linked Resource contains `/playlist` or `list=`, THE Task_Detail_Page SHALL label the watch action button "Open Playlist".
5. WHEN the `youtubeUrl` of a linked Resource does not contain `/playlist` or `list=`, THE Task_Detail_Page SHALL label the watch action button "Watch Video".
6. WHEN a VideoTask has `resourceId = null` or its linked Resource has an empty `youtubeUrl`, THE Task_Detail_Page SHALL NOT render the watch action button.

---

### Requirement 5: Preserve Manual Completion — No Auto-Complete on Link Click

**User Story:** As a student, I want the act of opening a YouTube link to never automatically mark the task complete, so that my progress accurately reflects tasks I have actually finished.

#### Acceptance Criteria

1. THE Task_Detail_Page SHALL NOT invoke `POST /api/tasks/complete` or any completion side-effect when the watch action button is activated.
2. WHEN a student activates the watch action button and then returns to the Task_Detail_Page (without having submitted the completion form), THE Task_Detail_Page SHALL display the task status as its prior value (NOT_STARTED or IN_PROGRESS) — the status SHALL NOT change due to the link click alone.
3. THE Task_Detail_Page SHALL render the "Mark as Complete" button and the time-spent input (`actualMinutes`) as distinct interactive elements that are visually and functionally separate from the watch action button.
4. WHEN a student submits the "Mark as Complete" action with an `actualMinutes` value that is an integer between 1 and 300 inclusive, THE Task_Detail_Page SHALL call `POST /api/tasks/complete` with `{ taskId, actualMinutes }`.
5. WHEN `POST /api/tasks/complete` returns a 2xx success response, THE Task_Detail_Page SHALL update the displayed task status to "COMPLETED" and hide both the "Mark as Complete" button and the `actualMinutes` time-spent input.
6. WHEN `POST /api/tasks/complete` returns a non-2xx response, THE Task_Detail_Page SHALL display an inline error message near the completion controls and SHALL NOT change the displayed task status.

---

### Requirement 6: Fallback State for VideoTasks Without a Resource

**User Story:** As a student, I want to see a clear message instead of a broken button when a VIDEO task has no linked resource, so that the UI remains usable even with incomplete data.

#### Acceptance Criteria

1. WHEN a student navigates to the Task_Detail_Page for a VideoTask whose `resourceId` is null, THE Task_Detail_Page SHALL display a visible fallback message reading "No video resource available for this task yet." (exact text or equivalent clear phrasing).
2. WHEN a student navigates to the Task_Detail_Page for a VideoTask whose `resourceId` is null, THE Task_Detail_Page SHALL NOT render a watch action button (neither "Watch Video" nor "Open Playlist").
3. WHEN a student navigates to the Task_Detail_Page for a VideoTask whose `resourceId` is null, THE Task_Detail_Page SHALL still display the task title, topic, estimated minutes, and due date.
4. WHEN a student navigates to the Task_Detail_Page for a VideoTask whose `resourceId` is null, THE Task_Detail_Page SHALL still render the "Mark as Complete" button and the `actualMinutes` input so the student can complete the task.

---

### Requirement 7: Dashboard and Plan View Show VIDEO Task Navigation

**User Story:** As a student, I want VIDEO tasks listed on my dashboard and plan page to link directly to the Task_Detail_Page, so that I can reach the watch button in one click.

#### Acceptance Criteria

1. WHEN the student dashboard renders an upcoming task whose `taskType` is VIDEO, THE Dashboard SHALL render that task as a link whose `href` is `/student/tasks/{taskId}`.
2. WHEN the plan page renders a task whose `taskType` is VIDEO, THE Plan_Page SHALL render that task as a link whose `href` is `/student/tasks/{taskId}`.
3. THE Dashboard API (`GET /api/dashboard`) SHALL include the `resourceId` field on every task object returned inside `plan.milestones[].tasks`.
4. THE Task_Detail_Page SHALL fetch and render Resource data (including `youtubeUrl`, `title`, `topic`, `estimatedMinutes`, `difficulty`) server-side for the task's `resourceId`, so the page has resource metadata on initial load without a client-side secondary request.

---

### Requirement 8: Dashboard API Exposes Resource Data for VIDEO Tasks

**User Story:** As a student, I want the task data returned by the dashboard API to include enough resource information so that the UI can render the video details without an extra network round-trip for simple task cards.

#### Acceptance Criteria

1. WHEN a Milestone's task has `taskType = VIDEO` and a non-null `resourceId`, THE Dashboard API response SHALL include a nested `resource` object on that task containing exactly these fields: `id`, `title`, `topic`, `youtubeUrl`, `estimatedMinutes`, `difficulty`.
2. WHEN a Milestone's task has `resourceId = null`, THE Dashboard API response SHALL include `"resource": null` on that task object.
3. THE Dashboard API SHALL include the `resource` relation in its Prisma query using `include: { resource: true }` (or equivalent eager-load) on the tasks query, so that resource data is fetched in a single database round-trip.

---

### Requirement 9: Admin Can Create, Edit, and Delete Resources

**User Story:** As an administrator, I want to create, update, and delete video resources with all relevant fields via the admin UI, so that the resource library stays current and accurate.

#### Acceptance Criteria

1. WHEN an admin submits the resource creation form with valid values for `trackId`, `topic`, `title`, `youtubeUrl`, `difficulty`, and `estimatedMinutes`, THE Admin_Resources_Page SHALL call `POST /api/admin/resources` and, on a 2xx response, append the new Resource to the displayed list without a full page reload.
2. WHEN an admin submits an edit for an existing resource with valid values, THE Admin_Resources_Page SHALL call `PUT /api/admin/resources` with the resource `id` and updated fields, and on a 2xx response, update that resource's row in the displayed list without a full page reload.
3. WHEN an admin confirms deletion of a resource, THE Admin_Resources_Page SHALL call `DELETE /api/admin/resources?id={id}` and, on a 2xx response, remove that resource's row from the displayed list without a full page reload.
4. THE Admin_Resources_Page SHALL display each Resource's `title`, associated Track name, `topic`, `estimatedMinutes` formatted as "{n} min", `difficulty`, and an external-link icon that opens `youtubeUrl` in a new tab with `target="_blank" rel="noopener noreferrer"`.
5. THE Admin_Resources_Page SHALL show a Resource_Badge ("Video" or "Playlist") for each listed resource, determined by whether the `youtubeUrl` contains `/playlist` or `list=`.

---

### Requirement 10: URL Validation on Resource Save

**User Story:** As an administrator, I want the system to reject non-HTTP(S) URLs when I save a resource, so that students are never served invalid or unsafe links.

#### Acceptance Criteria

1. WHEN an admin submits a resource form where `youtubeUrl` does not start with `http://` or `https://`, THE Admin_Resources_API SHALL return HTTP 400 with a JSON body containing a `message` field describing the validation error.
2. WHEN an admin submits a resource form where `youtubeUrl` starts with `https://` and is a syntactically valid URL, THE Admin_Resources_API SHALL accept the request and persist the resource, returning HTTP 201 for creation or HTTP 200 for update.
3. WHEN the Admin_Resources_API returns HTTP 400 for an invalid `youtubeUrl`, THE Admin_Resources_Page SHALL display an inline validation error message directly adjacent to the YouTube URL input field containing the server's `message` value.
4. WHEN the `youtubeUrl` input field value does not start with `http://` or `https://` at the time the form submit button is activated, THE Admin_Resources_Page SHALL prevent the HTTP request from being sent and SHALL display a client-side error message adjacent to the `youtubeUrl` field before any network call is made.
