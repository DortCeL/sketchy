import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

function extractJson(text: string) {
  if (!text) throw new Error("Empty model response");

  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");

  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error("No JSON object found in model response");
  }

  return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
}

export async function POST(request: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return Response.json(
        { error: "Missing GEMINI_API_KEY in .env" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const text = body?.text;

    if (!text || typeof text !== "string") {
      return Response.json({ error: "Missing 'text' string." }, { status: 400 });
    }

    const instruction = `
You check job postings for scam / sketchy signals.

Return ONLY valid JSON. No markdown. No code fences. No extra text.

Schema (exact keys):
{
  "sketchy": boolean,
  "confidence": "low" | "medium" | "high",
  "summary": string,
  "redFlags": string[]
}

Rules:
- "sketchy" is true if the posting looks like a scam, MLM, unpaid "internship" bait, identity-theft lure, fake remote job, or otherwise unsafe/misleading.
- "confidence" is how sure you are.
- "summary" is 1–2 short sentences explaining the verdict.
- "redFlags" lists specific issues found (empty array if none). Max 5 items, each one short phrase.
- Be practical. Normal jobs should get sketchy: false.
- Judge only from the given text. Do not invent company facts.
`.trim();

    const result = await model.generateContent({
      contents: [
        { role: "user", parts: [{ text: instruction }] },
        { role: "user", parts: [{ text: `Job description:\n${text}` }] },
      ],
    });

    const rawText = result.response.text();
    const json = extractJson(rawText);

    return Response.json(json);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
