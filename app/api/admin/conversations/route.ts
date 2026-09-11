import { NextRequest } from "next/server";
import { ADMIN_COOKIE_NAME, isValidAdminCookie } from "@/lib/adminAuth";
import { getServiceRoleClient } from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  if (!isValidAdminCookie(req.cookies.get(ADMIN_COOKIE_NAME)?.value)) {
    return new Response("Non autorisé.", { status: 401 });
  }

  const supabase = getServiceRoleClient();
  const { data: conversations, error } = await supabase
    .from("conversations")
    .select("id, created_at, last_message_at")
    .order("last_message_at", { ascending: false })
    .limit(200);

  if (error) {
    console.error("Erreur liste conversations:", error);
    return new Response("Erreur serveur.", { status: 500 });
  }

  // Compte de messages + premier message utilisateur par conversation, pour
  // l'aperçu dans la liste — une requête groupée plutôt qu'une par conversation.
  const ids = (conversations ?? []).map((c) => c.id);
  const { data: messages, error: msgError } = await supabase
    .from("messages")
    .select("conversation_id, role, content, created_at")
    .in("conversation_id", ids)
    .order("created_at", { ascending: true });

  if (msgError) console.error("Erreur messages (aperçu):", msgError);

  const preview = new Map<string, { count: number; firstUserMessage: string | null }>();
  for (const m of messages ?? []) {
    const entry = preview.get(m.conversation_id) ?? { count: 0, firstUserMessage: null };
    entry.count += 1;
    if (m.role === "user" && !entry.firstUserMessage) entry.firstUserMessage = m.content;
    preview.set(m.conversation_id, entry);
  }

  const result = (conversations ?? []).map((c) => ({
    ...c,
    messageCount: preview.get(c.id)?.count ?? 0,
    firstUserMessage: preview.get(c.id)?.firstUserMessage ?? null,
  }));

  return Response.json({ conversations: result });
}
