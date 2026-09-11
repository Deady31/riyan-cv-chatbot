import { NextRequest } from "next/server";
import { ADMIN_COOKIE_NAME, isValidAdminCookie } from "@/lib/adminAuth";
import { getServiceRoleClient } from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  if (!isValidAdminCookie(req.cookies.get(ADMIN_COOKIE_NAME)?.value)) {
    return new Response("Non autorisé.", { status: 401 });
  }

  const { data, error } = await getServiceRoleClient()
    .from("unanswered_questions")
    .select("id, conversation_id, question, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    console.error("Erreur liste questions sans réponse:", error);
    return new Response("Erreur serveur.", { status: 500 });
  }

  return Response.json({ questions: data ?? [] });
}
