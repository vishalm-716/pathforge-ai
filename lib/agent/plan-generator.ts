import { TaskType } from "@prisma/client";
import type { PrismaClient } from "@prisma/client";
import type { LearnerProfile, PlanMilestone, PlanTask } from "./types";

/**
 * Deterministic plan generator.
 * Creates a milestone-based learning plan from onboarding data.
 */

interface TrackResourceMap {
  [topic: string]: {
    title: string;
    resourceId?: string;
    estimatedMinutes: number;
    taskType: TaskType;
    description: string;
  }[];
}

const DSA_TOPICS: TrackResourceMap = {
  "Arrays Basics": [
    { title: "Watch: Introduction to Arrays", estimatedMinutes: 20, taskType: "VIDEO", description: "Learn array fundamentals, declaration, and initialization" },
    { title: "Watch: Array Operations & Traversal", estimatedMinutes: 25, taskType: "VIDEO", description: "Understanding array traversal, insertion, and deletion" },
    { title: "Practice: Array Traversal Problems", estimatedMinutes: 30, taskType: "CODING", description: "Solve basic array traversal and manipulation problems" },
    { title: "Quiz: Arrays Fundamentals", estimatedMinutes: 15, taskType: "QUIZ", description: "Test your understanding of array concepts" },
  ],
  "Searching & Sorting": [
    { title: "Watch: Linear & Binary Search", estimatedMinutes: 25, taskType: "VIDEO", description: "Master linear search and binary search algorithms" },
    { title: "Watch: Bubble Sort & Selection Sort", estimatedMinutes: 20, taskType: "VIDEO", description: "Learn basic sorting algorithms step by step" },
    { title: "Practice: Search & Sort Problems", estimatedMinutes: 35, taskType: "CODING", description: "Implement search and sorting algorithms" },
    { title: "Quiz: Searching & Sorting", estimatedMinutes: 15, taskType: "QUIZ", description: "Test your sorting and searching knowledge" },
  ],
  "Two Pointers & Sliding Window": [
    { title: "Watch: Two Pointer Technique", estimatedMinutes: 20, taskType: "VIDEO", description: "Learn the two-pointer approach for array problems" },
    { title: "Watch: Sliding Window Pattern", estimatedMinutes: 25, taskType: "VIDEO", description: "Master the sliding window technique" },
    { title: "Practice: Two Pointer Problems", estimatedMinutes: 35, taskType: "CODING", description: "Solve problems using two pointers and sliding window" },
    { title: "Revision: Arrays Complete Review", estimatedMinutes: 20, taskType: "REVISION", description: "Review all array concepts covered so far" },
  ],
  "Stacks & Queues": [
    { title: "Watch: Stack Data Structure", estimatedMinutes: 20, taskType: "VIDEO", description: "Understand stack operations and implementations" },
    { title: "Watch: Queue Data Structure", estimatedMinutes: 20, taskType: "VIDEO", description: "Learn queue operations and circular queues" },
    { title: "Practice: Stack & Queue Problems", estimatedMinutes: 30, taskType: "CODING", description: "Implement stack and queue based solutions" },
    { title: "Quiz: Stacks & Queues", estimatedMinutes: 15, taskType: "QUIZ", description: "Test your stack and queue knowledge" },
  ],
};

const PYTHON_TOPICS: TrackResourceMap = {
  "Python Basics": [
    { title: "Watch: Python Setup & First Program", estimatedMinutes: 15, taskType: "VIDEO", description: "Set up Python and write your first program" },
    { title: "Watch: Variables & Data Types", estimatedMinutes: 20, taskType: "VIDEO", description: "Learn Python data types, variables, and operators" },
    { title: "Practice: Basic Python Programs", estimatedMinutes: 25, taskType: "CODING", description: "Write simple Python programs using variables and operators" },
    { title: "Quiz: Python Fundamentals", estimatedMinutes: 15, taskType: "QUIZ", description: "Test your Python basics knowledge" },
  ],
  "Control Flow & Functions": [
    { title: "Watch: If-Else & Loops", estimatedMinutes: 25, taskType: "VIDEO", description: "Master conditional statements and loops in Python" },
    { title: "Watch: Functions & Modules", estimatedMinutes: 20, taskType: "VIDEO", description: "Learn to write reusable functions and use modules" },
    { title: "Practice: Function-Based Problems", estimatedMinutes: 30, taskType: "CODING", description: "Solve problems using functions and control flow" },
    { title: "Quiz: Control Flow & Functions", estimatedMinutes: 15, taskType: "QUIZ", description: "Test your understanding of Python control structures" },
  ],
  "Data Structures in Python": [
    { title: "Watch: Lists, Tuples & Dictionaries", estimatedMinutes: 25, taskType: "VIDEO", description: "Learn Python's built-in data structures" },
    { title: "Practice: Data Structure Problems", estimatedMinutes: 30, taskType: "CODING", description: "Work with lists, dicts, and tuples" },
    { title: "Revision: Python Complete Review", estimatedMinutes: 20, taskType: "REVISION", description: "Review all Python concepts covered" },
  ],
};

