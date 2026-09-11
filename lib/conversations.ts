import { getServiceRoleClient } from "./supabase";

// Écrit toujours depuis la route API (jamais depuis le navigateur), donc
// service_role directement : plus simple et plus fiable que anon + RLS pour
// un upsert (l'RLS anon bloquait la résolution de conflit sans policy SELECT,
// qu'on ne veut pas ouvrir — les conversations des visiteurs restent privées).

// Crée la conversation si besoin, sinon met juste à jour last_message_at
// (merge-duplicates : ne touche pas à created_at déjà posé par défaut).
export async function ensureConversation(conversationId: string): Promise<void> {
  const { error } = await getServiceRoleClient()
    .from("conversations")
    .upsert({ id: conversationId, last_message_at: new Date().toISOString() }, { onConflict: "id" });
  if (error) console.error("Erreur upsert conversation:", error);
}

export async function logMessage(
  conversationId: string,
  role: "user" | "assistant",
  content: string
): Promise<void> {
  const { error } = await getServiceRoleClient()
    .from("messages")
    .insert({ conversation_id: conversationId, role, content });
  if (error) console.error("Erreur log message:", error);
}
