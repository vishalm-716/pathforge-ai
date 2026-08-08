import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding PathForge AI database...\n");

  // ─── 1. Admin User ──────────────────────────────────
  const hashedPassword = await bcrypt.hash("Vishalm_16", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@pathforge.ai" },
    update: {},
    create: {
      email: "admin@pathforge.ai",
      name: "PathForge Admin",
      password: hashedPassword,
      role: "ADMIN",
    },
  });
  console.log("✅ Admin user created:", admin.email);

  // ─── 2. Demo Student ────────────────────────────────
  const demoStudent = await prisma.user.upsert({
    where: { email: "demo.student@pathforge.ai" },
    update: {},
    create: {
      email: "demo.student@pathforge.ai",
      name: "Arjun Kumar",
      role: "STUDENT",
      image: null,
    },
  });
  console.log("✅ Demo student created:", demoStudent.email);

  // ─── 3. Tracks ──────────────────────────────────────
  const dsaTrack = await prisma.track.upsert({
    where: { slug: "dsa" },
    update: {},
    create: {
      title: "Data Structures & Algorithms",
      slug: "dsa",
      description: "Master fundamental data structures and algorithms with curated video resources and hands-on coding challenges. Build a strong foundation for technical interviews.",
      difficulty: "BEGINNER",
      estimatedHours: 40,
    },
  });

  const pythonTrack = await prisma.track.upsert({
    where: { slug: "python" },
    update: {},
    create: {
      title: "Python Programming",
      slug: "python",
      description: "Learn Python from scratch with practical projects. Cover basics, data structures, functions, and OOP.",
      difficulty: "BEGINNER",
      estimatedHours: 30,
    },
  });

  const jsTrack = await prisma.track.upsert({
    where: { slug: "javascript" },
    update: {},
    create: {
      title: "JavaScript Development",
      slug: "javascript",
      description: "Master JavaScript fundamentals, DOM manipulation, async programming, and modern ES6+ features.",
      difficulty: "BEGINNER",
      estimatedHours: 35,
    },
  });

  const reactTrack = await prisma.track.upsert({
    where: { slug: "react" },
    update: {},
    create: {
      title: "React.js Development",
      slug: "react",
      description: "Build modern web apps with React. Learn components, hooks, state management, and routing.",
      difficulty: "INTERMEDIATE",
      estimatedHours: 35,
    },
  });

  const javaTrack = await prisma.track.upsert({
    where: { slug: "java" },
    update: {},
    create: {
      title: "Java Programming",
      slug: "java",
      description: "Learn Java programming with OOP, collections, exception handling, and multithreading.",
      difficulty: "BEGINNER",
      estimatedHours: 40,
    },
  });

  console.log("✅ Tracks created: DSA, Python, JavaScript, React, Java");

  // ─── 4. YouTube Resources (DSA) — upsert keyed on youtubeUrl ──
  const resources = await Promise.all([
    prisma.resource.upsert({
      where: { youtubeUrl: "https://www.youtube.com/watch?v=NTHVTY6w2Co" },
      update: {},
      create: {
        trackId: dsaTrack.id,
        topic: "Arrays Basics",
        title: "Introduction to Arrays - Complete Tutorial",
        youtubeUrl: "https://www.youtube.com/watch?v=NTHVTY6w2Co",
        orderIndex: 1,
        estimatedMinutes: 20,
        difficulty: "BEGINNER",
        description: "Learn array fundamentals: declaration, initialization, indexing, and basic operations.",
      },
    }),
    prisma.resource.upsert({
      where: { youtubeUrl: "https://www.youtube.com/watch?v=n60Dn0UsbEk" },
      update: {},
      create: {
        trackId: dsaTrack.id,
        topic: "Arrays Basics",
        title: "Array Operations & Traversal Techniques",
        youtubeUrl: "https://www.youtube.com/watch?v=n60Dn0UsbEk",
        orderIndex: 2,
        estimatedMinutes: 25,
        difficulty: "BEGINNER",
        description: "Master array traversal, insertion, deletion, and common array patterns.",
      },
    }),
    prisma.resource.upsert({
      where: { youtubeUrl: "https://www.youtube.com/watch?v=P3YID7liBug" },
      update: {},
      create: {
        trackId: dsaTrack.id,
        topic: "Searching & Sorting",
        title: "Binary Search Algorithm - Step by Step",
        youtubeUrl: "https://www.youtube.com/watch?v=P3YID7liBug",
        orderIndex: 3,
        estimatedMinutes: 22,
        difficulty: "BEGINNER",
        description: "Understand binary search algorithm with visual explanations and code walkthrough.",
      },
    }),
    prisma.resource.upsert({
      where: { youtubeUrl: "https://www.youtube.com/watch?v=pkkFqlG0Hds" },
      update: {},
      create: {
        trackId: dsaTrack.id,
        topic: "Searching & Sorting",
        title: "Sorting Algorithms Explained",
        youtubeUrl: "https://www.youtube.com/watch?v=pkkFqlG0Hds",
        orderIndex: 4,
        estimatedMinutes: 30,
        difficulty: "BEGINNER",
        description: "Learn bubble sort, selection sort, and insertion sort with animations.",
      },
    }),
    prisma.resource.upsert({
      where: { youtubeUrl: "https://www.youtube.com/watch?v=On03HWe2tZM" },
      update: {},
      create: {
        trackId: dsaTrack.id,
        topic: "Two Pointers & Sliding Window",
        title: "Two Pointer Technique for Beginners",
        youtubeUrl: "https://www.youtube.com/watch?v=On03HWe2tZM",
        orderIndex: 5,
        estimatedMinutes: 20,
        difficulty: "BEGINNER",
        description: "Master the two-pointer technique for efficient array problem solving.",
      },
    }),
    prisma.resource.upsert({
      where: { youtubeUrl: "https://www.youtube.com/watch?v=MK-NZ4hN7rs" },
      update: {},
      create: {
        trackId: dsaTrack.id,
        topic: "Two Pointers & Sliding Window",
        title: "Sliding Window Pattern Masterclass",
        youtubeUrl: "https://www.youtube.com/watch?v=MK-NZ4hN7rs",
        orderIndex: 6,
        estimatedMinutes: 25,
        difficulty: "BEGINNER",
        description: "Learn the sliding window technique with multiple examples and problems.",
      },
    }),
    // index 6 — Stacks & Queues BEGINNER
    prisma.resource.upsert({
      where: { youtubeUrl: "https://www.youtube.com/watch?v=I37kGX-nZEI" },
      update: {},
      create: {
        trackId: dsaTrack.id,
        topic: "Stacks & Queues",
        title: "Stack Data Structure - Full Tutorial for Beginners",
        youtubeUrl: "https://www.youtube.com/watch?v=I37kGX-nZEI",
        orderIndex: 7,
        estimatedMinutes: 20,
        difficulty: "BEGINNER",
        description: "Learn stack operations (push, pop, peek), LIFO principle, and practical use cases with animations.",
      },
    }),
    // index 7 — Stacks & Queues BEGINNER (Queue)
    prisma.resource.upsert({
      where: { youtubeUrl: "https://www.youtube.com/watch?v=okr-XE8yTO8" },
      update: {},
      create: {
        trackId: dsaTrack.id,
        topic: "Stacks & Queues",
        title: "Queue Data Structure - Full Tutorial for Beginners",
        youtubeUrl: "https://www.youtube.com/watch?v=okr-XE8yTO8",
        orderIndex: 8,
        estimatedMinutes: 20,
        difficulty: "BEGINNER",
        description: "Master queue operations (enqueue, dequeue), FIFO principle, circular queues, and priority queues.",
      },
    }),
  ]);

  console.log("✅ 8 YouTube resources upserted for DSA track");

  // ─── 4b. YouTube Resources (Python) — upsert keyed on youtubeUrl ──
  await Promise.all([
    prisma.resource.upsert({
      where: { youtubeUrl: "https://www.youtube.com/watch?v=_uQrJ0TkZlc" },
      update: {},
      create: {
        trackId: pythonTrack.id,
        topic: "Python Basics",
        title: "Python Tutorial for Beginners - Full Course",
        youtubeUrl: "https://www.youtube.com/watch?v=_uQrJ0TkZlc",
        orderIndex: 1,
        estimatedMinutes: 60,
        difficulty: "BEGINNER",
        description: "Complete Python beginner tutorial covering variables, data types, control flow, and functions.",
      },
    }),
    prisma.resource.upsert({
      where: { youtubeUrl: "https://www.youtube.com/watch?v=8DvywoWv6fI" },
      update: {},
      create: {
        trackId: pythonTrack.id,
        topic: "Python Basics",
        title: "Python for Everybody - Introduction",
        youtubeUrl: "https://www.youtube.com/watch?v=8DvywoWv6fI",
        orderIndex: 2,
        estimatedMinutes: 45,
        difficulty: "BEGINNER",
        description: "Introduction to Python programming covering installation, basic syntax, and first programs.",
      },
    }),
    prisma.resource.upsert({
      where: { youtubeUrl: "https://www.youtube.com/watch?v=9Os0o3wzS_I" },
      update: {},
      create: {
        trackId: pythonTrack.id,
        topic: "Control Flow & Functions",
        title: "Python Functions and Loops Tutorial",
        youtubeUrl: "https://www.youtube.com/watch?v=9Os0o3wzS_I",
        orderIndex: 3,
        estimatedMinutes: 40,
        difficulty: "BEGINNER",
        description: "Learn Python functions, loops, and control flow with hands-on examples.",
      },
    }),
    prisma.resource.upsert({
      where: { youtubeUrl: "https://www.youtube.com/watch?v=6iF8Xb7Z3wQ" },
      update: {},
      create: {
        trackId: pythonTrack.id,
        topic: "Control Flow & Functions",
        title: "Python If Statements and Loops - Beginner Guide",
        youtubeUrl: "https://www.youtube.com/watch?v=6iF8Xb7Z3wQ",
        orderIndex: 4,
        estimatedMinutes: 30,
        difficulty: "BEGINNER",
        description: "Master Python conditionals and iteration patterns for beginners.",
      },
    }),
    prisma.resource.upsert({
      where: { youtubeUrl: "https://www.youtube.com/watch?v=W8KRzm-HUcc" },
      update: {},
      create: {
        trackId: pythonTrack.id,
        topic: "Data Structures in Python",
        title: "Python Data Structures - Lists, Tuples, Sets, Dicts",
        youtubeUrl: "https://www.youtube.com/watch?v=W8KRzm-HUcc",
        orderIndex: 5,
        estimatedMinutes: 50,
        difficulty: "INTERMEDIATE",
        description: "Deep dive into Python built-in data structures with practical examples.",
      },
    }),
    prisma.resource.upsert({
      where: { youtubeUrl: "https://www.youtube.com/watch?v=3dt4OGnU5sM" },
      update: {},
      create: {
        trackId: pythonTrack.id,
        topic: "Data Structures in Python",
        title: "Python List Comprehensions and Generators",
        youtubeUrl: "https://www.youtube.com/watch?v=3dt4OGnU5sM",
        orderIndex: 6,
        estimatedMinutes: 35,
        difficulty: "INTERMEDIATE",
        description: "Learn advanced Python list comprehensions, generator expressions, and their performance benefits.",
      },
    }),
    prisma.resource.upsert({
      where: { youtubeUrl: "https://www.youtube.com/watch?v=Ej_02ICOIgs" },
      update: {},
      create: {
        trackId: pythonTrack.id,
        topic: "OOP in Python",
        title: "Object-Oriented Programming in Python - Full Course",
        youtubeUrl: "https://www.youtube.com/watch?v=Ej_02ICOIgs",
        orderIndex: 7,
        estimatedMinutes: 55,
        difficulty: "INTERMEDIATE",
        description: "Comprehensive guide to OOP concepts in Python: classes, inheritance, encapsulation, and polymorphism.",
      },
    }),
    prisma.resource.upsert({
      where: { youtubeUrl: "https://www.youtube.com/watch?v=apACNr7DC_s" },
      update: {},
      create: {
        trackId: pythonTrack.id,
        topic: "OOP in Python",
        title: "Python Classes and Objects - Intermediate Tutorial",
        youtubeUrl: "https://www.youtube.com/watch?v=apACNr7DC_s",
        orderIndex: 8,
        estimatedMinutes: 40,
        difficulty: "INTERMEDIATE",
        description: "Advanced class features in Python including decorators, class methods, static methods, and properties.",
      },
    }),
  ]);

  console.log("✅ 8 YouTube resources upserted for Python track");

  // ─── 4c. YouTube Resources (JavaScript) — upsert keyed on youtubeUrl ──
  await Promise.all([
    // BEGINNER #1 — JS Fundamentals (Traversy Media full crash course)
    prisma.resource.upsert({
      where: { youtubeUrl: "https://www.youtube.com/watch?v=hdI2bqOjy3c" },
      update: {},
      create: {
        trackId: jsTrack.id,
        topic: "JavaScript Fundamentals",
        title: "JavaScript Crash Course For Beginners",
        youtubeUrl: "https://www.youtube.com/watch?v=hdI2bqOjy3c",
        orderIndex: 1,
        estimatedMinutes: 90,
        difficulty: "BEGINNER",
        description: "Full JavaScript crash course for beginners by Traversy Media covering variables, data types, functions, loops, and DOM basics.",
      },
    }),
    // BEGINNER #2 — Variables & Data Types (The Net Ninja)
    prisma.resource.upsert({
      where: { youtubeUrl: "https://www.youtube.com/watch?v=qjjF3_jMYlA" },
      update: {},
      create: {
        trackId: jsTrack.id,
        topic: "Variables & Data Types",
        title: "JavaScript Variables & Data Types - The Net Ninja",
        youtubeUrl: "https://www.youtube.com/watch?v=qjjF3_jMYlA",
        orderIndex: 2,
        estimatedMinutes: 20,
        difficulty: "BEGINNER",
        description: "Learn about var, let, const and JavaScript primitive data types (strings, numbers, booleans, null, undefined) with clear examples.",
      },
    }),
    // BEGINNER #3 — DOM Manipulation (Traversy Media)
    prisma.resource.upsert({
      where: { youtubeUrl: "https://www.youtube.com/watch?v=0ik6X4DJKCc" },
      update: {},
      create: {
        trackId: jsTrack.id,
        topic: "DOM Manipulation",
        title: "JavaScript DOM Manipulation – Full Tutorial for Beginners",
        youtubeUrl: "https://www.youtube.com/watch?v=0ik6X4DJKCc",
        orderIndex: 3,
        estimatedMinutes: 60,
        difficulty: "BEGINNER",
        description: "Comprehensive tutorial on selecting elements, changing content and styles, handling events, and creating/removing DOM nodes.",
      },
    }),
    // BEGINNER #4 — Functions (Academind)
    prisma.resource.upsert({
      where: { youtubeUrl: "https://www.youtube.com/watch?v=N8ap4k_1QEQ" },
      update: {},
      create: {
        trackId: jsTrack.id,
        topic: "Functions",
        title: "JavaScript Functions – Beginner to Advanced",
        youtubeUrl: "https://www.youtube.com/watch?v=N8ap4k_1QEQ",
        orderIndex: 4,
        estimatedMinutes: 35,
        difficulty: "BEGINNER",
        description: "Learn function declarations, expressions, arrow functions, default parameters, and closures with practical JavaScript examples.",
      },
    }),
    // INTERMEDIATE #1 — ES6+ Features (freeCodeCamp)
    prisma.resource.upsert({
      where: { youtubeUrl: "https://www.youtube.com/watch?v=nZ1DMMsyVyI" },
      update: {},
      create: {
        trackId: jsTrack.id,
        topic: "ES6+ Features",
        title: "ES6 JavaScript Tutorial – Modern JS for Everyone",
        youtubeUrl: "https://www.youtube.com/watch?v=nZ1DMMsyVyI",
        orderIndex: 5,
        estimatedMinutes: 50,
        difficulty: "INTERMEDIATE",
        description: "Master ES6+ features including destructuring, spread/rest operators, template literals, modules, and optional chaining.",
      },
    }),
    // INTERMEDIATE #2 — Async/Await & Promises (Traversy Media)
    prisma.resource.upsert({
      where: { youtubeUrl: "https://www.youtube.com/watch?v=PoRJizFvM7s" },
      update: {},
      create: {
        trackId: jsTrack.id,
        topic: "Async JavaScript",
        title: "Async JS Crash Course – Callbacks, Promises, Async Await",
        youtubeUrl: "https://www.youtube.com/watch?v=PoRJizFvM7s",
        orderIndex: 6,
        estimatedMinutes: 40,
        difficulty: "INTERMEDIATE",
        description: "Understand asynchronous JavaScript: the event loop, callbacks, Promises, and async/await syntax with real-world fetch API examples.",
      },
    }),
    // INTERMEDIATE #3 — Arrays & Objects (The Net Ninja)
    prisma.resource.upsert({
      where: { youtubeUrl: "https://www.youtube.com/watch?v=oigfaZ5ApsM" },
      update: {},
      create: {
        trackId: jsTrack.id,
        topic: "Arrays & Objects",
        title: "JavaScript Array Methods – map, filter, reduce & more",
        youtubeUrl: "https://www.youtube.com/watch?v=oigfaZ5ApsM",
        orderIndex: 7,
        estimatedMinutes: 45,
        difficulty: "INTERMEDIATE",
        description: "Deep dive into higher-order array methods (map, filter, reduce, find, some, every) and advanced object manipulation techniques.",
      },
    }),
    // INTERMEDIATE #4 — Closures & Scope (Academind)
    prisma.resource.upsert({
      where: { youtubeUrl: "https://www.youtube.com/watch?v=3a0I8ICR1Vg" },
      update: {},
      create: {
        trackId: jsTrack.id,
        topic: "Closures & Scope",
        title: "JavaScript Closures & Scope Explained",
        youtubeUrl: "https://www.youtube.com/watch?v=3a0I8ICR1Vg",
        orderIndex: 8,
        estimatedMinutes: 30,
        difficulty: "INTERMEDIATE",
        description: "Thorough explanation of lexical scope, closure behaviour, the module pattern, and common closure-based pitfalls in JavaScript.",
      },
    }),
  ]);

  console.log("✅ 8 YouTube resources upserted for JavaScript track");

  // ─── 4d. YouTube Resources (React) — upsert keyed on youtubeUrl ──
  await Promise.all([
    // BEGINNER #1 — React Crash Course (Traversy Media)
    prisma.resource.upsert({
      where: { youtubeUrl: "https://www.youtube.com/watch?v=w7ejDZ8SWv8" },
      update: {},
      create: {
        trackId: reactTrack.id,
        topic: "React Fundamentals",
        title: "React JS Crash Course",
        youtubeUrl: "https://www.youtube.com/watch?v=w7ejDZ8SWv8",
        orderIndex: 1,
        estimatedMinutes: 90,
        difficulty: "BEGINNER",
        description: "Full React crash course for beginners by Traversy Media covering JSX, components, props, state, and event handling.",
      },
    }),
    // BEGINNER #2 — Components & Props (The Net Ninja)
    prisma.resource.upsert({
      where: { youtubeUrl: "https://www.youtube.com/watch?v=9D1x7-2FmTA" },
      update: {},
      create: {
        trackId: reactTrack.id,
        topic: "Components & Props",
        title: "React Components & Props – The Net Ninja",
        youtubeUrl: "https://www.youtube.com/watch?v=9D1x7-2FmTA",
        orderIndex: 2,
        estimatedMinutes: 25,
        difficulty: "BEGINNER",
        description: "Learn how to create functional components, pass data via props, and compose UIs with reusable React components.",
      },
    }),
    // BEGINNER #3 — State & useState Hook (Codevolution)
    prisma.resource.upsert({
      where: { youtubeUrl: "https://www.youtube.com/watch?v=O6P86uwfdR0" },
      update: {},
      create: {
        trackId: reactTrack.id,
        topic: "State & useState",
        title: "React useState Hook Tutorial",
        youtubeUrl: "https://www.youtube.com/watch?v=O6P86uwfdR0",
        orderIndex: 3,
        estimatedMinutes: 22,
        difficulty: "BEGINNER",
        description: "Understand React state management using the useState hook with practical counter, toggle, and form examples.",
      },
    }),
    // BEGINNER #4 — Event Handling & Forms (freeCodeCamp)
    prisma.resource.upsert({
      where: { youtubeUrl: "https://www.youtube.com/watch?v=jORThkew-74" },
      update: {},
      create: {
        trackId: reactTrack.id,
        topic: "Event Handling & Forms",
        title: "React Event Handling and Forms for Beginners",
        youtubeUrl: "https://www.youtube.com/watch?v=jORThkew-74",
        orderIndex: 4,
        estimatedMinutes: 30,
        difficulty: "BEGINNER",
        description: "Learn how to handle user events (click, change, submit) and build controlled form components in React.",
      },
    }),
    // INTERMEDIATE #1 — useEffect & Lifecycle (Codevolution)
    prisma.resource.upsert({
      where: { youtubeUrl: "https://www.youtube.com/watch?v=0ZJgIjIuY7U" },
      update: {},
      create: {
        trackId: reactTrack.id,
        topic: "useEffect & Lifecycle",
        title: "React useEffect Hook Tutorial",
        youtubeUrl: "https://www.youtube.com/watch?v=0ZJgIjIuY7U",
        orderIndex: 5,
        estimatedMinutes: 35,
        difficulty: "INTERMEDIATE",
        description: "Master the useEffect hook: dependency arrays, cleanup functions, data fetching patterns, and avoiding infinite loops.",
      },
    }),
    // INTERMEDIATE #2 — React Router (The Net Ninja)
    prisma.resource.upsert({
      where: { youtubeUrl: "https://www.youtube.com/watch?v=aZGzwEjZrXc" },
      update: {},
      create: {
        trackId: reactTrack.id,
        topic: "React Router",
        title: "React Router v6 – Full Tutorial",
        youtubeUrl: "https://www.youtube.com/watch?v=aZGzwEjZrXc",
        orderIndex: 6,
        estimatedMinutes: 45,
        difficulty: "INTERMEDIATE",
        description: "Complete guide to React Router v6: BrowserRouter, Routes, Link, useNavigate, useParams, and nested routes.",
      },
    }),
    // INTERMEDIATE #3 — Context API & useContext (Traversy Media)
    prisma.resource.upsert({
      where: { youtubeUrl: "https://www.youtube.com/watch?v=5LrDIWkK_Bc" },
      update: {},
      create: {
        trackId: reactTrack.id,
        topic: "Context API",
        title: "React Context API & useContext Hook",
        youtubeUrl: "https://www.youtube.com/watch?v=5LrDIWkK_Bc",
        orderIndex: 7,
        estimatedMinutes: 40,
        difficulty: "INTERMEDIATE",
        description: "Learn global state management with React Context API and useContext hook to avoid prop drilling in component trees.",
      },
    }),
    // INTERMEDIATE #4 — Custom Hooks (Academind)
    prisma.resource.upsert({
      where: { youtubeUrl: "https://www.youtube.com/watch?v=6ThXsUwLWvc" },
      update: {},
      create: {
        trackId: reactTrack.id,
        topic: "Custom Hooks",
        title: "React Custom Hooks – Build Reusable Logic",
        youtubeUrl: "https://www.youtube.com/watch?v=6ThXsUwLWvc",
        orderIndex: 8,
        estimatedMinutes: 30,
        difficulty: "INTERMEDIATE",
        description: "Learn how to extract and share stateful logic by building custom React hooks with real-world useFetch and useLocalStorage examples.",
      },
    }),
  ]);

  console.log("✅ 8 YouTube resources upserted for React track");

  // ─── 4e. YouTube Resources (Java) — upsert keyed on youtubeUrl ──
  await Promise.all([
    // BEGINNER #1 — Java Full Course for Beginners (Telusko)
    prisma.resource.upsert({
      where: { youtubeUrl: "https://www.youtube.com/watch?v=BGTx91t8q50" },
      update: {},
      create: {
        trackId: javaTrack.id,
        topic: "Java Basics",
        title: "Java Tutorial for Beginners - Full Course",
        youtubeUrl: "https://www.youtube.com/watch?v=BGTx91t8q50",
        orderIndex: 1,
        estimatedMinutes: 90,
        difficulty: "BEGINNER",
        description: "Complete Java beginner course covering JDK setup, syntax, data types, variables, operators, control flow, and methods.",
      },
    }),
    // BEGINNER #2 — Java Basics: Variables & Data Types (Bro Code)
    prisma.resource.upsert({
      where: { youtubeUrl: "https://www.youtube.com/watch?v=drQK8ciCAjY" },
      update: {},
      create: {
        trackId: javaTrack.id,
        topic: "Java Basics",
        title: "Java Variables and Data Types Explained",
        youtubeUrl: "https://www.youtube.com/watch?v=drQK8ciCAjY",
        orderIndex: 2,
        estimatedMinutes: 20,
        difficulty: "BEGINNER",
        description: "Learn Java primitive data types (int, double, boolean, char), reference types, type casting, and variable scoping rules.",
      },
    }),
    // BEGINNER #3 — Control Flow in Java (Coding with John)
    prisma.resource.upsert({
      where: { youtubeUrl: "https://www.youtube.com/watch?v=9WmRFoSdqKE" },
      update: {},
      create: {
        trackId: javaTrack.id,
        topic: "Control Flow & Methods",
        title: "Java If Statements, Loops and Methods for Beginners",
        youtubeUrl: "https://www.youtube.com/watch?v=9WmRFoSdqKE",
        orderIndex: 3,
        estimatedMinutes: 30,
        difficulty: "BEGINNER",
        description: "Master Java control flow: if/else, switch statements, for/while/do-while loops, and method declarations with return types.",
      },
    }),
    // BEGINNER #4 — Java Arrays (Bro Code)
    prisma.resource.upsert({
      where: { youtubeUrl: "https://www.youtube.com/watch?v=ei_4Nt7XWOw" },
      update: {},
      create: {
        trackId: javaTrack.id,
        topic: "Arrays in Java",
        title: "Java Arrays - Full Tutorial for Beginners",
        youtubeUrl: "https://www.youtube.com/watch?v=ei_4Nt7XWOw",
        orderIndex: 4,
        estimatedMinutes: 25,
        difficulty: "BEGINNER",
        description: "Learn Java arrays: declaration, initialisation, multi-dimensional arrays, enhanced for-loop, and common array algorithms.",
      },
    }),
    // INTERMEDIATE #1 — OOP in Java (Telusko full playlist)
    prisma.resource.upsert({
      where: { youtubeUrl: "https://www.youtube.com/watch?v=7GwptabrYyk" },
      update: {},
      create: {
        trackId: javaTrack.id,
        topic: "OOP in Java",
        title: "Object-Oriented Programming in Java - Full Course",
        youtubeUrl: "https://www.youtube.com/watch?v=7GwptabrYyk",
        orderIndex: 5,
        estimatedMinutes: 60,
        difficulty: "INTERMEDIATE",
        description: "Deep dive into Java OOP: classes, objects, constructors, inheritance, method overriding, abstract classes, and interfaces.",
      },
    }),
    // INTERMEDIATE #2 — Java Collections Framework (Amigoscode)
    prisma.resource.upsert({
      where: { youtubeUrl: "https://www.youtube.com/watch?v=GdAon80-0KA" },
      update: {},
      create: {
        trackId: javaTrack.id,
        topic: "Collections Framework",
        title: "Java Collections Framework - ArrayList, HashMap, and More",
        youtubeUrl: "https://www.youtube.com/watch?v=GdAon80-0KA",
        orderIndex: 6,
        estimatedMinutes: 50,
        difficulty: "INTERMEDIATE",
        description: "Explore the Java Collections Framework: List, Set, Map, Queue interfaces with ArrayList, LinkedList, HashSet, HashMap implementations and their trade-offs.",
      },
    }),
    // INTERMEDIATE #3 — Java Exception Handling (Coding with John)
    prisma.resource.upsert({
      where: { youtubeUrl: "https://www.youtube.com/watch?v=1XAfapkBQjk" },
      update: {},
      create: {
        trackId: javaTrack.id,
        topic: "Exception Handling",
        title: "Java Exception Handling - Try, Catch, Finally, Throw",
        youtubeUrl: "https://www.youtube.com/watch?v=1XAfapkBQjk",
        orderIndex: 7,
        estimatedMinutes: 25,
        difficulty: "INTERMEDIATE",
        description: "Understand Java exception handling: checked vs unchecked exceptions, try-catch-finally blocks, custom exceptions, and best practices.",
      },
    }),
    // INTERMEDIATE #4 — Java Generics & Lambdas (Amigoscode)
    prisma.resource.upsert({
      where: { youtubeUrl: "https://www.youtube.com/watch?v=K1iu1kXkVoA" },
      update: {},
      create: {
        trackId: javaTrack.id,
        topic: "Generics & Lambdas",
        title: "Java Generics and Lambda Expressions Tutorial",
        youtubeUrl: "https://www.youtube.com/watch?v=K1iu1kXkVoA",
        orderIndex: 8,
        estimatedMinutes: 45,
        difficulty: "INTERMEDIATE",
        description: "Learn Java generics for type-safe collections, bounded type parameters, wildcards, and lambda expressions with functional interfaces.",
      },
    }),
  ]);

  console.log("✅ 8 YouTube resources upserted for Java track");

  // ═══════════════════════════════════════════════════════
  // ─── 5. COMPLETE QUESTION BANK ────────────────────────
  // ═══════════════════════════════════════════════════════

  // ─── DSA: Beginner MCQs (5) — upsert keyed on questionText ──
  const dsaBeginnerMcqs = await Promise.all([
    prisma.question.upsert({
      where: { questionText: "What is the time complexity of accessing an element in an array by index?" },
      update: {},
      create: {
        trackId: dsaTrack.id, topic: "Arrays Basics", questionType: "MCQ",
        questionText: "What is the time complexity of accessing an element in an array by index?",
        options: JSON.stringify(["O(n)", "O(1)", "O(log n)", "O(n²)"]),
        correctOption: 1,
        explanation: "Array access by index is O(1) because arrays use contiguous memory allocation, allowing direct access through base address + offset calculation.",
        difficulty: "BEGINNER",
      },
    }),
    prisma.question.upsert({
      where: { questionText: "Which operation has the worst time complexity in an unsorted array?" },
      update: {},
      create: {
        trackId: dsaTrack.id, topic: "Arrays Basics", questionType: "MCQ",
        questionText: "Which operation has the worst time complexity in an unsorted array?",
        options: JSON.stringify(["Access by index", "Search by value", "Append at end", "Read length"]),
        correctOption: 1,
        explanation: "Searching by value in an unsorted array requires linear scan O(n) in the worst case, as the element could be anywhere.",
        difficulty: "BEGINNER",
      },
    }),
    prisma.question.upsert({
      where: { questionText: "What happens when you try to access an array index that is out of bounds in JavaScript?" },
      update: {},
      create: {
        trackId: dsaTrack.id, topic: "Arrays Basics", questionType: "MCQ",
        questionText: "What happens when you try to access an array index that is out of bounds in JavaScript?",
        options: JSON.stringify(["Error is thrown", "Returns undefined", "Returns null", "Returns 0"]),
        correctOption: 1,
        explanation: "In JavaScript, accessing an out-of-bounds index returns undefined rather than throwing an error.",
        difficulty: "BEGINNER",
      },
    }),
    prisma.question.upsert({
      where: { questionText: "What is the space complexity of creating a copy of an array of size n?" },
      update: {},
      create: {
        trackId: dsaTrack.id, topic: "Arrays Basics", questionType: "MCQ",
        questionText: "What is the space complexity of creating a copy of an array of size n?",
        options: JSON.stringify(["O(1)", "O(log n)", "O(n)", "O(n²)"]),
        correctOption: 2,
        explanation: "Creating a copy of an array requires O(n) additional space because you need to store n elements in the new array.",
        difficulty: "BEGINNER",
      },
    }),
    prisma.question.upsert({
      where: { questionText: "To find the maximum element in an unsorted array of n elements, what is the minimum number of comparisons needed?" },
      update: {},
      create: {
        trackId: dsaTrack.id, topic: "Arrays Basics", questionType: "MCQ",
        questionText: "To find the maximum element in an unsorted array of n elements, what is the minimum number of comparisons needed?",
        options: JSON.stringify(["n", "n - 1", "log n", "n / 2"]),
        correctOption: 1,
        explanation: "You need at least n-1 comparisons because each comparison eliminates one candidate.",
        difficulty: "BEGINNER",
      },
    }),
  ]);

  // ─── DSA: Intermediate MCQs (5) ──────────────────────
  await Promise.all([
    prisma.question.upsert({
      where: { questionText: "What is the average time complexity of quicksort?" },
      update: {},
      create: {
        trackId: dsaTrack.id, topic: "Searching & Sorting", questionType: "MCQ",
        questionText: "What is the average time complexity of quicksort?",
        options: JSON.stringify(["O(n)", "O(n log n)", "O(n²)", "O(log n)"]),
        correctOption: 1,
        explanation: "Quicksort has an average time complexity of O(n log n) due to its divide-and-conquer approach with balanced partitions.",
        difficulty: "INTERMEDIATE",
      },
    }),
    prisma.question.upsert({
      where: { questionText: "Which technique is most efficient for finding a pair with a given sum in a sorted array?" },
      update: {},
      create: {
        trackId: dsaTrack.id, topic: "Two Pointers & Sliding Window", questionType: "MCQ",
        questionText: "Which technique is most efficient for finding a pair with a given sum in a sorted array?",
        options: JSON.stringify(["Nested loops", "Two pointers from both ends", "Binary search for each element", "Hashing"]),
        correctOption: 1,
        explanation: "Two pointers from both ends of a sorted array gives O(n) time complexity, more efficient than nested loops O(n²).",
        difficulty: "INTERMEDIATE",
      },
    }),
    prisma.question.upsert({
      where: { questionText: "Which data structure is used for implementing recursion internally by the system?" },
      update: {},
      create: {
        trackId: dsaTrack.id, topic: "Stacks & Queues", questionType: "MCQ",
        questionText: "Which data structure is used for implementing recursion internally by the system?",
        options: JSON.stringify(["Queue", "Stack", "Array", "Linked List"]),
        correctOption: 1,
        explanation: "The system uses a call stack to manage function calls during recursion, following LIFO (Last In, First Out) order.",
        difficulty: "INTERMEDIATE",
      },
    }),
    prisma.question.upsert({
      where: { questionText: "What is the sliding window technique best suited for?" },
      update: {},
      create: {
        trackId: dsaTrack.id, topic: "Two Pointers & Sliding Window", questionType: "MCQ",
        questionText: "What is the sliding window technique best suited for?",
        options: JSON.stringify(["Finding shortest path in a graph", "Finding subarrays/substrings with certain properties", "Sorting elements", "Tree traversal"]),
        correctOption: 1,
        explanation: "The sliding window technique efficiently finds subarrays or substrings that satisfy certain conditions by maintaining a window that expands/shrinks.",
        difficulty: "INTERMEDIATE",
      },
    }),
    prisma.question.upsert({
      where: { questionText: "What is the time complexity of push and pop operations in a stack implemented using a linked list?" },
      update: {},
      create: {
        trackId: dsaTrack.id, topic: "Stacks & Queues", questionType: "MCQ",
        questionText: "What is the time complexity of push and pop operations in a stack implemented using a linked list?",
        options: JSON.stringify(["O(n) for both", "O(1) for both", "O(1) push, O(n) pop", "O(n) push, O(1) pop"]),
        correctOption: 1,
        explanation: "Both push (insert at head) and pop (remove from head) operations are O(1) in a linked list-based stack.",
        difficulty: "INTERMEDIATE",
      },
    }),
  ]);

  // ─── DSA: Beginner Coding (2) ─────────────────────────
  const dsaCodingBeginner = await prisma.question.upsert({
    where: { questionText: "Find the largest element in an array" },
    update: {},
    create: {
      trackId: dsaTrack.id, topic: "Arrays Basics", questionType: "CODING",
      questionText: "Find the largest element in an array",
      codeDescription: "Given an array of integers, write a function to find and return the largest element in the array.\n\nYour solution should:\n1. Iterate through the array\n2. Track the maximum value\n3. Return the largest element\n\nDo not use built-in sort functions.",
      sampleInput: "[3, 7, 2, 9, 1, 5]",
      sampleOutput: "9",
      constraints: "1 <= array.length <= 10000\n-10^6 <= array[i] <= 10^6\nThe array will always have at least one element.",
      hints: "Start by assuming the first element is the largest. Then iterate through the remaining elements and update the maximum whenever you find a larger value.",
      starterCode: JSON.stringify({
        javascript: `function findLargest(arr) {\n  // Write your solution here\n  \n}`,
        python: `def find_largest(arr):\n    # Write your solution here\n    pass`,
        java: `public static int findLargest(int[] arr) {\n    // Write your solution here\n    return 0;\n}`,
      }),
      expectedKeywords: "loop,max,for,if,return,Math.max,largest,maximum",
      difficulty: "BEGINNER",
    },
  });

  await prisma.question.upsert({
    where: { questionText: "Reverse an array in place" },
    update: {},
    create: {
      trackId: dsaTrack.id, topic: "Arrays Basics", questionType: "CODING",
      questionText: "Reverse an array in place",
      codeDescription: "Given an array of integers, reverse it in place without using extra space.\n\nYour solution should:\n1. Use two pointers (start and end)\n2. Swap elements moving inward\n3. Return the reversed array",
      sampleInput: "[1, 2, 3, 4, 5]",
      sampleOutput: "[5, 4, 3, 2, 1]",
      constraints: "0 <= array.length <= 10000",
      hints: "Use two pointers: one at the start and one at the end. Swap them and move inward until they meet.",
      starterCode: JSON.stringify({
        javascript: `function reverseArray(arr) {\n  // Write your solution here\n  \n}`,
        python: `def reverse_array(arr):\n    # Write your solution here\n    pass`,
        java: `public static int[] reverseArray(int[] arr) {\n    // Write your solution here\n    return arr;\n}`,
      }),
      expectedKeywords: "swap,temp,for,while,left,right,start,end,reverse",
      difficulty: "BEGINNER",
    },
  });

  // ─── DSA: Intermediate Coding (2) ─────────────────────
  await prisma.question.upsert({
    where: { questionText: "Implement binary search" },
    update: {},
    create: {
      trackId: dsaTrack.id, topic: "Searching & Sorting", questionType: "CODING",
      questionText: "Implement binary search",
      codeDescription: "Implement binary search on a sorted array. Return the index of the target element, or -1 if not found.\n\nYour solution should:\n1. Use two pointers (low and high)\n2. Calculate mid and compare\n3. Narrow the search space each iteration",
      sampleInput: "arr = [1, 3, 5, 7, 9, 11], target = 7",
      sampleOutput: "3",
      constraints: "Array is sorted in ascending order\n1 <= arr.length <= 100000",
      hints: "Calculate mid = Math.floor((low + high) / 2). If arr[mid] equals target, return mid. If target is smaller, search left half. Otherwise search right half.",
      starterCode: JSON.stringify({
        javascript: `function binarySearch(arr, target) {\n  // Write your solution here\n  \n}`,
        python: `def binary_search(arr, target):\n    # Write your solution here\n    pass`,
        java: `public static int binarySearch(int[] arr, int target) {\n    // Write your solution here\n    return -1;\n}`,
      }),
      expectedKeywords: "low,high,mid,while,if,return,floor,left,right,binary",
      difficulty: "INTERMEDIATE",
    },
  });

  await prisma.question.upsert({
    where: { questionText: "Find the maximum sum subarray of size k" },
    update: {},
    create: {
      trackId: dsaTrack.id, topic: "Two Pointers & Sliding Window", questionType: "CODING",
      questionText: "Find the maximum sum subarray of size k",
      codeDescription: "Given an array of integers and a number k, find the maximum sum of any contiguous subarray of size k using the sliding window technique.",
      sampleInput: "arr = [2, 1, 5, 1, 3, 2], k = 3",
      sampleOutput: "9  (subarray [5, 1, 3])",
      constraints: "1 <= k <= arr.length <= 100000",
      hints: "First compute the sum of the first k elements. Then slide the window: add the next element and subtract the element leaving the window. Track the maximum sum.",
      starterCode: JSON.stringify({
        javascript: `function maxSumSubarray(arr, k) {\n  // Write your solution here\n  \n}`,
        python: `def max_sum_subarray(arr, k):\n    # Write your solution here\n    pass`,
        java: `public static int maxSumSubarray(int[] arr, int k) {\n    // Write your solution here\n    return 0;\n}`,
      }),
      expectedKeywords: "sum,window,max,slide,for,loop,subtract,add,subarray",
      difficulty: "INTERMEDIATE",
    },
  });

  console.log("✅ DSA questions seeded: 10 MCQs + 4 coding");

  // ─── PYTHON: Beginner MCQs (5) ───────────────────────
  const pythonBeginnerMcqs = await Promise.all([
    prisma.question.upsert({
      where: { questionText: "What is the output of: print(type(3.14))?" },
      update: {},
      create: {
        trackId: pythonTrack.id, topic: "Python Basics", questionType: "MCQ",
        questionText: "What is the output of: print(type(3.14))?",
        options: JSON.stringify(["<class 'int'>", "<class 'float'>", "<class 'str'>", "<class 'double'>"]),
        correctOption: 1,
        explanation: "In Python, 3.14 is a floating-point number, so type() returns <class 'float'>. Python does not have a separate double type.",
        difficulty: "BEGINNER",
      },
    }),
    prisma.question.upsert({
      where: { questionText: "Which of the following is the correct way to create a list in Python?" },
      update: {},
      create: {
        trackId: pythonTrack.id, topic: "Python Basics", questionType: "MCQ",
        questionText: "Which of the following is the correct way to create a list in Python?",
        options: JSON.stringify(["list = (1, 2, 3)", "list = [1, 2, 3]", "list = {1, 2, 3}", "list = <1, 2, 3>"]),
        correctOption: 1,
        explanation: "Lists in Python are created using square brackets []. Parentheses () create tuples, and curly braces {} create sets or dicts.",
        difficulty: "BEGINNER",
      },
    }),
    prisma.question.upsert({
      where: { questionText: "What does the 'len()' function return when applied to a string 'hello'?" },
      update: {},
      create: {
        trackId: pythonTrack.id, topic: "Python Basics", questionType: "MCQ",
        questionText: "What does the 'len()' function return when applied to a string 'hello'?",
        options: JSON.stringify(["4", "5", "6", "Error"]),
        correctOption: 1,
        explanation: "len('hello') returns 5 because the string has 5 characters: h, e, l, l, o.",
        difficulty: "BEGINNER",
      },
    }),
    prisma.question.upsert({
      where: { questionText: "What is the result of 10 // 3 in Python?" },
      update: {},
      create: {
        trackId: pythonTrack.id, topic: "Python Basics", questionType: "MCQ",
        questionText: "What is the result of 10 // 3 in Python?",
        options: JSON.stringify(["3.33", "3", "4", "3.0"]),
        correctOption: 1,
        explanation: "The // operator performs floor (integer) division in Python, so 10 // 3 = 3.",
        difficulty: "BEGINNER",
      },
    }),
    prisma.question.upsert({
      where: { questionText: "What keyword is used to define a function in Python?" },
      update: {},
      create: {
        trackId: pythonTrack.id, topic: "Control Flow & Functions", questionType: "MCQ",
        questionText: "What keyword is used to define a function in Python?",
        options: JSON.stringify(["function", "def", "func", "define"]),
        correctOption: 1,
        explanation: "In Python, functions are defined using the 'def' keyword, followed by the function name and parentheses.",
        difficulty: "BEGINNER",
      },
    }),
  ]);

  // ─── PYTHON: Intermediate MCQs (5) ──────────────────
  await Promise.all([
    prisma.question.upsert({
      where: { questionText: "What is a lambda function in Python?" },
      update: {},
      create: {
        trackId: pythonTrack.id, topic: "Control Flow & Functions", questionType: "MCQ",
        questionText: "What is a lambda function in Python?",
        options: JSON.stringify(["A named function", "An anonymous inline function", "A built-in function", "A recursive function"]),
        correctOption: 1,
        explanation: "Lambda functions are anonymous, single-expression functions defined with the lambda keyword. Example: lambda x: x * 2",
        difficulty: "INTERMEDIATE",
      },
    }),
    prisma.question.upsert({
      where: { questionText: "What is the difference between a list and a tuple in Python?" },
      update: {},
      create: {
        trackId: pythonTrack.id, topic: "Data Structures in Python", questionType: "MCQ",
        questionText: "What is the difference between a list and a tuple in Python?",
        options: JSON.stringify(["Lists are faster", "Tuples are mutable, lists are not", "Lists are mutable, tuples are not", "No difference"]),
        correctOption: 2,
        explanation: "Lists are mutable (can be changed after creation), while tuples are immutable (cannot be changed). Tuples use () and lists use [].",
        difficulty: "INTERMEDIATE",
      },
    }),
    prisma.question.upsert({
      where: { questionText: "What does the dictionary method .get(key, default) do?" },
      update: {},
      create: {
        trackId: pythonTrack.id, topic: "Data Structures in Python", questionType: "MCQ",
        questionText: "What does the dictionary method .get(key, default) do?",
        options: JSON.stringify(["Raises KeyError if key not found", "Returns default if key not found", "Always returns None", "Adds the key with default value"]),
        correctOption: 1,
        explanation: ".get(key, default) returns the value for key if it exists, otherwise returns default (without raising an error).",
        difficulty: "INTERMEDIATE",
      },
    }),
    prisma.question.upsert({
      where: { questionText: "What is a list comprehension in Python?" },
      update: {},
      create: {
        trackId: pythonTrack.id, topic: "Control Flow & Functions", questionType: "MCQ",
        questionText: "What is a list comprehension in Python?",
        options: JSON.stringify(["A way to sort lists", "A concise way to create lists using a single line", "A method to delete list elements", "A type of loop"]),
        correctOption: 1,
        explanation: "List comprehensions provide a concise syntax for creating lists. Example: [x**2 for x in range(10)] creates a list of squares.",
        difficulty: "INTERMEDIATE",
      },
    }),
    prisma.question.upsert({
      where: { questionText: "What is the time complexity of checking if an element exists in a Python set?" },
      update: {},
      create: {
        trackId: pythonTrack.id, topic: "Data Structures in Python", questionType: "MCQ",
        questionText: "What is the time complexity of checking if an element exists in a Python set?",
        options: JSON.stringify(["O(n)", "O(1) average", "O(log n)", "O(n²)"]),
        correctOption: 1,
        explanation: "Python sets are implemented using hash tables, so membership testing (in operator) is O(1) on average.",
        difficulty: "INTERMEDIATE",
      },
    }),
  ]);

  // ─── PYTHON: Beginner Coding (2) ─────────────────────
  await prisma.question.upsert({
    where: { questionText: "Check if a number is palindrome" },
    update: {},
    create: {
      trackId: pythonTrack.id, topic: "Python Basics", questionType: "CODING",
      questionText: "Check if a number is palindrome",
      codeDescription: "Write a function that takes an integer and returns True if it reads the same forwards and backwards, False otherwise.\n\nExamples: 121 → True, 123 → False, -121 → False",
      sampleInput: "121",
      sampleOutput: "True",
      constraints: "-10^6 <= n <= 10^6\nNegative numbers are not palindromes.",
      hints: "Convert the number to a string and compare it with its reverse. Or reverse the number mathematically.",
      starterCode: JSON.stringify({
        javascript: `function isPalindrome(n) {\n  // Write your solution here\n}`,
        python: `def is_palindrome(n):\n    # Write your solution here\n    pass`,
        java: `public static boolean isPalindrome(int n) {\n    // Write your solution here\n    return false;\n}`,
      }),
      expectedKeywords: "str,reverse,return,if,true,false,palindrome,==",
      difficulty: "BEGINNER",
    },
  });

  await prisma.question.upsert({
    where: { questionText: "FizzBuzz implementation" },
    update: {},
    create: {
      trackId: pythonTrack.id, topic: "Control Flow & Functions", questionType: "CODING",
      questionText: "FizzBuzz implementation",
      codeDescription: "Write a function that returns a list of strings for numbers 1 to n:\n- 'Fizz' for multiples of 3\n- 'Buzz' for multiples of 5\n- 'FizzBuzz' for multiples of both 3 and 5\n- The number as a string otherwise",
      sampleInput: "15",
      sampleOutput: '["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]',
      constraints: "1 <= n <= 1000",
      hints: "Check divisibility by 15 first (both 3 and 5), then by 3, then by 5. Use modulo operator %.",
      starterCode: JSON.stringify({
        javascript: `function fizzBuzz(n) {\n  // Write your solution here\n}`,
        python: `def fizz_buzz(n):\n    # Write your solution here\n    pass`,
        java: `public static List<String> fizzBuzz(int n) {\n    // Write your solution here\n    return new ArrayList<>();\n}`,
      }),
      expectedKeywords: "for,if,modulo,%,fizz,buzz,append,push,return,loop",
      difficulty: "BEGINNER",
    },
  });

  // ─── PYTHON: Intermediate Coding (2) ─────────────────
  await prisma.question.upsert({
    where: { questionText: "Count frequency of each character in a string" },
    update: {},
    create: {
      trackId: pythonTrack.id, topic: "Data Structures in Python", questionType: "CODING",
      questionText: "Count frequency of each character in a string",
      codeDescription: "Write a function that takes a string and returns a dictionary (or object) with each character as a key and its frequency as the value. Ignore spaces.",
      sampleInput: '"hello world"',
      sampleOutput: '{"h":1, "e":1, "l":3, "o":2, "w":1, "r":1, "d":1}',
      constraints: "String length <= 10000\nIgnore spaces in counting",
      hints: "Iterate through each character. Use a dictionary to store counts. Check if the character already exists in the dictionary.",
      starterCode: JSON.stringify({
        javascript: `function charFrequency(str) {\n  // Write your solution here\n}`,
        python: `def char_frequency(s):\n    # Write your solution here\n    pass`,
        java: `public static Map<Character, Integer> charFrequency(String s) {\n    // Write your solution here\n    return new HashMap<>();\n}`,
      }),
      expectedKeywords: "for,dict,dictionary,map,count,if,key,value,frequency,char",
      difficulty: "INTERMEDIATE",
    },
  });

  await prisma.question.upsert({
    where: { questionText: "Find the two numbers that add up to a target" },
    update: {},
    create: {
      trackId: pythonTrack.id, topic: "Data Structures in Python", questionType: "CODING",
      questionText: "Find the two numbers that add up to a target",
      codeDescription: "Given a list of integers and a target sum, return the indices of two numbers that add up to the target. Assume exactly one solution exists.",
      sampleInput: "nums = [2, 7, 11, 15], target = 9",
      sampleOutput: "[0, 1]  (because nums[0] + nums[1] = 2 + 7 = 9)",
      constraints: "2 <= nums.length <= 10000\nExactly one valid solution exists",
      hints: "Use a hash map to store each number's index. For each number, check if (target - number) exists in the map.",
      starterCode: JSON.stringify({
        javascript: `function twoSum(nums, target) {\n  // Write your solution here\n}`,
        python: `def two_sum(nums, target):\n    # Write your solution here\n    pass`,
        java: `public static int[] twoSum(int[] nums, int target) {\n    // Write your solution here\n    return new int[]{-1, -1};\n}`,
      }),
      expectedKeywords: "map,hash,dict,for,target,complement,return,index,key",
      difficulty: "INTERMEDIATE",
    },
  });

  console.log("✅ Python questions seeded: 10 MCQs + 4 coding");

  // ─── JAVASCRIPT: Beginner MCQs (5) ───────────────────
  const jsBeginnerMcqs = await Promise.all([
    prisma.question.upsert({
      where: { questionText: "What is the result of typeof null in JavaScript?" },
      update: {},
      create: {
        trackId: jsTrack.id, topic: "JavaScript Basics", questionType: "MCQ",
        questionText: "What is the result of typeof null in JavaScript?",
        options: JSON.stringify(["'null'", "'undefined'", "'object'", "'boolean'"]),
        correctOption: 2,
        explanation: "typeof null returns 'object' in JavaScript. This is a well-known bug that has persisted since the first version of JavaScript.",
        difficulty: "BEGINNER",
      },
    }),
    prisma.question.upsert({
      where: { questionText: "Which keyword declares a block-scoped variable in JavaScript?" },
      update: {},
      create: {
        trackId: jsTrack.id, topic: "JavaScript Basics", questionType: "MCQ",
        questionText: "Which keyword declares a block-scoped variable in JavaScript?",
        options: JSON.stringify(["var", "let", "function", "dim"]),
        correctOption: 1,
        explanation: "'let' declares a block-scoped variable. 'var' is function-scoped and 'const' is also block-scoped but immutable.",
        difficulty: "BEGINNER",
      },
    }),
    prisma.question.upsert({
      where: { questionText: "What does '===' operator check in JavaScript?" },
      update: {},
      create: {
        trackId: jsTrack.id, topic: "JavaScript Basics", questionType: "MCQ",
        questionText: "What does '===' operator check in JavaScript?",
        options: JSON.stringify(["Only value equality", "Value and type equality", "Only type equality", "Reference equality"]),
        correctOption: 1,
        explanation: "'===' is the strict equality operator that checks both value AND type. '==' performs type coercion before comparison.",
        difficulty: "BEGINNER",
      },
    }),
    prisma.question.upsert({
      where: { questionText: "What is the output of: console.log(typeof undefined)?" },
      update: {},
      create: {
        trackId: jsTrack.id, topic: "JavaScript Basics", questionType: "MCQ",
        questionText: "What is the output of: console.log(typeof undefined)?",
        options: JSON.stringify(["'null'", "'undefined'", "'object'", "'NaN'"]),
        correctOption: 1,
        explanation: "typeof undefined returns the string 'undefined'. This is different from null, which returns 'object'.",
        difficulty: "BEGINNER",
      },
    }),
    prisma.question.upsert({
      where: { questionText: "Which method converts a JSON string to a JavaScript object?" },
      update: {},
      create: {
        trackId: jsTrack.id, topic: "JavaScript Basics", questionType: "MCQ",
        questionText: "Which method converts a JSON string to a JavaScript object?",
        options: JSON.stringify(["JSON.stringify()", "JSON.parse()", "JSON.convert()", "JSON.toObject()"]),
        correctOption: 1,
        explanation: "JSON.parse() converts a JSON string to a JavaScript object. JSON.stringify() does the opposite — converts an object to a JSON string.",
        difficulty: "BEGINNER",
      },
    }),
  ]);

  // ─── JAVASCRIPT: Intermediate MCQs (5) ──────────────
  await Promise.all([
    prisma.question.upsert({
      where: { questionText: "What is event bubbling in JavaScript?" },
      update: {},
      create: {
        trackId: jsTrack.id, topic: "DOM & Events", questionType: "MCQ",
        questionText: "What is event bubbling in JavaScript?",
        options: JSON.stringify(["Events fire from parent to child", "Events fire from child to parent", "Events fire on the target only", "Events are canceled automatically"]),
        correctOption: 1,
        explanation: "Event bubbling means the event starts at the target element and bubbles up to its parent elements, all the way to the document.",
        difficulty: "INTERMEDIATE",
      },
    }),
    prisma.question.upsert({
      where: { questionText: "What does a Promise in JavaScript represent?" },
      update: {},
      create: {
        trackId: jsTrack.id, topic: "Async JavaScript", questionType: "MCQ",
        questionText: "What does a Promise in JavaScript represent?",
        options: JSON.stringify(["A synchronous operation", "An eventual completion or failure of an async operation", "A callback function", "A timer"]),
        correctOption: 1,
        explanation: "A Promise represents the eventual completion (or failure) of an asynchronous operation and its resulting value.",
        difficulty: "INTERMEDIATE",
      },
    }),
    prisma.question.upsert({
      where: { questionText: "What is the purpose of async/await in JavaScript?" },
      update: {},
      create: {
        trackId: jsTrack.id, topic: "Async JavaScript", questionType: "MCQ",
        questionText: "What is the purpose of async/await in JavaScript?",
        options: JSON.stringify(["To make code run faster", "To write asynchronous code that looks synchronous", "To block the event loop", "To create threads"]),
        correctOption: 1,
        explanation: "async/await provides syntactic sugar over Promises, allowing asynchronous code to be written in a synchronous-looking style.",
        difficulty: "INTERMEDIATE",
      },
    }),
    prisma.question.upsert({
      where: { questionText: "What is a closure in JavaScript?" },
      update: {},
      create: {
        trackId: jsTrack.id, topic: "JavaScript Basics", questionType: "MCQ",
        questionText: "What is a closure in JavaScript?",
        options: JSON.stringify(["A function that closes the browser", "A function that has access to variables from its outer scope", "A way to end a loop", "A type of error handling"]),
        correctOption: 1,
        explanation: "A closure is a function that retains access to variables from its lexical scope, even after the outer function has returned.",
        difficulty: "INTERMEDIATE",
      },
    }),
    prisma.question.upsert({
      where: { questionText: "What does document.querySelector('.myClass') return?" },
      update: {},
      create: {
        trackId: jsTrack.id, topic: "DOM & Events", questionType: "MCQ",
        questionText: "What does document.querySelector('.myClass') return?",
        options: JSON.stringify(["All elements with class 'myClass'", "The first element with class 'myClass'", "The last element with class 'myClass'", "null always"]),
        correctOption: 1,
        explanation: "querySelector returns the first element that matches the CSS selector. Use querySelectorAll to get all matching elements.",
        difficulty: "INTERMEDIATE",
      },
    }),
  ]);

  // ─── JAVASCRIPT: Beginner Coding (2) ─────────────────
  await prisma.question.upsert({
    where: { questionText: "Count vowels in a string" },
    update: {},
    create: {
      trackId: jsTrack.id, topic: "JavaScript Basics", questionType: "CODING",
      questionText: "Count vowels in a string",
      codeDescription: "Write a function that takes a string and returns the number of vowels (a, e, i, o, u) in it. The function should be case-insensitive.",
      sampleInput: '"Hello World"',
      sampleOutput: "3",
      constraints: "String length <= 10000",
      hints: "Convert the string to lowercase. Iterate through each character and check if it's in the set of vowels 'aeiou'.",
      starterCode: JSON.stringify({
        javascript: `function countVowels(str) {\n  // Write your solution here\n}`,
        python: `def count_vowels(s):\n    # Write your solution here\n    pass`,
        java: `public static int countVowels(String s) {\n    // Write your solution here\n    return 0;\n}`,
      }),
      expectedKeywords: "for,if,vowel,aeiou,count,toLowerCase,includes,return,loop",
      difficulty: "BEGINNER",
    },
  });

  await prisma.question.upsert({
    where: { questionText: "Remove duplicates from an array" },
    update: {},
    create: {
      trackId: jsTrack.id, topic: "JavaScript Basics", questionType: "CODING",
      questionText: "Remove duplicates from an array",
      codeDescription: "Write a function that takes an array and returns a new array with all duplicate values removed. Maintain the original order.",
      sampleInput: "[1, 2, 2, 3, 4, 4, 5]",
      sampleOutput: "[1, 2, 3, 4, 5]",
      constraints: "Array length <= 10000",
      hints: "Use a Set to track seen values. Iterate through the array and add elements to the result only if they haven't been seen before.",
      starterCode: JSON.stringify({
        javascript: `function removeDuplicates(arr) {\n  // Write your solution here\n}`,
        python: `def remove_duplicates(arr):\n    # Write your solution here\n    pass`,
        java: `public static int[] removeDuplicates(int[] arr) {\n    // Write your solution here\n    return arr;\n}`,
      }),
      expectedKeywords: "set,for,if,has,add,push,filter,includes,return,unique",
      difficulty: "BEGINNER",
    },
  });

  // ─── JAVASCRIPT: Intermediate Coding (2) ─────────────
  await prisma.question.upsert({
    where: { questionText: "Debounce function implementation" },
    update: {},
    create: {
      trackId: jsTrack.id, topic: "Async JavaScript", questionType: "CODING",
      questionText: "Debounce function implementation",
      codeDescription: "Implement a debounce function that delays the execution of a callback until after a specified wait time has elapsed since the last call.\n\nThe returned function should reset the timer each time it's called.",
      sampleInput: "const debouncedLog = debounce(console.log, 300)",
      sampleOutput: "Only the last call executes after 300ms of inactivity",
      constraints: "wait >= 0",
      hints: "Use setTimeout and clearTimeout. Store the timer ID in a closure. Each call clears the previous timer and sets a new one.",
      starterCode: JSON.stringify({
        javascript: `function debounce(fn, wait) {\n  // Write your solution here\n}`,
        python: `# Python equivalent using threading\ndef debounce(fn, wait):\n    # Write your solution here\n    pass`,
        java: `// Java concept - use ScheduledExecutorService\npublic static Runnable debounce(Runnable fn, int waitMs) {\n    // Write your solution here\n    return () -> {};\n}`,
      }),
      expectedKeywords: "setTimeout,clearTimeout,timer,closure,return,function,delay",
      difficulty: "INTERMEDIATE",
    },
  });

  await prisma.question.upsert({
    where: { questionText: "Flatten a nested array" },
    update: { topic: "JavaScript Basics" },
    create: {
      trackId: jsTrack.id, topic: "JavaScript Basics", questionType: "CODING",
      questionText: "Flatten a nested array",
      codeDescription: "Write a function that takes a deeply nested array and returns a flat (one-dimensional) array. Do not use Array.flat().",
      sampleInput: "[1, [2, [3, 4], 5], [6, 7]]",
      sampleOutput: "[1, 2, 3, 4, 5, 6, 7]",
      constraints: "Maximum nesting depth: 100",
      hints: "Use recursion: iterate through each element. If it's an array, recursively flatten it. Otherwise, push it to the result.",
      starterCode: JSON.stringify({
        javascript: `function flatten(arr) {\n  // Write your solution here\n}`,
        python: `def flatten(arr):\n    # Write your solution here\n    pass`,
        java: `public static List<Integer> flatten(Object[] arr) {\n    // Write your solution here\n    return new ArrayList<>();\n}`,
      }),
      expectedKeywords: "Array.isArray,recursive,recursion,for,push,concat,spread,return,flatten",
      difficulty: "INTERMEDIATE",
    },
  });

  console.log("✅ JavaScript questions seeded: 10 MCQs + 4 coding");

  // ─── REACT: Beginner MCQs (5) ────────────────────────
  const reactBeginnerMcqs = await Promise.all([
    prisma.question.upsert({
      where: { questionText: "What hook is used to manage state in a functional React component?" },
      update: {},
      create: {
        trackId: reactTrack.id, topic: "React Fundamentals", questionType: "MCQ",
        questionText: "What hook is used to manage state in a functional React component?",
        options: JSON.stringify(["useEffect", "useState", "useContext", "useReducer"]),
        correctOption: 1,
        explanation: "useState is the primary hook for managing local state in React functional components. It returns a state variable and a setter function.",
        difficulty: "BEGINNER",
      },
    }),
    prisma.question.upsert({
      where: { questionText: "What is JSX in React?" },
      update: {},
      create: {
        trackId: reactTrack.id, topic: "React Fundamentals", questionType: "MCQ",
        questionText: "What is JSX in React?",
        options: JSON.stringify(["A database query language", "A syntax extension that lets you write HTML-like code in JavaScript", "A CSS framework", "A testing library"]),
        correctOption: 1,
        explanation: "JSX is a syntax extension for JavaScript that allows you to write HTML-like code within JavaScript. It gets transpiled to React.createElement() calls.",
        difficulty: "BEGINNER",
      },
    }),
    prisma.question.upsert({
      where: { questionText: "How do you pass data from a parent component to a child component in React?" },
      update: {},
      create: {
        trackId: reactTrack.id, topic: "React Fundamentals", questionType: "MCQ",
        questionText: "How do you pass data from a parent component to a child component in React?",
        options: JSON.stringify(["Using state", "Using props", "Using context only", "Using global variables"]),
        correctOption: 1,
        explanation: "Props (properties) are the primary way to pass data from parent to child components. They are read-only and flow one way (top-down).",
        difficulty: "BEGINNER",
      },
    }),
    prisma.question.upsert({
      where: { questionText: "What is the virtual DOM in React?" },
      update: {},
      create: {
        trackId: reactTrack.id, topic: "React Fundamentals", questionType: "MCQ",
        questionText: "What is the virtual DOM in React?",
        options: JSON.stringify(["The actual browser DOM", "A lightweight copy of the real DOM kept in memory", "A CSS rendering engine", "A database"]),
        correctOption: 1,
        explanation: "The virtual DOM is a lightweight JavaScript representation of the real DOM. React uses it to calculate the minimal set of changes needed, improving performance.",
        difficulty: "BEGINNER",
      },
    }),
    prisma.question.upsert({
      where: { questionText: "What is the purpose of the 'key' prop in React lists?" },
      update: {},
      create: {
        trackId: reactTrack.id, topic: "React Fundamentals", questionType: "MCQ",
        questionText: "What is the purpose of the 'key' prop in React lists?",
        options: JSON.stringify(["For CSS styling", "To help React identify which items have changed", "To encrypt data", "To set the index"]),
        correctOption: 1,
        explanation: "Keys help React identify which items in a list have changed, been added, or removed. They should be stable, unique identifiers.",
        difficulty: "BEGINNER",
      },
    }),
  ]);

  // ─── REACT: Intermediate MCQs (5) ──────────────────
  await Promise.all([
    prisma.question.upsert({
      where: { questionText: "When does useEffect with an empty dependency array run?" },
      update: {},
      create: {
        trackId: reactTrack.id, topic: "Hooks & Effects", questionType: "MCQ",
        questionText: "When does useEffect with an empty dependency array run?",
        options: JSON.stringify(["On every render", "Only on mount (once)", "Never", "On unmount only"]),
        correctOption: 1,
        explanation: "useEffect with [] as the dependency array runs only once after the initial render (mount). It's similar to componentDidMount in class components.",
        difficulty: "INTERMEDIATE",
      },
    }),
    prisma.question.upsert({
      where: { questionText: "What is the purpose of useCallback in React?" },
      update: {},
      create: {
        trackId: reactTrack.id, topic: "Hooks & Effects", questionType: "MCQ",
        questionText: "What is the purpose of useCallback in React?",
        options: JSON.stringify(["To fetch data from an API", "To memoize a function so it doesn't get recreated on every render", "To create a callback URL", "To handle errors"]),
        correctOption: 1,
        explanation: "useCallback returns a memoized version of a callback function that only changes if one of its dependencies has changed, preventing unnecessary re-renders of child components.",
        difficulty: "INTERMEDIATE",
      },
    }),
    prisma.question.upsert({
      where: { questionText: "What problem does React Context solve?" },
      update: {},
      create: {
        trackId: reactTrack.id, topic: "State Management", questionType: "MCQ",
        questionText: "What problem does React Context solve?",
        options: JSON.stringify(["CSS styling issues", "Prop drilling — passing props through many levels", "Database connections", "File uploads"]),
        correctOption: 1,
        explanation: "React Context provides a way to share values between components without explicitly passing props through every level of the tree (prop drilling).",
        difficulty: "INTERMEDIATE",
      },
    }),
    prisma.question.upsert({
      where: { questionText: "When would you use useReducer over useState?" },
      update: {},
      create: {
        trackId: reactTrack.id, topic: "State Management", questionType: "MCQ",
        questionText: "When would you use useReducer over useState?",
        options: JSON.stringify(["For simple boolean toggles", "When state logic is complex with multiple sub-values", "For CSS animations", "For routing"]),
        correctOption: 1,
        explanation: "useReducer is preferred when state logic is complex, involves multiple sub-values, or when the next state depends on the previous one.",
        difficulty: "INTERMEDIATE",
      },
    }),
    prisma.question.upsert({
      where: { questionText: "What does the cleanup function in useEffect do?" },
      update: {},
      create: {
        trackId: reactTrack.id, topic: "Hooks & Effects", questionType: "MCQ",
        questionText: "What does the cleanup function in useEffect do?",
        options: JSON.stringify(["Clears the console", "Runs before the component unmounts or before the effect re-runs", "Deletes the component", "Resets all state"]),
        correctOption: 1,
        explanation: "The cleanup function (returned from useEffect) runs before the component unmounts and before every re-execution of the effect. Used for unsubscribing, clearing timers, etc.",
        difficulty: "INTERMEDIATE",
      },
    }),
  ]);

  // ─── REACT: Beginner Coding (2) ──────────────────────
  await prisma.question.upsert({
    where: { questionText: "Build a counter component" },
    update: {},
    create: {
      trackId: reactTrack.id, topic: "React Fundamentals", questionType: "CODING",
      questionText: "Build a counter component",
      codeDescription: "Create a React functional component that displays a count and has two buttons: 'Increment' and 'Decrement'. The count should start at 0.\n\nRequirements:\n1. Use useState hook\n2. Increment button adds 1\n3. Decrement button subtracts 1\n4. Display the current count",
      sampleInput: "Initial render",
      sampleOutput: "Count: 0 [Increment] [Decrement]",
      constraints: "Must use functional component with hooks",
      hints: "Use useState(0) to initialize the counter. Create two handler functions that call the setter with count + 1 and count - 1.",
      starterCode: JSON.stringify({
        javascript: `function Counter() {\n  // Use useState hook\n  // Return JSX with count display and buttons\n}`,
        python: `# React is JavaScript-only\n# Write the JavaScript solution`,
        java: `// React is JavaScript-only\n// Write the JavaScript solution`,
      }),
      expectedKeywords: "useState,onClick,setCount,return,button,increment,decrement",
      difficulty: "BEGINNER",
    },
  });

  await prisma.question.upsert({
    where: { questionText: "Create a greeting component with props" },
    update: {},
    create: {
      trackId: reactTrack.id, topic: "React Fundamentals", questionType: "CODING",
      questionText: "Create a greeting component with props",
      codeDescription: "Create a React component called Greeting that:\n1. Accepts 'name' and 'time' as props\n2. Displays 'Good {time}, {name}!'\n3. If no name is provided, use 'Guest'\n4. If no time is provided, use 'day'",
      sampleInput: '<Greeting name="Alice" time="morning" />',
      sampleOutput: "Good morning, Alice!",
      constraints: "Must handle default values for missing props",
      hints: "Use default parameter values or the || operator for fallbacks. Destructure props in the function signature.",
      starterCode: JSON.stringify({
        javascript: `function Greeting({ name, time }) {\n  // Handle defaults and return greeting\n}`,
        python: `# React is JavaScript-only\n# Write the JavaScript solution`,
        java: `// React is JavaScript-only\n// Write the JavaScript solution`,
      }),
      expectedKeywords: "props,return,default,name,time,greeting,function,component",
      difficulty: "BEGINNER",
    },
  });

  // ─── REACT: Intermediate Coding (2) ──────────────────
  await prisma.question.upsert({
    where: { questionText: "Build a todo list with useState" },
    update: {},
    create: {
      trackId: reactTrack.id, topic: "Hooks & Effects", questionType: "CODING",
      questionText: "Build a todo list with useState",
      codeDescription: "Create a React component that:\n1. Has an input field and 'Add' button\n2. Maintains a list of todos using useState\n3. Each todo can be marked as completed (toggle)\n4. Completed todos should have a line-through style\n5. Include a 'Delete' button for each todo",
      sampleInput: "Type 'Buy groceries' and click Add",
      sampleOutput: "List shows: ☐ Buy groceries [Delete]",
      constraints: "Must use useState for state management\nMust handle empty input (don't add empty todos)",
      hints: "Use an array of objects [{id, text, completed}] in state. Use map to render, filter to delete, and map with spread to toggle.",
      starterCode: JSON.stringify({
        javascript: `function TodoList() {\n  // useState for todos array and input value\n  // Add, toggle, delete handlers\n  // Return JSX\n}`,
        python: `# React is JavaScript-only\n# Write the JavaScript solution`,
        java: `// React is JavaScript-only\n// Write the JavaScript solution`,
      }),
      expectedKeywords: "useState,map,filter,onClick,onChange,todo,completed,delete,toggle,setState",
      difficulty: "INTERMEDIATE",
    },
  });

  await prisma.question.upsert({
    where: { questionText: "Create a custom useLocalStorage hook" },
    update: {},
    create: {
      trackId: reactTrack.id, topic: "Hooks & Effects", questionType: "CODING",
      questionText: "Create a custom useLocalStorage hook",
      codeDescription: "Build a custom React hook called useLocalStorage that:\n1. Takes a key and initial value\n2. Returns [storedValue, setValue] like useState\n3. Persists the value to localStorage\n4. Reads from localStorage on initialization\n5. Handles JSON serialization/deserialization",
      sampleInput: 'const [name, setName] = useLocalStorage("name", "Guest")',
      sampleOutput: "Value persists across page refreshes",
      constraints: "Must handle cases where localStorage is unavailable\nMust handle JSON parse errors gracefully",
      hints: "Use useState with a lazy initializer that reads from localStorage. Use useEffect to write to localStorage whenever the value changes.",
      starterCode: JSON.stringify({
        javascript: `function useLocalStorage(key, initialValue) {\n  // useState with lazy initializer\n  // useEffect to sync with localStorage\n  // Return [storedValue, setValue]\n}`,
        python: `# React hooks are JavaScript-only\n# Write the JavaScript solution`,
        java: `// React hooks are JavaScript-only\n// Write the JavaScript solution`,
      }),
      expectedKeywords: "useState,useEffect,localStorage,getItem,setItem,JSON,parse,stringify,return",
      difficulty: "INTERMEDIATE",
    },
  });

  console.log("✅ React questions seeded: 10 MCQs + 4 coding");

  // ─── JAVA: Beginner MCQs (5) ─────────────────────────
  const javaBeginnerMcqs = await Promise.all([
    prisma.question.upsert({
      where: { questionText: "Which keyword is used to inherit a class in Java?" },
      update: {},
      create: {
        trackId: javaTrack.id, topic: "Java Basics", questionType: "MCQ",
        questionText: "Which keyword is used to inherit a class in Java?",
        options: JSON.stringify(["implements", "extends", "inherits", "super"]),
        correctOption: 1,
        explanation: "The 'extends' keyword is used in Java to inherit from a parent class. 'implements' is used for interfaces.",
        difficulty: "BEGINNER",
      },
    }),
    prisma.question.upsert({
      where: { questionText: "What is the default value of an int variable in Java?" },
      update: {},
      create: {
        trackId: javaTrack.id, topic: "Java Basics", questionType: "MCQ",
        questionText: "What is the default value of an int variable in Java?",
        options: JSON.stringify(["null", "0", "undefined", "-1"]),
        correctOption: 1,
        explanation: "In Java, the default value of an int (and other numeric primitive types) is 0. Only object references default to null.",
        difficulty: "BEGINNER",
      },
    }),
    prisma.question.upsert({
      where: { questionText: "Which method is the entry point of a Java application?" },
      update: {},
      create: {
        trackId: javaTrack.id, topic: "Java Basics", questionType: "MCQ",
        questionText: "Which method is the entry point of a Java application?",
        options: JSON.stringify(["start()", "main()", "run()", "init()"]),
        correctOption: 1,
        explanation: "The main() method with signature 'public static void main(String[] args)' is the entry point of any Java application.",
        difficulty: "BEGINNER",
      },
    }),
    prisma.question.upsert({
      where: { questionText: "What is the difference between '==' and '.equals()' in Java?" },
      update: {},
      create: {
        trackId: javaTrack.id, topic: "Java Basics", questionType: "MCQ",
        questionText: "What is the difference between '==' and '.equals()' in Java?",
        options: JSON.stringify(["No difference", "'==' compares references, '.equals()' compares values", "'==' compares values, '.equals()' compares references", "'==' is faster"]),
        correctOption: 1,
        explanation: "'==' compares object references (memory addresses), while '.equals()' compares the actual content/value of objects.",
        difficulty: "BEGINNER",
      },
    }),
    prisma.question.upsert({
      where: { questionText: "Which data type is used to store a single character in Java?" },
      update: {},
      create: {
        trackId: javaTrack.id, topic: "Java Basics", questionType: "MCQ",
        questionText: "Which data type is used to store a single character in Java?",
        options: JSON.stringify(["String", "char", "Character", "byte"]),
        correctOption: 1,
        explanation: "The 'char' primitive type stores a single 16-bit Unicode character in Java. 'Character' is the wrapper class for char.",
        difficulty: "BEGINNER",
      },
    }),
  ]);

  // ─── JAVA: Intermediate MCQs (5) ────────────────────
  await Promise.all([
    prisma.question.upsert({
      where: { questionText: "What is polymorphism in Java?" },
      update: {},
      create: {
        trackId: javaTrack.id, topic: "OOP in Java", questionType: "MCQ",
        questionText: "What is polymorphism in Java?",
        options: JSON.stringify(["Having multiple constructors", "The ability of an object to take many forms", "Creating multiple classes", "Using static methods"]),
        correctOption: 1,
        explanation: "Polymorphism allows objects to be treated as instances of their parent class. It enables method overriding and interface implementation.",
        difficulty: "INTERMEDIATE",
      },
    }),
    prisma.question.upsert({
      where: { questionText: "What is the difference between an abstract class and an interface in Java?" },
      update: {},
      create: {
        trackId: javaTrack.id, topic: "OOP in Java", questionType: "MCQ",
        questionText: "What is the difference between an abstract class and an interface in Java?",
        options: JSON.stringify(["No difference", "Abstract classes can have constructors and instance variables; interfaces cannot (pre-Java 8)", "Interfaces are faster", "Abstract classes can't be inherited"]),
        correctOption: 1,
        explanation: "Abstract classes can have constructors, instance variables, and concrete methods. Interfaces (pre-Java 8) could only have abstract methods and constants.",
        difficulty: "INTERMEDIATE",
      },
    }),
    prisma.question.upsert({
      where: { questionText: "What is the difference between ArrayList and LinkedList in Java?" },
      update: {},
      create: {
        trackId: javaTrack.id, topic: "Collections & Error Handling", questionType: "MCQ",
        questionText: "What is the difference between ArrayList and LinkedList in Java?",
        options: JSON.stringify(["No difference", "ArrayList uses dynamic array, LinkedList uses doubly-linked list", "LinkedList is always faster", "ArrayList can't grow"]),
        correctOption: 1,
        explanation: "ArrayList uses a resizable array (fast random access O(1)) while LinkedList uses a doubly-linked list (fast insertion/deletion O(1) at known positions).",
        difficulty: "INTERMEDIATE",
      },
    }),
    prisma.question.upsert({
      where: { questionText: "What is the difference between checked and unchecked exceptions in Java?" },
      update: {},
      create: {
        trackId: javaTrack.id, topic: "Collections & Error Handling", questionType: "MCQ",
        questionText: "What is the difference between checked and unchecked exceptions in Java?",
        options: JSON.stringify(["Checked must be handled at compile time; unchecked occur at runtime", "Unchecked must be handled at compile time", "No difference", "Checked exceptions don't exist"]),
        correctOption: 0,
        explanation: "Checked exceptions must be caught or declared (IOException, SQLException). Unchecked exceptions (RuntimeException subclasses) don't require explicit handling.",
        difficulty: "INTERMEDIATE",
      },
    }),
    prisma.question.upsert({
      where: { questionText: "What does the 'finally' block do in Java exception handling?" },
      update: {},
      create: {
        trackId: javaTrack.id, topic: "Collections & Error Handling", questionType: "MCQ",
        questionText: "What does the 'finally' block do in Java exception handling?",
        options: JSON.stringify(["Catches exceptions", "Executes only if an exception occurs", "Always executes regardless of whether an exception occurred", "Replaces the catch block"]),
        correctOption: 2,
        explanation: "The 'finally' block always executes after try/catch, regardless of whether an exception was thrown. It's used for cleanup operations.",
        difficulty: "INTERMEDIATE",
      },
    }),
  ]);

  // ─── JAVA: Beginner Coding (2) ───────────────────────
  await prisma.question.upsert({
    where: { questionText: "Check if a string is an anagram" },
    update: {},
    create: {
      trackId: javaTrack.id, topic: "Java Basics", questionType: "CODING",
      questionText: "Check if a string is an anagram",
      codeDescription: "Write a function that takes two strings and returns true if they are anagrams (same characters, different arrangement). Case-insensitive.\n\nExamples: 'listen' & 'silent' → true, 'hello' & 'world' → false",
      sampleInput: '"listen", "silent"',
      sampleOutput: "true",
      constraints: "Strings contain only letters\nCase-insensitive comparison",
      hints: "Sort both strings alphabetically and compare. Or count the frequency of each character in both strings.",
      starterCode: JSON.stringify({
        javascript: `function isAnagram(s1, s2) {\n  // Write your solution here\n}`,
        python: `def is_anagram(s1, s2):\n    # Write your solution here\n    pass`,
        java: `public static boolean isAnagram(String s1, String s2) {\n    // Write your solution here\n    return false;\n}`,
      }),
      expectedKeywords: "sort,toLowerCase,toLowerCase,split,join,for,if,return,anagram,compare,equal",
      difficulty: "BEGINNER",
    },
  });

  await prisma.question.upsert({
    where: { questionText: "Calculate factorial of a number" },
    update: {},
    create: {
      trackId: javaTrack.id, topic: "Java Basics", questionType: "CODING",
      questionText: "Calculate factorial of a number",
      codeDescription: "Write a function that calculates the factorial of a non-negative integer n.\nFactorial of n (n!) = n × (n-1) × (n-2) × ... × 1\nFactorial of 0 = 1",
      sampleInput: "5",
      sampleOutput: "120",
      constraints: "0 <= n <= 20\nUse iteration or recursion",
      hints: "Iterative approach: Start with result = 1 and multiply by each number from 1 to n. Recursive approach: n! = n × (n-1)!",
      starterCode: JSON.stringify({
        javascript: `function factorial(n) {\n  // Write your solution here\n}`,
        python: `def factorial(n):\n    # Write your solution here\n    pass`,
        java: `public static long factorial(int n) {\n    // Write your solution here\n    return 0;\n}`,
      }),
      expectedKeywords: "for,while,if,return,result,multiply,recursive,base,case,factorial",
      difficulty: "BEGINNER",
    },
  });

  // ─── JAVA: Intermediate Coding (2) ───────────────────
  await prisma.question.upsert({
    where: { questionText: "Implement a Stack using an array" },
    update: {},
    create: {
      trackId: javaTrack.id, topic: "OOP in Java", questionType: "CODING",
      questionText: "Implement a Stack using an array",
      codeDescription: "Implement a Stack class with the following methods:\n1. push(item) — add item to top\n2. pop() — remove and return top item\n3. peek() — return top item without removing\n4. isEmpty() — check if stack is empty\n5. size() — return number of elements",
      sampleInput: "push(1), push(2), peek() → 2, pop() → 2, size() → 1",
      sampleOutput: "Stack operations work correctly",
      constraints: "Use an array/list internally\nHandle underflow (pop/peek on empty stack)",
      hints: "Use an array and a top pointer. Push increments top and adds the element. Pop returns the element at top and decrements. Check for empty before pop/peek.",
      starterCode: JSON.stringify({
        javascript: `class Stack {\n  constructor() {\n    // Initialize\n  }\n  push(item) { }\n  pop() { }\n  peek() { }\n  isEmpty() { }\n  size() { }\n}`,
        python: `class Stack:\n    def __init__(self):\n        # Initialize\n        pass\n    def push(self, item):\n        pass\n    def pop(self):\n        pass\n    def peek(self):\n        pass\n    def is_empty(self):\n        pass\n    def size(self):\n        pass`,
        java: `public class Stack {\n    private int[] arr;\n    private int top;\n    \n    public Stack(int capacity) { }\n    public void push(int item) { }\n    public int pop() { return -1; }\n    public int peek() { return -1; }\n    public boolean isEmpty() { return true; }\n    public int size() { return 0; }\n}`,
      }),
      expectedKeywords: "push,pop,peek,isEmpty,size,top,array,length,return,class,constructor",
      difficulty: "INTERMEDIATE",
    },
  });

  await prisma.question.upsert({
    where: { questionText: "Group anagrams from a list of strings" },
    update: {},
    create: {
      trackId: javaTrack.id, topic: "Collections & Error Handling", questionType: "CODING",
      questionText: "Group anagrams from a list of strings",
      codeDescription: "Given a list of strings, group the anagrams together. Return a list of groups where each group contains strings that are anagrams of each other.",
      sampleInput: '["eat", "tea", "tan", "ate", "nat", "bat"]',
      sampleOutput: '[["eat","tea","ate"], ["tan","nat"], ["bat"]]',
      constraints: "1 <= strings.length <= 1000\nStrings contain only lowercase letters",
      hints: "Sort each string alphabetically to create a key. Use a HashMap where the key is the sorted string and the value is a list of original strings.",
      starterCode: JSON.stringify({
        javascript: `function groupAnagrams(strs) {\n  // Write your solution here\n}`,
        python: `def group_anagrams(strs):\n    # Write your solution here\n    pass`,
        java: `public static List<List<String>> groupAnagrams(String[] strs) {\n    // Write your solution here\n    return new ArrayList<>();\n}`,
      }),
      expectedKeywords: "sort,map,hashmap,dict,key,for,push,append,values,group,anagram",
      difficulty: "INTERMEDIATE",
    },
  });

  console.log("✅ Java questions seeded: 10 MCQs + 4 coding");

  // ─── 3b. Node.js & SQL Tracks ─────────────────────────────
  const nodejsTrack = await prisma.track.upsert({
    where: { slug: "nodejs" },
    update: {},
    create: {
      title: "Node.js Backend Development",
      slug: "nodejs",
      description: "Learn server-side JavaScript with Node.js. Cover core modules, Express.js, REST APIs, middleware, authentication, and database integration.",
      difficulty: "BEGINNER",
      estimatedHours: 35,
    },
  });

  const sqlTrack = await prisma.track.upsert({
    where: { slug: "sql" },
    update: {},
    create: {
      title: "SQL & Database Management",
      slug: "sql",
      description: "Master SQL from basics to advanced. Cover SELECT queries, JOINs, aggregations, subqueries, database design, normalization, and indexing.",
      difficulty: "BEGINNER",
      estimatedHours: 30,
    },
  });

  console.log("✅ Tracks created: Node.js, SQL");

  // ─── Node.js Resources ────────────────────────────────────
  await Promise.all([
    prisma.resource.upsert({
      where: { youtubeUrl: "https://www.youtube.com/watch?v=TlB_eWDSMt4" },
      update: {},
      create: {
        trackId: nodejsTrack.id,
        topic: "Node.js Fundamentals",
        title: "Node.js Tutorial for Beginners - Learn Node in 1 Hour",
        youtubeUrl: "https://www.youtube.com/watch?v=TlB_eWDSMt4",
        orderIndex: 1,
        estimatedMinutes: 60,
        difficulty: "BEGINNER",
        description: "Complete Node.js introduction covering runtime, event loop, modules, and basic file system operations.",
      },
    }),
    prisma.resource.upsert({
      where: { youtubeUrl: "https://www.youtube.com/watch?v=ENrzD9HAZK4" },
      update: {},
      create: {
        trackId: nodejsTrack.id,
        topic: "Node.js Fundamentals",
        title: "Node.js Crash Course - Traversy Media",
        youtubeUrl: "https://www.youtube.com/watch?v=ENrzD9HAZK4",
        orderIndex: 2,
        estimatedMinutes: 45,
        difficulty: "BEGINNER",
        description: "Fast-paced Node.js fundamentals: npm, fs module, http module, path module, and event emitters.",
      },
    }),
    prisma.resource.upsert({
      where: { youtubeUrl: "https://www.youtube.com/watch?v=Oe421EPjeBE" },
      update: {},
      create: {
        trackId: nodejsTrack.id,
        topic: "HTTP & Express.js",
        title: "Node.js and Express.js - Full Course",
        youtubeUrl: "https://www.youtube.com/watch?v=Oe421EPjeBE",
        orderIndex: 3,
        estimatedMinutes: 50,
        difficulty: "BEGINNER",
        description: "Build web servers and REST APIs with Express.js, learn routing, middleware, and template engines.",
      },
    }),
    prisma.resource.upsert({
      where: { youtubeUrl: "https://www.youtube.com/watch?v=L72fhGm1tfE" },
      update: {},
      create: {
        trackId: nodejsTrack.id,
        topic: "HTTP & Express.js",
        title: "Express JS Crash Course",
        youtubeUrl: "https://www.youtube.com/watch?v=L72fhGm1tfE",
        orderIndex: 4,
        estimatedMinutes: 35,
        difficulty: "INTERMEDIATE",
        description: "Quick hands-on Express.js tutorial covering routes, middleware, request/response, and serving JSON.",
      },
    }),
    prisma.resource.upsert({
      where: { youtubeUrl: "https://www.youtube.com/watch?v=ZYnp_SQm09A" },
      update: {},
      create: {
        trackId: nodejsTrack.id,
        topic: "Async Patterns & Databases",
        title: "Async JavaScript & Node.js - Callbacks, Promises, Async/Await",
        youtubeUrl: "https://www.youtube.com/watch?v=ZYnp_SQm09A",
        orderIndex: 5,
        estimatedMinutes: 40,
        difficulty: "BEGINNER",
        description: "Introduction to async patterns in Node.js: callbacks, promises, async/await, and error handling for beginners.",
      },
    }),
    prisma.resource.upsert({
      where: { youtubeUrl: "https://www.youtube.com/watch?v=4Oi5xpjoCRk" },
      update: {},
      create: {
        trackId: nodejsTrack.id,
        topic: "Async Patterns & Databases",
        title: "Node.js MongoDB Tutorial",
        youtubeUrl: "https://www.youtube.com/watch?v=4Oi5xpjoCRk",
        orderIndex: 6,
        estimatedMinutes: 45,
        difficulty: "INTERMEDIATE",
        description: "Integrate Node.js with MongoDB: Mongoose ODM, CRUD operations, schema design, and data validation.",
      },
    }),
    prisma.resource.upsert({
      where: { youtubeUrl: "https://www.youtube.com/watch?v=fgTGADljAeg" },
      update: {},
      create: {
        trackId: nodejsTrack.id,
        topic: "Node.js Fundamentals",
        title: "Node.js Advanced Concepts — Streams, Events, and the Event Loop",
        youtubeUrl: "https://www.youtube.com/watch?v=fgTGADljAeg",
        orderIndex: 7,
        estimatedMinutes: 35,
        difficulty: "INTERMEDIATE",
        description: "Deep dive into Node.js internals: streams, event emitters, the event loop phases, and non-blocking I/O patterns.",
      },
    }),
    prisma.resource.upsert({
      where: { youtubeUrl: "https://www.youtube.com/watch?v=7nafaH9SddU" },
      update: {},
      create: {
        trackId: nodejsTrack.id,
        topic: "HTTP & Express.js",
        title: "Express.js REST API — Error Handling and Middleware Patterns",
        youtubeUrl: "https://www.youtube.com/watch?v=7nafaH9SddU",
        orderIndex: 8,
        estimatedMinutes: 30,
        difficulty: "INTERMEDIATE",
        description: "Advanced Express.js patterns: global error handling middleware, validation middleware, async error wrappers, and API versioning.",
      },
    }),
  ]);

  console.log("✅ 8 YouTube resources upserted for Node.js track");

  // ─── SQL Resources ────────────────────────────────────────
  await Promise.all([
    prisma.resource.upsert({
      where: { youtubeUrl: "https://www.youtube.com/watch?v=HXV3zeQKqGY" },
      update: {},
      create: {
        trackId: sqlTrack.id,
        topic: "SQL Fundamentals",
        title: "SQL Tutorial - Full Database Course for Beginners",
        youtubeUrl: "https://www.youtube.com/watch?v=HXV3zeQKqGY",
        orderIndex: 1,
        estimatedMinutes: 60,
        difficulty: "BEGINNER",
        description: "Complete SQL beginner course: databases, tables, SELECT, INSERT, UPDATE, DELETE, and basic querying.",
      },
    }),
    prisma.resource.upsert({
      where: { youtubeUrl: "https://www.youtube.com/watch?v=7S_tz1z_5bA" },
      update: {},
      create: {
        trackId: sqlTrack.id,
        topic: "SQL Fundamentals",
        title: "MySQL Tutorial for Beginners",
        youtubeUrl: "https://www.youtube.com/watch?v=7S_tz1z_5bA",
        orderIndex: 2,
        estimatedMinutes: 50,
        difficulty: "BEGINNER",
        description: "MySQL fundamentals: creating databases, data types, constraints, SELECT with WHERE, ORDER BY, and LIMIT.",
      },
    }),
    prisma.resource.upsert({
      where: { youtubeUrl: "https://www.youtube.com/watch?v=9yeOJ0ZMUYw" },
      update: {},
      create: {
        trackId: sqlTrack.id,
        topic: "Joins & Aggregations",
        title: "SQL Joins Explained - Inner, Left, Right, Full",
        youtubeUrl: "https://www.youtube.com/watch?v=9yeOJ0ZMUYw",
        orderIndex: 3,
        estimatedMinutes: 25,
        difficulty: "BEGINNER",
        description: "Visual guide to SQL JOINs: INNER JOIN, LEFT JOIN, RIGHT JOIN, FULL OUTER JOIN with practical examples.",
      },
    }),
    prisma.resource.upsert({
      where: { youtubeUrl: "https://www.youtube.com/watch?v=2Fn0WAyZV0E" },
      update: {},
      create: {
        trackId: sqlTrack.id,
        topic: "Joins & Aggregations",
        title: "SQL GROUP BY and Aggregate Functions Tutorial",
        youtubeUrl: "https://www.youtube.com/watch?v=2Fn0WAyZV0E",
        orderIndex: 4,
        estimatedMinutes: 20,
        difficulty: "INTERMEDIATE",
        description: "Master GROUP BY, HAVING, COUNT, SUM, AVG, MIN, MAX with real-world SQL examples.",
      },
    }),
    prisma.resource.upsert({
      where: { youtubeUrl: "https://www.youtube.com/watch?v=m1KcNV-Zhmc" },
      update: {},
      create: {
        trackId: sqlTrack.id,
        topic: "Subqueries & Database Design",
        title: "SQL Subqueries and CTEs for Beginners",
        youtubeUrl: "https://www.youtube.com/watch?v=m1KcNV-Zhmc",
        orderIndex: 5,
        estimatedMinutes: 30,
        difficulty: "BEGINNER",
        description: "Introduction to subqueries and Common Table Expressions (CTEs): correlated and non-correlated subqueries with beginner-friendly examples.",
      },
    }),
    prisma.resource.upsert({
      where: { youtubeUrl: "https://www.youtube.com/watch?v=QpdhBUYk7Kk" },
      update: {},
      create: {
        trackId: sqlTrack.id,
        topic: "Subqueries & Database Design",
        title: "Database Design Course - Learn Normalization",
        youtubeUrl: "https://www.youtube.com/watch?v=QpdhBUYk7Kk",
        orderIndex: 6,
        estimatedMinutes: 50,
        difficulty: "INTERMEDIATE",
        description: "Database design fundamentals: ER diagrams, normalization (1NF, 2NF, 3NF), denormalization, and indexing.",
      },
    }),
    prisma.resource.upsert({
      where: { youtubeUrl: "https://www.youtube.com/watch?v=p3qvj9hO_Bo" },
      update: {},
      create: {
        trackId: sqlTrack.id,
        topic: "SQL Fundamentals",
        title: "SQL Window Functions and Advanced SELECT Queries",
        youtubeUrl: "https://www.youtube.com/watch?v=p3qvj9hO_Bo",
        orderIndex: 7,
        estimatedMinutes: 35,
        difficulty: "INTERMEDIATE",
        description: "Master ROW_NUMBER, RANK, DENSE_RANK, LEAD, LAG window functions and advanced SELECT techniques with practical examples.",
      },
    }),
    prisma.resource.upsert({
      where: { youtubeUrl: "https://www.youtube.com/watch?v=ztHopE5Wnpc" },
      update: {},
      create: {
        trackId: sqlTrack.id,
        topic: "Joins & Aggregations",
        title: "Advanced SQL JOINs, Aggregations and Query Optimization",
        youtubeUrl: "https://www.youtube.com/watch?v=ztHopE5Wnpc",
        orderIndex: 8,
        estimatedMinutes: 30,
        difficulty: "INTERMEDIATE",
        description: "Advanced JOIN patterns, complex aggregations, ROLLUP/CUBE, and SQL query optimization techniques including indexing and EXPLAIN plans.",
      },
    }),
  ]);

  console.log("✅ 8 YouTube resources upserted for SQL track");

  // ─── Node.js: Beginner MCQs (5) ──────────────────────────
  await Promise.all([
    prisma.question.upsert({
      where: { questionText: "What is Node.js built on?" },
      update: {},
      create: {
        trackId: nodejsTrack.id, topic: "Node.js Fundamentals", questionType: "MCQ",
        questionText: "What is Node.js built on?",
        options: JSON.stringify(["Python interpreter", "V8 JavaScript engine", "JVM", "Ruby runtime"]),
        correctOption: 1,
        explanation: "Node.js is built on Google's V8 JavaScript engine, which compiles JS to machine code for fast execution.",
        difficulty: "BEGINNER",
      },
    }),
    prisma.question.upsert({
      where: { questionText: "Which module is used to create an HTTP server in Node.js?" },
      update: {},
      create: {
        trackId: nodejsTrack.id, topic: "Node.js Fundamentals", questionType: "MCQ",
        questionText: "Which module is used to create an HTTP server in Node.js?",
        options: JSON.stringify(["fs", "http", "path", "os"]),
        correctOption: 1,
        explanation: "The built-in 'http' module provides functionality to create HTTP servers and make HTTP requests.",
        difficulty: "BEGINNER",
      },
    }),
    prisma.question.upsert({
      where: { questionText: "What does 'npm' stand for?" },
      update: {},
      create: {
        trackId: nodejsTrack.id, topic: "Node.js Fundamentals", questionType: "MCQ",
        questionText: "What does 'npm' stand for?",
        options: JSON.stringify(["Node Package Manager", "New Programming Method", "Node Process Monitor", "Network Protocol Manager"]),
        correctOption: 0,
        explanation: "npm stands for Node Package Manager. It's the default package manager for Node.js and the world's largest software registry.",
        difficulty: "BEGINNER",
      },
    }),
    prisma.question.upsert({
      where: { questionText: "What is the purpose of the 'require()' function in Node.js?" },
      update: {},
      create: {
        trackId: nodejsTrack.id, topic: "Node.js Fundamentals", questionType: "MCQ",
        questionText: "What is the purpose of the 'require()' function in Node.js?",
        options: JSON.stringify(["To install packages", "To import modules", "To create files", "To start a server"]),
        correctOption: 1,
        explanation: "require() is used to import modules (built-in, third-party, or local files) in Node.js using CommonJS module syntax.",
        difficulty: "BEGINNER",
      },
    }),
    prisma.question.upsert({
      where: { questionText: "What is Express.js in the context of Node.js?" },
      update: {},
      create: {
        trackId: nodejsTrack.id, topic: "HTTP & Express.js", questionType: "MCQ",
        questionText: "What is Express.js in the context of Node.js?",
        options: JSON.stringify(["A database", "A minimal web framework", "A testing library", "A template engine"]),
        correctOption: 1,
        explanation: "Express.js is a minimal and flexible Node.js web application framework that provides robust features for building web and mobile applications.",
        difficulty: "BEGINNER",
      },
    }),
  ]);

  // ─── Node.js: Intermediate MCQs (5) ──────────────────────
  await Promise.all([
    prisma.question.upsert({
      where: { questionText: "What is middleware in Express.js?" },
      update: {},
      create: {
        trackId: nodejsTrack.id, topic: "HTTP & Express.js", questionType: "MCQ",
        questionText: "What is middleware in Express.js?",
        options: JSON.stringify(["A database layer", "Functions that have access to req, res, and next", "A templating engine", "A type of router"]),
        correctOption: 1,
        explanation: "Middleware functions have access to the request object (req), response object (res), and the next() function. They can modify req/res or end the request-response cycle.",
        difficulty: "INTERMEDIATE",
      },
    }),
    prisma.question.upsert({
      where: { questionText: "What is the event loop in Node.js?" },
      update: {},
      create: {
        trackId: nodejsTrack.id, topic: "Async Patterns & Databases", questionType: "MCQ",
        questionText: "What is the event loop in Node.js?",
        options: JSON.stringify(["A for loop that runs events", "A mechanism that handles async operations by offloading them", "A CSS animation loop", "A recursive function"]),
        correctOption: 1,
        explanation: "The event loop is the mechanism that allows Node.js to perform non-blocking I/O operations by offloading operations to the system kernel whenever possible.",
        difficulty: "INTERMEDIATE",
      },
    }),
    prisma.question.upsert({
      where: { questionText: "Which HTTP status code indicates a resource was created successfully?" },
      update: {},
      create: {
        trackId: nodejsTrack.id, topic: "HTTP & Express.js", questionType: "MCQ",
        questionText: "Which HTTP status code indicates a resource was created successfully?",
        options: JSON.stringify(["200", "201", "301", "404"]),
        correctOption: 1,
        explanation: "HTTP 201 Created indicates that the request was successful and a new resource was created as a result.",
        difficulty: "INTERMEDIATE",
      },
    }),
    prisma.question.upsert({
      where: { questionText: "What is the purpose of process.env in Node.js?" },
      update: {},
      create: {
        trackId: nodejsTrack.id, topic: "Async Patterns & Databases", questionType: "MCQ",
        questionText: "What is the purpose of process.env in Node.js?",
        options: JSON.stringify(["To access CSS variables", "To access environment variables", "To modify the file system", "To create child processes"]),
        correctOption: 1,
        explanation: "process.env is an object containing the user environment variables. It's commonly used to store configuration values like database URLs and API keys.",
        difficulty: "INTERMEDIATE",
      },
    }),
    prisma.question.upsert({
      where: { questionText: "What does CORS stand for and why is it important in Node.js APIs?" },
      update: {},
      create: {
        trackId: nodejsTrack.id, topic: "HTTP & Express.js", questionType: "MCQ",
        questionText: "What does CORS stand for and why is it important in Node.js APIs?",
        options: JSON.stringify(["Cross-Origin Resource Sharing — controls which domains can access your API", "Create, Open, Read, Send — file operation protocol", "Client-Only Response System — browser caching", "Common Object Request Standard — HTTP protocol"]),
        correctOption: 0,
        explanation: "CORS (Cross-Origin Resource Sharing) is a security mechanism that restricts HTTP requests from different origins. Node.js APIs must configure CORS headers to allow frontend apps on different domains to access them.",
        difficulty: "INTERMEDIATE",
      },
    }),
  ]);

  // ─── Node.js: Beginner Coding (2) ────────────────────────
  await prisma.question.upsert({
    where: { questionText: "Create a simple HTTP server in Node.js" },
    update: {},
    create: {
      trackId: nodejsTrack.id, topic: "Node.js Fundamentals", questionType: "CODING",
      questionText: "Create a simple HTTP server in Node.js",
      codeDescription: "Create an HTTP server using Node.js built-in 'http' module that:\n1. Listens on port 3000\n2. Responds with 'Hello, World!' for GET requests to '/'\n3. Responds with 404 for any other route\n4. Sets the Content-Type header to 'text/plain'",
      sampleInput: "GET /",
      sampleOutput: "Hello, World!",
      constraints: "Use only the built-in 'http' module\nDo not use Express or any framework",
      hints: "Use http.createServer() to create the server. Check req.url to determine the route. Use res.writeHead() for status code and headers, and res.end() for the response body.",
      starterCode: JSON.stringify({
        javascript: `const http = require('http');\n\n// Create your server here\n`,
        python: `# Node.js is JavaScript-only\n# Write the JavaScript solution`,
        java: `// Node.js is JavaScript-only\n// Write the JavaScript solution`,
      }),
      expectedKeywords: "http,createServer,listen,writeHead,end,req,res,url,3000",
      difficulty: "BEGINNER",
    },
  });

  await prisma.question.upsert({
    where: { questionText: "Read and write files using Node.js fs module" },
    update: {},
    create: {
      trackId: nodejsTrack.id, topic: "Node.js Fundamentals", questionType: "CODING",
      questionText: "Read and write files using Node.js fs module",
      codeDescription: "Write a Node.js script that:\n1. Reads the contents of a file called 'input.txt'\n2. Converts the content to uppercase\n3. Writes the result to 'output.txt'\n4. Handles errors gracefully with try/catch",
      sampleInput: "input.txt contains: hello world",
      sampleOutput: "output.txt contains: HELLO WORLD",
      constraints: "Use the fs module with promises (fs.promises or async/await)\nHandle file-not-found errors",
      hints: "Use fs.readFileSync or fs.promises.readFile to read. Use .toString().toUpperCase() to convert. Use fs.writeFileSync or fs.promises.writeFile to write.",
      starterCode: JSON.stringify({
        javascript: `const fs = require('fs');\n\nasync function processFile() {\n  // Write your solution here\n}\n\nprocessFile();`,
        python: `# Node.js is JavaScript-only\n# Write the JavaScript solution`,
        java: `// Node.js is JavaScript-only\n// Write the JavaScript solution`,
      }),
      expectedKeywords: "fs,readFile,writeFile,toUpperCase,async,await,try,catch",
      difficulty: "BEGINNER",
    },
  });

  // ─── Node.js: Intermediate Coding (2) ────────────────────
  await prisma.question.upsert({
    where: { questionText: "Build an Express.js REST API with CRUD operations" },
    update: {},
    create: {
      trackId: nodejsTrack.id, topic: "HTTP & Express.js", questionType: "CODING",
      questionText: "Build an Express.js REST API with CRUD operations",
      codeDescription: "Create an Express.js API for managing a 'todos' collection:\n1. GET /todos — list all todos\n2. POST /todos — add a new todo (body: { title, completed })\n3. PUT /todos/:id — update a todo\n4. DELETE /todos/:id — delete a todo\nStore data in-memory using an array.",
      sampleInput: "POST /todos body: { title: 'Learn Node', completed: false }",
      sampleOutput: '{ id: 1, title: "Learn Node", completed: false }',
      constraints: "Use Express.js\nUse proper HTTP status codes (200, 201, 404)\nParse JSON body with express.json()",
      hints: "Use an array as your data store with a counter for IDs. Use express.json() middleware to parse request bodies. Return 404 when a todo is not found.",
      starterCode: JSON.stringify({
        javascript: `const express = require('express');\nconst app = express();\napp.use(express.json());\n\nlet todos = [];\nlet nextId = 1;\n\n// Add your routes here\n\napp.listen(3000);`,
        python: `# Express is JavaScript-only\n# Write the JavaScript solution`,
        java: `// Express is JavaScript-only\n// Write the JavaScript solution`,
      }),
      expectedKeywords: "express,get,post,put,delete,req,res,json,status,params,body",
      difficulty: "INTERMEDIATE",
    },
  });

  await prisma.question.upsert({
    where: { questionText: "Implement middleware for request logging and authentication" },
    update: {},
    create: {
      trackId: nodejsTrack.id, topic: "Async Patterns & Databases", questionType: "CODING",
      questionText: "Implement middleware for request logging and authentication",
      codeDescription: "Create two Express middleware functions:\n1. Logger middleware — logs method, URL, and timestamp for every request\n2. Auth middleware — checks for an 'x-api-key' header, returns 401 if missing/invalid\nApply logger globally and auth to protected routes only.",
      sampleInput: "GET /protected without x-api-key header",
      sampleOutput: '{ error: "Unauthorized" } with status 401',
      constraints: "Must use next() correctly\nLogger should not block requests\nAuth should validate against a hardcoded key",
      hints: "Middleware functions take (req, res, next). Call next() to pass to the next middleware. For auth, check req.headers['x-api-key']. Use app.use() for global middleware.",
      starterCode: JSON.stringify({
        javascript: `const express = require('express');\nconst app = express();\n\n// Logger middleware\nfunction logger(req, res, next) {\n  // Log request details\n}\n\n// Auth middleware\nfunction auth(req, res, next) {\n  // Check API key\n}\n\n// Apply middleware and create routes`,
        python: `# Express middleware is JavaScript-only\n# Write the JavaScript solution`,
        java: `// Express middleware is JavaScript-only\n// Write the JavaScript solution`,
      }),
      expectedKeywords: "middleware,next,req,res,headers,api-key,401,use,function,log",
      difficulty: "INTERMEDIATE",
    },
  });

  console.log("✅ Node.js questions seeded: 10 MCQs + 4 coding");

  // ─── SQL: Beginner MCQs (5) ───────────────────────────────
  await Promise.all([
    prisma.question.upsert({
      where: { questionText: "Which SQL command is used to retrieve data from a database?" },
      update: {},
      create: {
        trackId: sqlTrack.id, topic: "SQL Fundamentals", questionType: "MCQ",
        questionText: "Which SQL command is used to retrieve data from a database?",
        options: JSON.stringify(["INSERT", "SELECT", "UPDATE", "CREATE"]),
        correctOption: 1,
        explanation: "SELECT is the SQL command used to query and retrieve data from one or more database tables.",
        difficulty: "BEGINNER",
      },
    }),
    prisma.question.upsert({
      where: { questionText: "What does the WHERE clause do in a SQL query?" },
      update: {},
      create: {
        trackId: sqlTrack.id, topic: "SQL Fundamentals", questionType: "MCQ",
        questionText: "What does the WHERE clause do in a SQL query?",
        options: JSON.stringify(["Sorts the results", "Filters rows based on a condition", "Groups rows together", "Limits the number of results"]),
        correctOption: 1,
        explanation: "The WHERE clause filters rows based on a specified condition, returning only rows that match the criteria.",
        difficulty: "BEGINNER",
      },
    }),
    prisma.question.upsert({
      where: { questionText: "Which SQL keyword is used to sort query results?" },
      update: {},
      create: {
        trackId: sqlTrack.id, topic: "SQL Fundamentals", questionType: "MCQ",
        questionText: "Which SQL keyword is used to sort query results?",
        options: JSON.stringify(["SORT BY", "GROUP BY", "ORDER BY", "FILTER BY"]),
        correctOption: 2,
        explanation: "ORDER BY is used to sort query results in ascending (ASC) or descending (DESC) order based on one or more columns.",
        difficulty: "BEGINNER",
      },
    }),
    prisma.question.upsert({
      where: { questionText: "What is a PRIMARY KEY in SQL?" },
      update: {},
      create: {
        trackId: sqlTrack.id, topic: "SQL Fundamentals", questionType: "MCQ",
        questionText: "What is a PRIMARY KEY in SQL?",
        options: JSON.stringify(["A column that allows duplicates", "A unique identifier for each row in a table", "A foreign table reference", "An index type"]),
        correctOption: 1,
        explanation: "A PRIMARY KEY is a constraint that uniquely identifies each record in a table. It must contain unique, non-null values.",
        difficulty: "BEGINNER",
      },
    }),
    prisma.question.upsert({
      where: { questionText: "What is the difference between DELETE and TRUNCATE in SQL?" },
      update: {},
      create: {
        trackId: sqlTrack.id, topic: "SQL Fundamentals", questionType: "MCQ",
        questionText: "What is the difference between DELETE and TRUNCATE in SQL?",
        options: JSON.stringify(["No difference", "DELETE removes specific rows and can be rolled back; TRUNCATE removes all rows and is faster", "TRUNCATE is slower", "DELETE cannot have a WHERE clause"]),
        correctOption: 1,
        explanation: "DELETE removes rows one by one (can use WHERE, can be rolled back). TRUNCATE removes all rows at once, resets identity, and is faster but cannot be easily rolled back.",
        difficulty: "BEGINNER",
      },
    }),
  ]);

  // ─── SQL: Intermediate MCQs (5) ──────────────────────────
  await Promise.all([
    prisma.question.upsert({
      where: { questionText: "What type of JOIN returns all rows from both tables, matching where possible?" },
      update: {},
      create: {
        trackId: sqlTrack.id, topic: "Joins & Aggregations", questionType: "MCQ",
        questionText: "What type of JOIN returns all rows from both tables, matching where possible?",
        options: JSON.stringify(["INNER JOIN", "LEFT JOIN", "FULL OUTER JOIN", "CROSS JOIN"]),
        correctOption: 2,
        explanation: "FULL OUTER JOIN returns all rows from both tables, with NULL values where there is no match on either side.",
        difficulty: "INTERMEDIATE",
      },
    }),
    prisma.question.upsert({
      where: { questionText: "What is the difference between WHERE and HAVING in SQL?" },
      update: {},
      create: {
        trackId: sqlTrack.id, topic: "Joins & Aggregations", questionType: "MCQ",
        questionText: "What is the difference between WHERE and HAVING in SQL?",
        options: JSON.stringify(["No difference", "WHERE filters before grouping; HAVING filters after grouping", "HAVING filters before grouping", "WHERE can only be used with JOINs"]),
        correctOption: 1,
        explanation: "WHERE filters individual rows before GROUP BY is applied. HAVING filters groups after GROUP BY, and can use aggregate functions.",
        difficulty: "INTERMEDIATE",
      },
    }),
    prisma.question.upsert({
      where: { questionText: "What is a SQL subquery?" },
      update: {},
      create: {
        trackId: sqlTrack.id, topic: "Subqueries & Database Design", questionType: "MCQ",
        questionText: "What is a SQL subquery?",
        options: JSON.stringify(["A query that runs in parallel", "A query nested inside another query", "A stored procedure", "A database trigger"]),
        correctOption: 1,
        explanation: "A subquery is a query nested inside another SQL query (in SELECT, FROM, or WHERE clauses). It executes first and its result is used by the outer query.",
        difficulty: "INTERMEDIATE",
      },
    }),
    prisma.question.upsert({
      where: { questionText: "What is database normalization?" },
      update: {},
      create: {
        trackId: sqlTrack.id, topic: "Subqueries & Database Design", questionType: "MCQ",
        questionText: "What is database normalization?",
        options: JSON.stringify(["Making the database faster", "Organizing data to reduce redundancy and dependency", "Adding more indexes", "Removing all constraints"]),
        correctOption: 1,
        explanation: "Normalization is the process of organizing database tables to minimize data redundancy and dependency by dividing data into related tables and defining relationships.",
        difficulty: "INTERMEDIATE",
      },
    }),
    prisma.question.upsert({
      where: { questionText: "What is a Common Table Expression (CTE) in SQL?" },
      update: {},
      create: {
        trackId: sqlTrack.id, topic: "Subqueries & Database Design", questionType: "MCQ",
        questionText: "What is a Common Table Expression (CTE) in SQL?",
        options: JSON.stringify(["A permanent table", "A temporary named result set defined with WITH clause", "A stored procedure", "A database view"]),
        correctOption: 1,
        explanation: "A CTE is a temporary named result set defined using the WITH clause. It exists only during the execution of the query and improves readability of complex queries.",
        difficulty: "INTERMEDIATE",
      },
    }),
  ]);

  // ─── SQL: Beginner Coding (2) ─────────────────────────────
  await prisma.question.upsert({
    where: { questionText: "Write a SQL query to find the top 5 highest-paid employees" },
    update: {},
    create: {
      trackId: sqlTrack.id, topic: "SQL Fundamentals", questionType: "CODING",
      questionText: "Write a SQL query to find the top 5 highest-paid employees",
      codeDescription: "Given an 'employees' table with columns: id, name, department, salary\nWrite a SQL query that:\n1. Selects name, department, and salary\n2. Orders by salary in descending order\n3. Returns only the top 5 results",
      sampleInput: "employees table with 20 rows",
      sampleOutput: "5 rows with highest salaries, sorted descending",
      constraints: "Use only standard SQL\nDo not use vendor-specific syntax",
      hints: "Use SELECT with ORDER BY salary DESC and LIMIT 5.",
      starterCode: JSON.stringify({
        javascript: `-- Write your SQL query here\nSELECT`,
        python: `-- Write your SQL query here\nSELECT`,
        java: `-- Write your SQL query here\nSELECT`,
      }),
      expectedKeywords: "SELECT,FROM,ORDER,BY,DESC,LIMIT,salary,name,department",
      difficulty: "BEGINNER",
    },
  });

  await prisma.question.upsert({
    where: { questionText: "Write SQL to create a table and insert records" },
    update: {},
    create: {
      trackId: sqlTrack.id, topic: "SQL Fundamentals", questionType: "CODING",
      questionText: "Write SQL to create a table and insert records",
      codeDescription: "Write SQL statements to:\n1. Create a 'products' table with: id (INT, PRIMARY KEY, AUTO_INCREMENT), name (VARCHAR(100), NOT NULL), price (DECIMAL(10,2)), category (VARCHAR(50))\n2. Insert 3 sample products\n3. Write a SELECT to show all products ordered by price",
      sampleInput: "No input — DDL + DML",
      sampleOutput: "Table created, 3 rows inserted, results sorted by price",
      constraints: "Use standard SQL syntax\nInclude proper constraints",
      hints: "Use CREATE TABLE with column definitions. Use INSERT INTO for adding rows. End with SELECT * FROM products ORDER BY price.",
      starterCode: JSON.stringify({
        javascript: `-- Create table\nCREATE TABLE products (\n  -- Define columns\n);\n\n-- Insert records\n\n-- Select all`,
        python: `-- Create table\nCREATE TABLE products (\n  -- Define columns\n);\n\n-- Insert records\n\n-- Select all`,
        java: `-- Create table\nCREATE TABLE products (\n  -- Define columns\n);\n\n-- Insert records\n\n-- Select all`,
      }),
      expectedKeywords: "CREATE,TABLE,PRIMARY,KEY,INSERT,INTO,VALUES,SELECT,ORDER,BY",
      difficulty: "BEGINNER",
    },
  });

  // ─── SQL: Intermediate Coding (2) ─────────────────────────
  await prisma.question.upsert({
    where: { questionText: "Write a SQL query using JOINs to get employee department details" },
    update: {},
    create: {
      trackId: sqlTrack.id, topic: "Joins & Aggregations", questionType: "CODING",
      questionText: "Write a SQL query using JOINs to get employee department details",
      codeDescription: "Given two tables:\n- employees (id, name, department_id, salary)\n- departments (id, department_name, location)\n\nWrite queries to:\n1. List all employees with their department names (INNER JOIN)\n2. Find departments with no employees (LEFT JOIN)\n3. Find the average salary per department, only showing departments with avg salary > 50000",
      sampleInput: "employees and departments tables",
      sampleOutput: "Joined results, empty departments, filtered averages",
      constraints: "Use proper JOIN syntax\nUse GROUP BY and HAVING for aggregation",
      hints: "For #1: JOIN employees e ON e.department_id = d.id. For #2: LEFT JOIN and WHERE e.id IS NULL. For #3: GROUP BY with HAVING AVG(salary) > 50000.",
      starterCode: JSON.stringify({
        javascript: `-- Query 1: Employees with department names\nSELECT\n\n-- Query 2: Departments with no employees\nSELECT\n\n-- Query 3: Average salary per department (>50000)\nSELECT`,
        python: `-- Query 1: Employees with department names\nSELECT\n\n-- Query 2: Departments with no employees\nSELECT\n\n-- Query 3: Average salary per department (>50000)\nSELECT`,
        java: `-- Query 1: Employees with department names\nSELECT\n\n-- Query 2: Departments with no employees\nSELECT\n\n-- Query 3: Average salary per department (>50000)\nSELECT`,
      }),
      expectedKeywords: "JOIN,ON,LEFT,INNER,GROUP,BY,HAVING,AVG,WHERE,IS,NULL",
      difficulty: "INTERMEDIATE",
    },
  });

  await prisma.question.upsert({
    where: { questionText: "Write a SQL query using subqueries and CTEs" },
    update: {},
    create: {
      trackId: sqlTrack.id, topic: "Subqueries & Database Design", questionType: "CODING",
      questionText: "Write a SQL query using subqueries and CTEs",
      codeDescription: "Given an 'orders' table (id, customer_id, amount, order_date) and 'customers' table (id, name, city):\n\n1. Use a subquery to find customers who placed orders above the average order amount\n2. Use a CTE to calculate each customer's total spending and rank them",
      sampleInput: "orders and customers tables",
      sampleOutput: "Customers with above-average orders; ranked customer spending",
      constraints: "Use WITH clause for CTE\nUse proper subquery in WHERE clause",
      hints: "For subquery: WHERE amount > (SELECT AVG(amount) FROM orders). For CTE: WITH totals AS (SELECT customer_id, SUM(amount) as total FROM orders GROUP BY customer_id) then join with customers.",
      starterCode: JSON.stringify({
        javascript: `-- Query 1: Customers with above-average orders (subquery)\nSELECT\n\n-- Query 2: Customer spending ranked (CTE)\nWITH totals AS (\n  -- Calculate totals\n)\nSELECT`,
        python: `-- Query 1: Customers with above-average orders (subquery)\nSELECT\n\n-- Query 2: Customer spending ranked (CTE)\nWITH totals AS (\n  -- Calculate totals\n)\nSELECT`,
        java: `-- Query 1: Customers with above-average orders (subquery)\nSELECT\n\n-- Query 2: Customer spending ranked (CTE)\nWITH totals AS (\n  -- Calculate totals\n)\nSELECT`,
      }),
      expectedKeywords: "WITH,AS,SELECT,AVG,SUM,GROUP,BY,JOIN,WHERE,subquery,CTE",
      difficulty: "INTERMEDIATE",
    },
  });

  console.log("✅ SQL questions seeded: 10 MCQs + 4 coding");

  // ═══════════════════════════════════════════════════════
  // ─── 7. Demo Student Profile & Learning Plan ──────────
  // ═══════════════════════════════════════════════════════

  const studentProfile = await prisma.studentProfile.upsert({
    where: { userId: demoStudent.id },
    update: {
      domain: "dsa",
      currentLevel: "BEGINNER",
      weeklyHours: 7,
      targetWeeks: 4,
      learningStyle: "balanced",
      currentStreak: 3,
      longestStreak: 5,
      totalMinutes: 95,
      onboardingDone: true,
      lastActiveDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      learningGoal: "Crack technical interviews at FAANG companies",
      preferredDifficulty: "BEGINNER",
      preferredSubjects: JSON.stringify(["dsa", "python"]),
    },
    create: {
      userId: demoStudent.id,
      domain: "dsa",
      currentLevel: "BEGINNER",
      weeklyHours: 7,
      targetWeeks: 4,
      learningStyle: "balanced",
      currentStreak: 3,
      longestStreak: 5,
      totalMinutes: 95,
      onboardingDone: true,
      lastActiveDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      learningGoal: "Crack technical interviews at FAANG companies",
      preferredDifficulty: "BEGINNER",
      preferredSubjects: JSON.stringify(["dsa", "python"]),
    },
  });

  // Create Learning Plan
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 21);

  const learningPlan = await prisma.learningPlan.upsert({
    where: { studentProfileId: studentProfile.id },
    update: {
      goal: "Master Data Structures & Algorithms",
      targetDuration: 4,
      overallProgress: 12,
      plannedMinutes: 420,
      completedMinutes: 95,
      startDate,
      endDate,
    },
    create: {
      studentProfileId: studentProfile.id,
      trackId: dsaTrack.id,
      goal: "Master Data Structures & Algorithms",
      targetDuration: 4,
      overallProgress: 12,
      plannedMinutes: 420,
      completedMinutes: 95,
      startDate,
      endDate,
    },
  });

  // ─── 8. Milestones and Tasks ──────────────────────────
  // Delete existing milestones (cascades to tasks) before re-creating
  await prisma.milestone.deleteMany({ where: { learningPlanId: learningPlan.id } });

  const week1 = await prisma.milestone.create({
    data: {
      learningPlanId: learningPlan.id,
      title: "Week 1: Arrays Basics",
      weekNumber: 1,
      description: "Master array fundamentals through curated videos, coding practice, and assessments.",
      isCompleted: false,
      dueDate: new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  const week2 = await prisma.milestone.create({
    data: {
      learningPlanId: learningPlan.id,
      title: "Week 2: Searching & Sorting",
      weekNumber: 2,
      description: "Learn fundamental searching and sorting algorithms.",
      isCompleted: false,
      dueDate: new Date(startDate.getTime() + 14 * 24 * 60 * 60 * 1000),
    },
  });

  const week3 = await prisma.milestone.create({
    data: {
      learningPlanId: learningPlan.id,
      title: "Week 3: Two Pointers & Sliding Window",
      weekNumber: 3,
      description: "Master the two-pointer and sliding window techniques.",
      isCompleted: false,
      dueDate: new Date(startDate.getTime() + 21 * 24 * 60 * 60 * 1000),
    },
  });

  const week4 = await prisma.milestone.create({
    data: {
      learningPlanId: learningPlan.id,
      title: "Week 4: Stacks & Queues",
      weekNumber: 4,
      description: "Understand stacks, queues, and their applications.",
      isCompleted: false,
      dueDate: endDate,
    },
  });

  // Week 1 Tasks
  await prisma.learningTask.create({
    data: {
      milestoneId: week1.id,
      resourceId: resources[0].id,
      title: "Watch: Introduction to Arrays",
      topic: "Arrays Basics",
      taskType: "VIDEO",
      status: "COMPLETED",
      estimatedMinutes: 20,
      actualMinutes: 22,
      dueDate: new Date(startDate.getTime() + 1 * 24 * 60 * 60 * 1000),
      orderIndex: 0,
      description: "Learn array fundamentals, declaration, and initialization.",
    },
  });

  await prisma.learningTask.create({
    data: {
      milestoneId: week1.id,
      resourceId: resources[1].id,
      title: "Watch: Array Operations & Traversal",
      topic: "Arrays Basics",
      taskType: "VIDEO",
      status: "COMPLETED",
      estimatedMinutes: 25,
      actualMinutes: 28,
      dueDate: new Date(startDate.getTime() + 2 * 24 * 60 * 60 * 1000),
      orderIndex: 1,
      description: "Understanding array traversal, insertion, and deletion.",
    },
  });

  await prisma.learningTask.create({
    data: {
      milestoneId: week1.id,
      title: "Practice: Array Traversal Problems",
      topic: "Arrays Basics",
      taskType: "CODING",
      status: "NOT_STARTED",
      estimatedMinutes: 30,
      dueDate: new Date(startDate.getTime() + 3 * 24 * 60 * 60 * 1000),
      orderIndex: 2,
      description: "Solve basic array traversal and manipulation problems.",
    },
  });

  await prisma.learningTask.create({
    data: {
      milestoneId: week1.id,
      title: "Quiz: Arrays Fundamentals",
      topic: "Arrays Basics",
      taskType: "QUIZ",
      status: "NOT_STARTED",
      estimatedMinutes: 15,
      dueDate: new Date(startDate.getTime() + 5 * 24 * 60 * 60 * 1000),
      orderIndex: 3,
      description: "Test your understanding of array concepts.",
    },
  });

  // Week 2 Tasks
  await prisma.learningTask.create({
    data: {
      milestoneId: week2.id, resourceId: resources[2].id,
      title: "Watch: Binary Search Algorithm", topic: "Searching & Sorting",
      taskType: "VIDEO", status: "NOT_STARTED", estimatedMinutes: 22,
      dueDate: new Date(startDate.getTime() + 8 * 24 * 60 * 60 * 1000), orderIndex: 0,
    },
  });

  await prisma.learningTask.create({
    data: {
      milestoneId: week2.id, resourceId: resources[3].id,
      title: "Watch: Sorting Algorithms Explained", topic: "Searching & Sorting",
      taskType: "VIDEO", status: "NOT_STARTED", estimatedMinutes: 30,
      dueDate: new Date(startDate.getTime() + 9 * 24 * 60 * 60 * 1000), orderIndex: 1,
    },
  });

  await prisma.learningTask.create({
    data: {
      milestoneId: week2.id,
      title: "Practice: Search & Sort Problems", topic: "Searching & Sorting",
      taskType: "CODING", status: "NOT_STARTED", estimatedMinutes: 35,
      dueDate: new Date(startDate.getTime() + 11 * 24 * 60 * 60 * 1000), orderIndex: 2,
    },
  });

  // Week 3 Tasks
  await prisma.learningTask.create({
    data: {
      milestoneId: week3.id, resourceId: resources[4].id,
      title: "Watch: Two Pointer Technique", topic: "Two Pointers & Sliding Window",
      taskType: "VIDEO", status: "NOT_STARTED", estimatedMinutes: 20,
      dueDate: new Date(startDate.getTime() + 15 * 24 * 60 * 60 * 1000), orderIndex: 0,
    },
  });

  await prisma.learningTask.create({
    data: {
      milestoneId: week3.id, resourceId: resources[5].id,
      title: "Watch: Sliding Window Pattern", topic: "Two Pointers & Sliding Window",
      taskType: "VIDEO", status: "NOT_STARTED", estimatedMinutes: 25,
      dueDate: new Date(startDate.getTime() + 16 * 24 * 60 * 60 * 1000), orderIndex: 1,
    },
  });

  // Week 4 Tasks
  await prisma.learningTask.create({
    data: {
      milestoneId: week4.id,
      resourceId: resources[6].id,
      title: "Watch: Stack Data Structure", topic: "Stacks & Queues",
      taskType: "VIDEO", status: "NOT_STARTED", estimatedMinutes: 20,
      dueDate: new Date(startDate.getTime() + 22 * 24 * 60 * 60 * 1000), orderIndex: 0,
    },
  });

  await prisma.learningTask.create({
    data: {
      milestoneId: week4.id,
      resourceId: resources[7].id,
      title: "Watch: Queue Data Structure", topic: "Stacks & Queues",
      taskType: "VIDEO", status: "NOT_STARTED", estimatedMinutes: 20,
      dueDate: new Date(startDate.getTime() + 23 * 24 * 60 * 60 * 1000), orderIndex: 1,
    },
  });

  console.log("✅ Milestones and tasks created with 2 completed tasks");

  // Delete existing quiz attempts for demo student before re-creating
  await prisma.quizAttempt.deleteMany({ where: { studentProfileId: studentProfile.id } });

  await prisma.quizAttempt.create({
    data: { studentProfileId: studentProfile.id, questionId: dsaBeginnerMcqs[0].id, selectedOption: 1, isCorrect: true, score: 100, feedback: "Correct! Well done." },
  });
  await prisma.quizAttempt.create({
    data: { studentProfileId: studentProfile.id, questionId: dsaBeginnerMcqs[1].id, selectedOption: 0, isCorrect: false, score: 0, feedback: "Incorrect. Search by value is O(n) in an unsorted array." },
  });
  await prisma.quizAttempt.create({
    data: { studentProfileId: studentProfile.id, questionId: dsaBeginnerMcqs[2].id, selectedOption: 0, isCorrect: false, score: 0, feedback: "Incorrect. JavaScript returns undefined for out-of-bounds access." },
  });
  await prisma.quizAttempt.create({
    data: { studentProfileId: studentProfile.id, questionId: dsaBeginnerMcqs[3].id, selectedOption: 2, isCorrect: true, score: 100, feedback: "Correct!" },
  });
  await prisma.quizAttempt.create({
    data: { studentProfileId: studentProfile.id, questionId: dsaBeginnerMcqs[4].id, selectedOption: 0, isCorrect: false, score: 0, feedback: "Incorrect. You need n-1 comparisons to find the maximum." },
  });

  console.log("✅ Quiz attempts seeded: 2/5 correct = 40% (triggers MASTERY_GAP)");

  // ─── 10. Agent Insight ────────────────────────────────
  // Delete existing agent insights for demo student before re-creating
  await prisma.agentInsight.deleteMany({ where: { studentProfileId: studentProfile.id } });

  await prisma.agentInsight.create({
    data: {
      studentProfileId: studentProfile.id,
      riskType: "MASTERY_GAP",
      priority: 1,
      signal: "Quiz score: 40% (below 60% threshold)",
      explanation: "Your Arrays quiz score was 40%, so PathForge AI added a 20-minute revision video and a guided 'find maximum' coding task before moving you to two-pointer problems.",
      recommendedChanges: JSON.stringify([
        { type: "ADD_TASK", description: "Add a 20-minute revision video on weak topics", taskData: { title: "Revision: Array Concepts Review", topic: "Arrays Basics", taskType: "REVISION", estimatedMinutes: 20, description: "Review array access patterns, search complexity, and boundary handling." } },
        { type: "ADD_TASK", description: "Add a guided coding practice task", taskData: { title: "Guided Practice: Find Maximum Element", topic: "Arrays Basics", taskType: "CODING", estimatedMinutes: 25, description: "Work through the 'find maximum element' problem with step-by-step hints." } },
        { type: "POSTPONE_TASK", description: "Postpone next advanced task by 2 days", postponeDays: 2 },
      ]),
      status: "PENDING",
    },
  });

  console.log("✅ Pending Agent Insight created: MASTERY_GAP (40% quiz score)");

  // ─── 11. Notifications ────────────────────────────────
  // Delete existing notifications for demo student before re-creating
  await prisma.notification.deleteMany({ where: { studentProfileId: studentProfile.id } });

  await prisma.notification.createMany({
    data: [
      { studentProfileId: studentProfile.id, title: "Welcome to PathForge AI! 🚀", message: "Your personalized DSA learning path is ready! You have 4 weeks of curated content ahead.", type: "success", actionUrl: "/student/plan", isRead: true },
      { studentProfileId: studentProfile.id, title: "📚 PathForge AI: Concept Reinforcement Needed", message: "Your Arrays quiz score was 40%. Check the Agent Insight on your dashboard.", type: "warning", actionUrl: "/student/dashboard", isRead: false },
      { studentProfileId: studentProfile.id, title: "⏰ Inactivity Alert", message: "You have not practiced Arrays for 4 days. Start with a 15-minute recap.", type: "warning", actionUrl: "/student/dashboard", isRead: false },
      { studentProfileId: studentProfile.id, title: "🔥 Streak Update", message: "Your current streak is 3 days! Keep it up by completing a task today.", type: "info", actionUrl: "/student/plan", isRead: true },
    ],
  });

  console.log("✅ Smart notifications created");

  // ─── 12. Activity Logs ────────────────────────────────
  const logBase = new Date();
  logBase.setDate(logBase.getDate() - 5);

  // Delete existing activity logs for demo student before re-creating
  await prisma.activityLog.deleteMany({ where: { studentProfileId: studentProfile.id } });

  await prisma.activityLog.createMany({
    data: [
      { studentProfileId: studentProfile.id, action: "ONBOARDING_COMPLETE", details: "Started DSA track, BEGINNER level, 7 hrs/week for 4 weeks", minutesSpent: 0, createdAt: new Date(logBase.getTime()) },
      { studentProfileId: studentProfile.id, action: "TASK_COMPLETED", details: "Watched: Introduction to Arrays (22 min)", minutesSpent: 22, createdAt: new Date(logBase.getTime() + 1 * 24 * 60 * 60 * 1000) },
      { studentProfileId: studentProfile.id, action: "TASK_COMPLETED", details: "Watched: Array Operations & Traversal (28 min)", minutesSpent: 28, createdAt: new Date(logBase.getTime() + 2 * 24 * 60 * 60 * 1000) },
      { studentProfileId: studentProfile.id, action: "QUIZ_COMPLETED", details: "Quiz on Arrays Basics: 40% (2/5 correct)", minutesSpent: 15, createdAt: new Date(logBase.getTime() + 3 * 24 * 60 * 60 * 1000) },
      { studentProfileId: studentProfile.id, action: "CODING_SUBMITTED", details: "Coding challenge: Arrays Basics - Failed (45%)", minutesSpent: 30, createdAt: new Date(logBase.getTime() + 3 * 24 * 60 * 60 * 1000) },
    ],
  });

  console.log("✅ Activity history created");

  // ─── Done ──────────────────────────────────────────────
  console.log("\n🎉 Seed complete!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  Admin:     admin@pathforge.ai / Vishalm_16");
  console.log("  Demo:      demo.student@pathforge.ai (seeded)");
  console.log("  Tracks:    DSA, Python, JavaScript, React, Java, Node.js, SQL");
  console.log("  Questions: 70 MCQs + 28 Coding = 98 total");
  console.log("  Agent:     Pending MASTERY_GAP insight (40% quiz)");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