const JS_TOPICS: TrackResourceMap = {
  "JavaScript Basics": [
    { title: "Watch: JavaScript Introduction", estimatedMinutes: 20, taskType: "VIDEO", description: "Understand JavaScript basics, variables, and types" },
    { title: "Watch: Functions & Scope", estimatedMinutes: 25, taskType: "VIDEO", description: "Master functions, scope, and closures" },
    { title: "Practice: JS Fundamentals", estimatedMinutes: 30, taskType: "CODING", description: "Solve basic JavaScript problems" },
    { title: "Quiz: JavaScript Basics", estimatedMinutes: 15, taskType: "QUIZ", description: "Test your JavaScript fundamentals" },
  ],
  "DOM & Events": [
    { title: "Watch: DOM Manipulation", estimatedMinutes: 25, taskType: "VIDEO", description: "Learn to manipulate the Document Object Model" },
    { title: "Watch: Event Handling", estimatedMinutes: 20, taskType: "VIDEO", description: "Understand JavaScript events and handlers" },
    { title: "Practice: DOM Projects", estimatedMinutes: 35, taskType: "CODING", description: "Build interactive DOM-based mini projects" },
  ],
  "Async JavaScript": [
    { title: "Watch: Promises & Async/Await", estimatedMinutes: 25, taskType: "VIDEO", description: "Master asynchronous JavaScript patterns" },
    { title: "Practice: Async Problems", estimatedMinutes: 30, taskType: "CODING", description: "Work with promises and async/await" },
    { title: "Quiz: Async JavaScript", estimatedMinutes: 15, taskType: "QUIZ", description: "Test your async JS knowledge" },
    { title: "Revision: JS Complete Review", estimatedMinutes: 20, taskType: "REVISION", description: "Review all JavaScript concepts" },
  ],
};

const REACT_TOPICS: TrackResourceMap = {
  "React Fundamentals": [
    { title: "Watch: React Introduction & JSX", estimatedMinutes: 25, taskType: "VIDEO", description: "Understand React, JSX, and component basics" },
    { title: "Watch: Props & State", estimatedMinutes: 25, taskType: "VIDEO", description: "Learn component props, state, and data flow" },
    { title: "Practice: Build a Component", estimatedMinutes: 30, taskType: "CODING", description: "Create your first React components" },
    { title: "Quiz: React Basics", estimatedMinutes: 15, taskType: "QUIZ", description: "Test your React fundamentals" },
  ],
  "Hooks & Effects": [
    { title: "Watch: useState & useEffect", estimatedMinutes: 25, taskType: "VIDEO", description: "Master essential React hooks" },
    { title: "Watch: Custom Hooks", estimatedMinutes: 20, taskType: "VIDEO", description: "Learn to create reusable custom hooks" },
    { title: "Practice: Hooks-Based App", estimatedMinutes: 35, taskType: "CODING", description: "Build a mini app using React hooks" },
  ],
  "State Management": [
    { title: "Watch: Context API & useReducer", estimatedMinutes: 25, taskType: "VIDEO", description: "Learn state management with Context and useReducer" },
    { title: "Practice: State Management Project", estimatedMinutes: 35, taskType: "CODING", description: "Implement a state-managed React application" },
    { title: "Quiz: React Advanced", estimatedMinutes: 15, taskType: "QUIZ", description: "Test your React hooks and state knowledge" },
    { title: "Revision: React Complete Review", estimatedMinutes: 20, taskType: "REVISION", description: "Review all React concepts" },
  ],
};

