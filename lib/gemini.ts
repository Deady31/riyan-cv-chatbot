import { GoogleGenerativeAI } from "@google/generative-ai";

const EMBEDDING_MODEL = "gemini-embedding-001";
const EMBEDDING_DIMENSIONS = 768;
const CHAT_MODEL = "gemini-2.5-flash";

function getApiKey(): string {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY manquante — voir .env.example");
  }
  return apiKey;
}

let client: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
  if (client) return client;
  client = new GoogleGenerativeAI(getApiKey());
  return client;
}

// Appel REST direct : le SDK @google/generative-ai ne type pas encore
// le paramètre outputDimensionality supporté par gemini-embedding-001.
export async function embedText(text: string): Promise<number[]> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${EMBEDDING_MODEL}:embedContent?key=${getApiKey()}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: { parts: [{ text }] },
        outputDimensionality: EMBEDDING_DIMENSIONS,
      }),
    }
  );
  if (!res.ok) {
    throw new Error(`Erreur embedding Gemini (${res.status}): ${await res.text()}`);
  }
  const data = await res.json();
  return data.embedding.values as number[];
}

export function getChatModel(systemInstruction: string) {
  return getClient().getGenerativeModel({
    model: CHAT_MODEL,
    systemInstruction,
  });
}
