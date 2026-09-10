import { streamGroqReply } from "./groq";
import { streamGeminiReply } from "./gemini";

export type ChatHistoryEntry = { role: "user" | "model"; parts: { text: string }[] };

// Orchestration multi-fournisseur : Groq d'abord (quota gratuit nettement plus
// généreux), Gemini en secours si Groq est indisponible/non configuré/à quota.
// Une fois qu'un fournisseur a commencé à streamer du contenu, on ne bascule
// plus dessus en cas d'erreur en cours de route — pour éviter de mélanger deux
// réponses dans le même message. On ne bascule que si l'échec survient avant
// le tout premier chunk.
export async function* streamReply(
  systemInstruction: string,
  history: ChatHistoryEntry[],
  message: string
): AsyncGenerator<string> {
  let yieldedAny = false;
  try {
    for await (const chunk of streamGroqReply(systemInstruction, history, message)) {
      yieldedAny = true;
      yield chunk;
    }
    if (yieldedAny) return;
  } catch (err) {
    if (yieldedAny) {
      console.error("Erreur Groq en cours de streaming, pas de bascule (contenu déjà envoyé):", err);
      return;
    }
    console.error("Groq indisponible avant toute réponse, bascule sur Gemini:", err);
  }

  yield* streamGeminiReply(systemInstruction, history, message);
}