const JAVA_TOPICS: TrackResourceMap = {
  "Java Basics": [
    { title: "Watch: Java Introduction & Setup", estimatedMinutes: 20, taskType: "VIDEO", description: "Set up Java and understand OOP basics" },
    { title: "Watch: Variables, Types & Operators", estimatedMinutes: 20, taskType: "VIDEO", description: "Learn Java data types, variables, and operators" },
    { title: "Practice: Java Basics Problems", estimatedMinutes: 25, taskType: "CODING", description: "Write simple Java programs" },
    { title: "Quiz: Java Fundamentals", estimatedMinutes: 15, taskType: "QUIZ", description: "Test your Java basics" },
  ],
  "OOP in Java": [
    { title: "Watch: Classes & Objects", estimatedMinutes: 25, taskType: "VIDEO", description: "Master classes, objects, and constructors" },
    { title: "Watch: Inheritance & Polymorphism", estimatedMinutes: 25, taskType: "VIDEO", description: "Understand inheritance and polymorphism" },
    { title: "Practice: OOP Design Problems", estimatedMinutes: 35, taskType: "CODING", description: "Design and implement OOP solutions" },
    { title: "Quiz: OOP Concepts", estimatedMinutes: 15, taskType: "QUIZ", description: "Test your OOP knowledge" },
  ],
  "Collections & Error Handling": [
    { title: "Watch: Collections Framework", estimatedMinutes: 25, taskType: "VIDEO", description: "Learn ArrayList, HashMap, and iterators" },
    { title: "Watch: Exception Handling", estimatedMinutes: 20, taskType: "VIDEO", description: "Master try-catch and custom exceptions" },
    { title: "Practice: Collections Problems", estimatedMinutes: 30, taskType: "CODING", description: "Solve problems using Java collections" },
    { title: "Revision: Java Complete Review", estimatedMinutes: 20, taskType: "REVISION", description: "Review all Java concepts" },
  ],
};

const NODEJS_TOPICS: TrackResourceMap = {
  "Node.js Fundamentals": [
    { title: "Watch: Introduction to Node.js", estimatedMinutes: 25, taskType: "VIDEO", description: "Understand Node.js architecture, the event loop, and non-blocking I/O" },
    { title: "Watch: Node.js Modules & npm", estimatedMinutes: 20, taskType: "VIDEO", description: "Learn CommonJS/ESM modules and npm package management" },
    { title: "Practice: Node.js Basics", estimatedMinutes: 30, taskType: "CODING", description: "Write Node.js scripts using core modules (fs, path, os)" },
    { title: "Quiz: Node.js Fundamentals", estimatedMinutes: 15, taskType: "QUIZ", description: "Test your understanding of Node.js basics" },
  ],
  "HTTP & Express.js": [
    { title: "Watch: Building REST APIs with Express", estimatedMinutes: 30, taskType: "VIDEO", description: "Create HTTP servers and RESTful endpoints with Express.js" },
    { title: "Watch: Middleware & Routing", estimatedMinutes: 25, taskType: "VIDEO", description: "Master Express middleware, routing patterns, and error handling" },
    { title: "Practice: Build a REST API", estimatedMinutes: 35, taskType: "CODING", description: "Build a CRUD REST API with Express.js" },
    { title: "Quiz: Express.js & HTTP", estimatedMinutes: 15, taskType: "QUIZ", description: "Test your Express.js knowledge" },
  ],
  "Async Patterns & Databases": [
    { title: "Watch: Async/Await in Node.js", estimatedMinutes: 25, taskType: "VIDEO", description: "Master async patterns, streams, and event emitters in Node.js" },
    { title: "Watch: Database Integration", estimatedMinutes: 25, taskType: "VIDEO", description: "Connect Node.js to databases using ORMs and query builders" },
    { title: "Practice: Async & DB Problems", estimatedMinutes: 30, taskType: "CODING", description: "Solve async Node.js problems and implement database operations" },
    { title: "Revision: Node.js Complete Review", estimatedMinutes: 20, taskType: "REVISION", description: "Review all Node.js concepts covered" },
  ],
};

