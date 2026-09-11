import { getServiceRoleClient } from "./supabase";

// Phrase de repli exacte imposée par system-prompt.md quand le bot n'a pas
// l'info — sert de signal fiable pour détecter une question sans réponse.
const NO_ANSWER_MARKER = "Je n'ai pas cette information précise, mais tu peux me contacter directement sur LinkedIn";

export function isUnanswered(assistantText: string): boolean {
  return assistantText.includes(NO_ANSWER_MARKER);
}

type LogMessage = { role: "user" | "assistant"; content: string };

const MAX_LINE_LENGTH = 220;
const MAX_HISTORY_LINES = 6; // dernières lignes de contexte incluses dans l'alerte

function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max).trimEnd() + "…" : text;
}

function buildTranscript(history: LogMessage[]): string {
  return history
    .slice(-MAX_HISTORY_LINES)
    .map((m) => `${m.role === "user" ? "👤" : "🤖"} ${truncate(m.content, MAX_LINE_LENGTH)}`)
    .join("\n");
}

// Log en base + notif Discord (si configurée) — jamais bloquant pour la
// réponse au visiteur, les erreurs restent silencieuses côté serveur.
export async function flagUnanswered(
  conversationId: string | undefined,
  question: string,
  history: LogMessage[]
): Promise<void> {
  try {
    const { error } = await getServiceRoleClient()
      .from("unanswered_questions")
      .insert({ conversation_id: conversationId ?? null, question });
    if (error) console.error("Erreur log question sans réponse:", error);
  } catch (err) {
    console.error("Erreur log question sans réponse:", err);
  }

  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return;

  const transcript = buildTranscript(history);
  const siteUrl = process.env.SITE_URL;
  const link =
    siteUrl && conversationId
      ? `\n\n🔎 [Voir la conversation](${siteUrl}/admin?conversation=${conversationId})`
      : "";

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: `🤔 **Question sans réponse sur le chatbot CV**\n\n${transcript}${link}`,
      }),
    });
  } catch (err) {
    console.error("Erreur webhook Discord:", err);
  }
}
