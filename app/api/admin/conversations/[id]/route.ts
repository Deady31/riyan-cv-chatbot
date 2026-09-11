import { NextRequest } from "next/server";
import { ADMIN_COOKIE_NAME, isValidAdminCookie } from "@/lib/adminAuth";
import { getServiceRoleClient } from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isValidAdminCookie(req.cookies.get(ADMIN_COOKIE_NAME)?.value)) {
    return new Response("Non autorisé.", { status: 401 });
  }

  const { id } = await params;
  const { data: messages, error } = await getServiceRoleClient()
    .from("messages")
    .select("id, role, content, created_at")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Erreur détail conversation:", error);
    return new Response("Erreur serveur.", { status: 500 });
  }

  return Response.json({ messages: messages ?? [] });
}