const SQL_TOPICS: TrackResourceMap = {
  "SQL Fundamentals": [
    { title: "Watch: Introduction to SQL & Databases", estimatedMinutes: 25, taskType: "VIDEO", description: "Understand relational databases, tables, data types, and basic SQL syntax" },
    { title: "Watch: SELECT, WHERE & Filtering", estimatedMinutes: 20, taskType: "VIDEO", description: "Master SELECT queries, WHERE clauses, operators, and sorting" },
    { title: "Practice: Basic SQL Queries", estimatedMinutes: 30, taskType: "CODING", description: "Write SELECT, INSERT, UPDATE, DELETE queries" },
    { title: "Quiz: SQL Fundamentals", estimatedMinutes: 15, taskType: "QUIZ", description: "Test your understanding of basic SQL" },
  ],
  "Joins & Aggregations": [
    { title: "Watch: SQL Joins Explained", estimatedMinutes: 30, taskType: "VIDEO", description: "Master INNER JOIN, LEFT JOIN, RIGHT JOIN, FULL JOIN, and self-joins" },
    { title: "Watch: GROUP BY, HAVING & Aggregates", estimatedMinutes: 25, taskType: "VIDEO", description: "Learn COUNT, SUM, AVG, MIN, MAX with GROUP BY and HAVING" },
    { title: "Practice: Joins & Aggregation Queries", estimatedMinutes: 35, taskType: "CODING", description: "Solve multi-table join and aggregation problems" },
    { title: "Quiz: Joins & Aggregations", estimatedMinutes: 15, taskType: "QUIZ", description: "Test your knowledge of SQL joins and aggregate functions" },
  ],
  "Subqueries & Database Design": [
    { title: "Watch: Subqueries & CTEs", estimatedMinutes: 25, taskType: "VIDEO", description: "Learn subqueries, Common Table Expressions, and window functions" },
    { title: "Watch: Database Design & Normalization", estimatedMinutes: 25, taskType: "VIDEO", description: "Understand normalization, ER diagrams, indexing, and constraints" },
    { title: "Practice: Advanced SQL Problems", estimatedMinutes: 30, taskType: "CODING", description: "Write complex queries with subqueries and design database schemas" },
    { title: "Revision: SQL Complete Review", estimatedMinutes: 20, taskType: "REVISION", description: "Review all SQL concepts covered" },
  ],
};

function getTopicsForDomain(domain: string): TrackResourceMap {
  switch (domain.toLowerCase()) {
    case "dsa": return DSA_TOPICS;
    case "python": return PYTHON_TOPICS;
    case "javascript": return JS_TOPICS;
    case "react": return REACT_TOPICS;
    case "java": return JAVA_TOPICS;
    case "nodejs": return NODEJS_TOPICS;
    case "sql": return SQL_TOPICS;
    default: return DSA_TOPICS;
  }
}

export function generatePlan(profile: LearnerProfile): PlanMilestone[] {
  const topics = getTopicsForDomain(profile.domain);
  const topicKeys = Object.keys(topics);
  const weeksAvailable = profile.targetWeeks;
  const milestones: PlanMilestone[] = [];

  // Distribute topics across weeks
  const topicsPerWeek = Math.max(1, Math.ceil(topicKeys.length / weeksAvailable));

  for (let week = 1; week <= weeksAvailable; week++) {
    const weekTopics = topicKeys.slice(
      (week - 1) * topicsPerWeek,
      week * topicsPerWeek
    );

    if (weekTopics.length === 0) continue;

    const tasks: PlanTask[] = [];
    let orderIndex = 0;

    for (const topicKey of weekTopics) {
      const topicTasks = topics[topicKey];
      if (!topicTasks) continue;

      for (const task of topicTasks) {
        // Adjust task time based on learning style
        let adjustedMinutes = task.estimatedMinutes;
        if (profile.learningStyle === "video-first" && task.taskType === "VIDEO") {
          adjustedMinutes = Math.round(adjustedMinutes * 1.2);
        } else if (profile.learningStyle === "practice-first" && task.taskType === "CODING") {
          adjustedMinutes = Math.round(adjustedMinutes * 1.3);
        }

        tasks.push({
          title: task.title,
          topic: topicKey,
          taskType: task.taskType,
          estimatedMinutes: adjustedMinutes,
          description: task.description,
          orderIndex: orderIndex++,
        });
      }
    }

    milestones.push({
      title: `Week ${week}: ${weekTopics.join(" & ")}`,
      weekNumber: week,
      description: `Master ${weekTopics.join(" and ")} through curated videos, coding practice, and assessments.`,
      tasks,
    });
  }

  return milestones;
}

export function getDomainDisplayName(domain: string): string {
  const names: Record<string, string> = {
    dsa: "Data Structures & Algorithms",
    python: "Python Programming",
    javascript: "JavaScript Development",
    react: "React.js Development",
    java: "Java Programming",
    nodejs: "Node.js Backend Development",
    sql: "SQL & Database Management",
  };
  return names[domain.toLowerCase()] || domain;
}

