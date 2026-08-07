/**
 * Freebuff AI client — replaces the previous Google Gemini API key usage.
 *
 * The app's AI features (explanation enhancement, plan summary) now call the
 * Freebuff AI API using `FREEBUFF_API_KEY`. The endpoint is OpenAI-compatible
 * (chat completions) and fully configurable:
 *   - FREEBUFF_API_KEY  (required for AI features)
 *   - FREEBUFF_API_URL  (optional, defaults to the Freebuff chat endpoint)
 *   - FREEBUFF_MODEL    (optional, defaults to "freebuff-chat")
 *
 * Every failure falls back to the deterministic templates in
 * `lib/agent/explanations.ts` / `plan-generator.ts`, so the app keeps working
 * even when the key is missing or the API is unreachable.
 *
 * Google OAuth is intentionally NOT used here — it remains an authentication
 * provider only (see lib/auth.ts).
 */

const apiKey = process.env.FREEBUFF_API_KEY;
const apiUrl =
  process.env.FREEBUFF_API_URL || "https://api.freebuff.com/v1/chat/completions";
const model = process.env.FREEBUFF_MODEL || "freebuff-chat";

export function isAiEnabled(): boolean {
  return Boolean(apiKey && apiKey.trim().length > 0);
}

async function complete(
  prompt: string,
  system?: string
): Promise<string | null> {
  if (!isAiEnabled()) return null;

  try {
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          ...(system ? [{ role: "system", content: system }] : []),
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("Freebuff API error:", res.status, body.slice(0, 500));
      return null;
    }

    const data = await res.json();
    return data?.choices?.[0]?.message?.content ?? null;
  } catch (error) {
    console.error("Freebuff API error:", error);
    return null;
  }
}

/** Low-level helper — kept for parity with the previous `generateWithGemini`. */
export async function generateWithAi(prompt: string): Promise<string | null> {
  return complete(prompt);
}

export async function enhanceExplanation(
  baseExplanation: string,
  context: { riskType: string; signal: string }
): Promise<string> {
  const prompt = `You are PathForge AI, a friendly coding learning assistant. Rewrite this learning insight explanation to be more encouraging and actionable for a student. Keep it under 2 sentences.

Context: Risk type is ${context.riskType}, signal is "${context.signal}".
Original: "${baseExplanation}"

Respond with only the improved explanation text, nothing else.`;

  const enhanced = await complete(prompt);
  return enhanced || baseExplanation;
}

export async function generatePlanSummary(
  domain: string,
  level: string,
  weeks: number,
  hoursPerWeek: number
): Promise<string> {
  const prompt = `Generate a one-paragraph motivational learning plan summary for a ${level} student learning ${domain} over ${weeks} weeks with ${hoursPerWeek} hours per week. Focus on coding mastery. Keep it under 50 words. Respond with only the summary text.`;

  const summary = await complete(prompt);
  return (
    summary ||
    `Your personalized ${domain} learning path is ready! Over ${weeks} weeks, you'll build strong foundations and practical coding skills with curated resources and hands-on challenges.`
  );
}
