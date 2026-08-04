import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

export function isGeminiEnabled(): boolean {
  return Boolean(apiKey && apiKey.trim().length > 0);
}

let genAI: GoogleGenerativeAI | null = null;

function getGenAI(): GoogleGenerativeAI | null {
  if (!isGeminiEnabled()) return null;
  if (!genAI) {
    genAI = new GoogleGenerativeAI(apiKey!);
  }
  return genAI;
}

export async function generateWithGemini(prompt: string): Promise<string | null> {
  const ai = getGenAI();
  if (!ai) return null;

  try {
    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini API error:", error);
    return null;
  }
}

export async function enhanceExplanation(
  baseExplanation: string,
  context: { riskType: string; signal: string }
): Promise<string> {
  const prompt = `You are PathForge AI, a friendly coding learning assistant. Rewrite this learning insight explanation to be more encouraging and actionable for a student. Keep it under 2 sentences.

Context: Risk type is ${context.riskType}, signal is "${context.signal}".
Original: "${baseExplanation}"

Respond with only the improved explanation text, nothing else.`;

  const enhanced = await generateWithGemini(prompt);
  return enhanced || baseExplanation;
}

export async function generatePlanSummary(
  domain: string,
  level: string,
  weeks: number,
  hoursPerWeek: number
): Promise<string> {
  const prompt = `Generate a one-paragraph motivational learning plan summary for a ${level} student learning ${domain} over ${weeks} weeks with ${hoursPerWeek} hours per week. Focus on coding mastery. Keep it under 50 words. Respond with only the summary text.`;

  const summary = await generateWithGemini(prompt);
  return (
    summary ||
    `Your personalized ${domain} learning path is ready! Over ${weeks} weeks, you'll build strong foundations and practical coding skills with curated resources and hands-on challenges.`
  );
}
