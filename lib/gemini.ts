import { GoogleGenerativeAI } from "@google/generative-ai";

const EMBEDDING_MODEL = "gemini-embedding-001";
const EMBEDDING_DIMENSIONS = 768;

// Cascade de modèles chat, du plus généreux en quota gratuit au moins généreux.
// gemini-2.5-flash a un quota free tier de seulement 20 requêtes/JOUR — bien
// trop bas pour un chatbot public. Les variantes "lite" ont un quota gratuit
// nettement plus élevé. Si un modèle est à quota (429) ou déprécié (404), on
// bascule sur le suivant — la disponibilité des modèles Gemini change souvent.
const CHAT_MODELS = [
  "gemini-3.5-flash-lite",
  "gemini-flash-lite-latest",
  "gemini-3.1-flash-lite",
  "gemini-3.6-flash",
] as const;

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

function isRetryable503(err: unknown): boolean {
  return err instanceof Error && err.message.includes("503");
}

// Bascule sur le modèle suivant si celui-ci est à quota (429) ou n'existe
// plus / plus disponible pour ce compte (404) — pas pour les autres erreurs.
function shouldFallback(err: unknown): boolean {
  return err instanceof Error && (err.message.includes("429") || err.message.includes("404"));
}

async function withRetry503<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (!isRetryable503(err) || attempt >= retries) throw err;
      await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
    }
  }
}

type ChatHistoryEntry = { role: "user" | "model"; parts: { text: string }[] };

// Essaie chaque modèle de la cascade jusqu'à ce qu'un réponde ; ne bascule
// sur le suivant que pour un 429 quota (les autres erreurs remontent direct).
export async function startChatStream(
  systemInstruction: string,
  history: ChatHistoryEntry[],
  message: string
) {
  let lastError: unknown;
  for (const modelName of CHAT_MODELS) {
    const model = getClient().getGenerativeModel({ model: modelName, systemInstruction });
    const chat = model.startChat({ history });
    try {
      return await withRetry503(() => chat.sendMessageStream(message));
    } catch (err) {
      lastError = err;
      if (!shouldFallback(err)) throw err;
    }
  }
  throw lastError;
}
