/**
 * PathForge AI — Centralized constants.
 * Reuse these everywhere instead of magic strings.
 */

export const DOMAINS = [
  { value: "dsa", label: "DSA", desc: "Data Structures & Algorithms", icon: "🧮" },
  { value: "python", label: "Python", desc: "Python Programming", icon: "🐍" },
  { value: "javascript", label: "JavaScript", desc: "JavaScript Development", icon: "⚡" },
  { value: "react", label: "React", desc: "React.js Development", icon: "⚛️" },
  { value: "java", label: "Java", desc: "Java Programming", icon: "☕" },
  { value: "nodejs", label: "Node.js", desc: "Node.js Backend Development", icon: "🟢" },
  { value: "sql", label: "SQL", desc: "SQL & Database Management", icon: "🗄️" },
] as const;

export const DOMAIN_SLUGS = DOMAINS.map((d) => d.value);

export const DOMAIN_DISPLAY_NAMES: Record<string, string> = {
  dsa: "Data Structures & Algorithms",
  python: "Python Programming",
  javascript: "JavaScript Development",
  react: "React.js Development",
  java: "Java Programming",
  nodejs: "Node.js Backend Development",
  sql: "SQL & Database Management",
};

export const DIFFICULTY_LEVELS = ["BEGINNER", "INTERMEDIATE"] as const;

export const LEARNING_STYLES = [
  { value: "video-first", label: "Video-First", desc: "Learn by watching", icon: "🎬" },
  { value: "practice-first", label: "Practice-First", desc: "Learn by doing", icon: "💻" },
  { value: "balanced", label: "Balanced", desc: "Mix of both", icon: "⚖️" },
] as const;

export const QUESTION_TYPES = ["MCQ", "CODING"] as const;

export const QUIZ_QUESTIONS_PER_SESSION = 5;

/** Hours since last activity after which a student is considered inactive */
export const INACTIVE_THRESHOLD_DAYS = 3;

/** Minimum quiz questions at a difficulty before fallback kicks in */
export const MIN_QUESTIONS_BEFORE_FALLBACK = 3;