/**
 * Looks up the best matching Resource id for a VIDEO task.
 *
 * Uses a multi-level fallback strategy:
 *   1. Exact topic match (case-insensitive) at the learner's difficulty
 *   2. Exact topic match at any difficulty
 *   3. Keyword / substring match — resource topic contains a word from the
 *      task topic or vice-versa (same track + preferred difficulty first)
 *   4. Any resource from the same track at the learner's difficulty
 *
 * `usedIds` is an optional set of resource IDs already assigned in this
 * plan-generation run so that multiple VIDEO tasks don't all resolve to the
 * same resource.
 */
async function resolveResourceId(
  prisma: PrismaClient,
  trackSlug: string,
  topicKey: string,
  difficulty: string,
  usedIds: Set<string> = new Set()
): Promise<string | null> {
  const diff = difficulty as import("@prisma/client").Difficulty;

  // ── 1. Exact topic + exact difficulty ──────────────────────
  const exactMatch = await prisma.resource.findFirst({
    where: {
      track: { slug: trackSlug },
      topic: { equals: topicKey, mode: "insensitive" },
      difficulty: diff,
      id: { notIn: [...usedIds] },
    },
    orderBy: { orderIndex: "asc" },
  });
  if (exactMatch) return exactMatch.id;

  // ── 2. Exact topic, any difficulty ─────────────────────────
  const topicAnyDiff = await prisma.resource.findFirst({
    where: {
      track: { slug: trackSlug },
      topic: { equals: topicKey, mode: "insensitive" },
      id: { notIn: [...usedIds] },
    },
    orderBy: { orderIndex: "asc" },
  });
  if (topicAnyDiff) return topicAnyDiff.id;

  // ── 3. Keyword / substring match ──────────────────────────
  // Extract meaningful keywords (≥3 chars) from the task topic
  const keywords = topicKey
    .split(/[\s&,]+/)
    .map((w) => w.trim())
    .filter((w) => w.length >= 3);

  if (keywords.length > 0) {
    // Build OR conditions: resource.topic contains any keyword
    const keywordMatch = await prisma.resource.findFirst({
      where: {
        track: { slug: trackSlug },
        difficulty: diff,
        id: { notIn: [...usedIds] },
        OR: keywords.map((kw) => ({
          topic: { contains: kw, mode: "insensitive" as const },
        })),
      },
      orderBy: { orderIndex: "asc" },
    });
    if (keywordMatch) return keywordMatch.id;

    // Same but any difficulty
    const keywordAnyDiff = await prisma.resource.findFirst({
      where: {
        track: { slug: trackSlug },
        id: { notIn: [...usedIds] },
        OR: keywords.map((kw) => ({
          topic: { contains: kw, mode: "insensitive" as const },
        })),
      },
      orderBy: { orderIndex: "asc" },
    });
    if (keywordAnyDiff) return keywordAnyDiff.id;
  }

  // ── 4. Any resource from the same track + difficulty ───────
  const anyTrack = await prisma.resource.findFirst({
    where: {
      track: { slug: trackSlug },
      difficulty: diff,
      id: { notIn: [...usedIds] },
    },
    orderBy: { orderIndex: "asc" },
  });
  if (anyTrack) return anyTrack.id;

  // Last resort: any resource from the track, even if already used
  const lastResort = await prisma.resource.findFirst({
    where: { track: { slug: trackSlug } },
    orderBy: { orderIndex: "asc" },
  });
  return lastResort?.id ?? null;
}

/**
 * Async variant of generatePlan that enriches every VIDEO task with
 * the matching resourceId from the database.
 * The synchronous `generatePlan` is left untouched.
 */
export async function generatePlanWithResources(
  profile: LearnerProfile,
  prisma: PrismaClient
): Promise<PlanMilestone[]> {
  const milestones = generatePlan(profile);
  const trackSlug = profile.domain.toLowerCase();
  const usedResourceIds = new Set<string>();

  for (const milestone of milestones) {
    for (const task of milestone.tasks) {
      if (task.taskType === "VIDEO") {
        const resourceId = await resolveResourceId(
          prisma,
          trackSlug,
          task.topic,
          profile.currentLevel,
          usedResourceIds
        );
        task.resourceId = resourceId;
        if (resourceId) {
          usedResourceIds.add(resourceId);
          // Fetch actual resource to use its real duration
          const actualRes = await prisma.resource.findUnique({
            where: { id: resourceId }
          });
          if (actualRes && actualRes.estimatedMinutes) {
            task.estimatedMinutes = actualRes.estimatedMinutes;
          }
        }
      }
    }
  }

  return milestones;
}
