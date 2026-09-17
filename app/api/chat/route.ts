import { readFileSync } from "fs";
import { join } from "path";
import { NextRequest } from "next/server";
import { embedText } from "@/lib/gemini";
import { streamReply } from "@/lib/chat";
import { getSupabase } from "@/lib/supabase";
import { flagUnanswered, isUnanswered } from "@/lib/alerts";
import { ensureConversation, logMessage } from "@/lib/conversations";

export const runtime = "nodejs";

type ChatMessage = { role: "user" | "assistant"; content: string };

const SYSTEM_PROMPT = readFileSync(join(process.cwd(), "system-prompt.md"), "utf-8");
const MATCH_COUNT = 9;
const RATE_LIMIT_MAX = 20;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const BUSY_MESSAGE =
  "Trop de monde teste le chatbot en même temps là — réessaie dans une minute, ou contacte-moi direct sur LinkedIn.";

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

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (isRateLimited(ip)) {
    return new Response("Trop de requêtes, réessaie dans quelques minutes.", { status: 429 });
  }

  const { messages, conversationId }: { messages: ChatMessage[]; conversationId?: string } = await req.json();
  if (!messages?.length) {
    return new Response("Aucun message reçu.", { status: 400 });
  }

  const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
  if (!lastUserMessage) {
    return new Response("Aucun message utilisateur trouvé.", { status: 400 });
  }

  // Persistance pour le dashboard admin — jamais bloquant pour la réponse au visiteur.
  if (conversationId) {
    void ensureConversation(conversationId).then(() =>
      logMessage(conversationId, "user", lastUserMessage.content)
    );
  }

  let context = "";
  try {
    // Retrieval : embed la question, cherche les chunks les plus proches
    const queryEmbedding = await embedText(lastUserMessage.content);
    const { data: matches, error } = await getSupabase().rpc("match_documents", {
      query_embedding: queryEmbedding,
      match_count: MATCH_COUNT,
    });
    if (error) console.error("Erreur retrieval:", error);
    context = (matches ?? []).map((m: { content: string }) => m.content).join("\n\n---\n\n");
  } catch (err) {
    console.error("Erreur embedding:", err);
  }

  const systemInstruction = `${SYSTEM_PROMPT}\n\n## Contexte pertinent pour cette question\n\n${context}`;
  const history = messages.slice(0, -1).map((m) => ({
    role: m.role === "user" ? ("user" as const) : ("model" as const),
    parts: [{ text: m.content }],
  }));

  const replyGen = streamReply(systemInstruction, history, lastUserMessage.content);

  // On tire le premier chunk avant de répondre : si tous les fournisseurs
  // échouent d'entrée, on peut encore renvoyer un vrai statut 503 avec un
  // message clair plutôt qu'un stream 200 vide.
  let first: IteratorResult<string>;
  try {
    first = await replyGen.next();
  } catch (err) {
    console.error("Erreur génération chat:", err);
    return new Response(BUSY_MESSAGE, { status: 503 });
  }

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      let fullText = "";
      try {
        if (!first.done && first.value) {
          fullText += first.value;
          controller.enqueue(encoder.encode(first.value));
        }
        for await (const text of replyGen) {
          fullText += text;
          controller.enqueue(encoder.encode(text));
        }
      } catch (err) {
        console.error("Erreur streaming:", err);
      } finally {
        controller.close();
        if (conversationId) void logMessage(conversationId, "assistant", fullText);
        if (isUnanswered(fullText)) {
          void flagUnanswered(conversationId, lastUserMessage.content, [
            ...messages,
            { role: "assistant", content: fullText },
          ]);
        }
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
