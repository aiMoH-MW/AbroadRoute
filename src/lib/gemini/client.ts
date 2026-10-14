import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";

export const genAI = new GoogleGenerativeAI(apiKey);

export const GEMINI_CHAT_MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";
export const GEMINI_EMBED_MODEL =
  process.env.GEMINI_EMBEDDING_MODEL || "gemini-embedding-001";

/**
 * Get configured Gemini Generative Model instance
 */
export function getGeminiModel(
  modelName: string = GEMINI_CHAT_MODEL,
  systemInstruction?: string,
) {
  return genAI.getGenerativeModel({
    model: modelName,
    systemInstruction:
      systemInstruction ||
      "You are the ✦ Route AI Counsellor, an authoritative, warm, and zero-bias study abroad advisor by AbroadRoute (a brand by Dnyanal Educon Pvt. Ltd.) for Indian students and families.",
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 1500,
    },
  });
}

/**
 * Convert user message or text content into a vector embedding using Google Gemini
 * Model: gemini-embedding-001 (returns 3072-dimensional or float vector array)
 */
export async function generateEmbedding(
  text: string,
  modelName: string = GEMINI_EMBED_MODEL,
): Promise<number[]> {
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    console.error("Gemini Vector Embedding Error:", error);
    throw error;
  }
}
