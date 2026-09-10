import type { ChatHistoryEntry } from "./chat";

// Cascade Groq, du plus costaud au plus léger. Free tier Groq nettement plus
// généreux que Gemini. Si un modèle est absent/à quota, on essaie le suivant.
const CHAT_MODELS = ["openai/gpt-oss-120b", "qwen/qwen3.8-27b", "openai/gpt-oss-20b", "groq/compound-mini"] as const;

type OpenAiMessage = { role: "system" | "user" | "assistant"; content: string };

function toOpenAiMessages(
  systemInstruction: string,
  history: ChatHistoryEntry[],
  message: string
): OpenAiMessage[] {
  return [
    { role: "system", content: systemInstruction },
    ...history.map((h): OpenAiMessage => ({
      role: h.role === "model" ? "assistant" : "user",
      content: h.parts.map((p) => p.text).join(""),
    })),
    { role: "user", content: message },
  ];
}

function shouldFallback(err: unknown): boolean {
  return err instanceof Error && (err.message.includes("429") || err.message.includes("404"));
}

// Parse le flux SSE façon OpenAI (data: {...}\n\n, terminé par data: [DONE]).
async function* streamOneModel(model: string, apiKey: string, messages: OpenAiMessage[]): AsyncGenerator<string> {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model, messages, stream: true }),
  });

  if (!res.ok || !res.body) {
    throw new Error(`Groq ${model} erreur ${res.status}: ${await res.text()}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const payload = trimmed.slice(5).trim();
      if (payload === "[DONE]") return;
      try {
        const json = JSON.parse(payload);
        const text = json.choices?.[0]?.delta?.content;
        if (text) yield text;
      } catch {
        // Ligne SSE incomplète coupée entre deux chunks réseau — ignorée.
      }
    }
  }
}

// Générateur vide (aucun yield) si Groq n'est pas configuré : l'orchestrateur
// dans chat.ts bascule alors directement sur Gemini sans traiter ça comme une erreur.
export async function* streamGroqReply(
  systemInstruction: string,
  history: ChatHistoryEntry[],
  message: string
): AsyncGenerator<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return;

  const messages = toOpenAiMessages(systemInstruction, history, message);
  let lastError: unknown;

  for (const model of CHAT_MODELS) {
    const gen = streamOneModel(model, apiKey, messages);
    let first: IteratorResult<string>;
    try {
      first = await gen.next();
    } catch (err) {
      lastError = err;
      if (!shouldFallback(err)) throw err;
      continue;
    }
    if (first.done) continue; // réponse vide — modèle suivant plutôt qu'échec silencieux

    // Une fois le premier chunk reçu, plus de bascule sur erreur — évite de
    // mélanger deux réponses (même règle que dans lib/chat.ts).
    yield first.value;
    for await (const chunk of gen) yield chunk;
    return;
  }
  throw lastError instanceof Error ? lastError : new Error("Tous les modèles Groq ont échoué");
}
