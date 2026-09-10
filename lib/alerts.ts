import { getSupabase } from "./supabase";

// Phrase de repli exacte imposée par system-prompt.md quand le bot n'a pas
// l'info — sert de signal fiable pour détecter une question sans réponse.
const NO_ANSWER_MARKER = "Je n'ai pas cette information précise, mais tu peux me contacter directement sur LinkedIn";

export function isUnanswered(assistantText: string): boolean {
  return assistantText.includes(NO_ANSWER_MARKER);
}

// Log en base + notif Discord (si configurée) — jamais bloquant pour la
// réponse au visiteur, les erreurs restent silencieuses côté serveur.
export async function flagUnanswered(question: string): Promise<void> {
  try {
    const { error } = await getSupabase().from("unanswered_questions").insert({ question });
    if (error) console.error("Erreur log question sans réponse:", error);
  } catch (err) {
    console.error("Erreur log question sans réponse:", err);
  }

  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: `🤔 **Question sans réponse sur le chatbot CV**\n> ${question}`,
      }),
    });
  } catch (err) {
    console.error("Erreur webhook Discord:", err);
  }
}
