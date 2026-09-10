import { readFileSync } from "fs";
import { join } from "path";
import { NextRequest } from "next/server";
import { embedText, getChatModel } from "@/lib/gemini";
import { getSupabase } from "@/lib/supabase";

export const runtime = "nodejs";

type ChatMessage = { role: "user" | "assistant"; content: string };

const SYSTEM_PROMPT = readFileSync(join(process.cwd(), "system-prompt.md"), "utf-8");
const MATCH_COUNT = 5;
const RATE_LIMIT_MAX = 20;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

// Rate limiting en mémoire, simple et suffisant pour un trafic perso mono-instance
const rateLimitStore = new Map<string, { count: number; windowStart: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.set(ip, { count: 1, windowStart: now });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX;
}

// Le free tier Gemini renvoie parfois un 503 transitoire en cas de forte demande.
async function sendWithRetry<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const is503 = err instanceof Error && err.message.includes("503");
      if (!is503 || attempt >= retries) throw err;
      await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
    }
  }
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (isRateLimited(ip)) {
    return new Response("Trop de requêtes, réessaie dans quelques minutes.", { status: 429 });
  }

  const { messages }: { messages: ChatMessage[] } = await req.json();
  if (!messages?.length) {
    return new Response("Aucun message reçu.", { status: 400 });
  }

  const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
  if (!lastUserMessage) {
    return new Response("Aucun message utilisateur trouvé.", { status: 400 });
  }

  // Retrieval : embed la question, cherche les chunks les plus proches
  const queryEmbedding = await embedText(lastUserMessage.content);
  const { data: matches, error } = await getSupabase().rpc("match_documents", {
    query_embedding: queryEmbedding,
    match_count: MATCH_COUNT,
  });
  if (error) {
    console.error("Erreur retrieval:", error);
  }

  const context = (matches ?? [])
    .map((m: { content: string }) => m.content)
    .join("\n\n---\n\n");

  const systemInstruction = `${SYSTEM_PROMPT}\n\n## Contexte pertinent pour cette question\n\n${context}`;

  const model = getChatModel(systemInstruction);
  const history = messages.slice(0, -1).map((m) => ({
    role: m.role === "user" ? "user" : "model",
    parts: [{ text: m.content }],
  }));

  const chat = model.startChat({ history });
  const result = await sendWithRetry(() => chat.sendMessageStream(lastUserMessage.content));

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        for await (const chunk of result.stream) {
          const text = chunk.text();
          if (text) controller.enqueue(encoder.encode(text));
        }
      } catch (err) {
        console.error("Erreur streaming:", err);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
