"use client";

import { FormEvent, useEffect, useState } from "react";

type Conversation = {
  id: string;
  created_at: string;
  last_message_at: string;
  messageCount: number;
  firstUserMessage: string | null;
};

type Message = { id: number; role: "user" | "assistant"; content: string; created_at: string };

type UnansweredQuestion = { id: number; conversation_id: string | null; question: string; created_at: string };

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });
}

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null); // null = vérification en cours
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [tab, setTab] = useState<"conversations" | "unanswered">("conversations");

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const [unanswered, setUnanswered] = useState<UnansweredQuestion[]>([]);

  async function loadConversations() {
    const res = await fetch("/api/admin/conversations");
    if (res.status === 401) {
      setAuthed(false);
      return;
    }
    setAuthed(true);
    const data = await res.json();
    setConversations(data.conversations ?? []);
  }

  async function loadUnanswered() {
    const res = await fetch("/api/admin/unanswered");
    if (res.status === 401) {
      setAuthed(false);
      return;
    }
    const data = await res.json();
    setUnanswered(data.questions ?? []);
  }

  useEffect(() => {
    loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Deep-link depuis l'alerte Discord : /admin?conversation=<id>
  useEffect(() => {
    if (!authed) return;
    const params = new URLSearchParams(window.location.search);
    const target = params.get("conversation");
    if (target) selectConversation(target);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed]);

  useEffect(() => {
    if (authed && tab === "unanswered") loadUnanswered();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed, tab]);

  async function selectConversation(id: string) {
    setSelectedId(id);
    setLoadingMessages(true);
    const res = await fetch(`/api/admin/conversations/${id}`);
    if (res.status === 401) {
      setAuthed(false);
      setLoadingMessages(false);
      return;
    }
    const data = await res.json();
    setMessages(data.messages ?? []);
    setLoadingMessages(false);
  }

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setLoginError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      setLoginError("Mot de passe incorrect.");
      return;
    }
    setPassword("");
    loadConversations();
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthed(false);
    setConversations([]);
    setMessages([]);
    setSelectedId(null);
  }

  if (authed === null) {
    return <main className="flex h-screen items-center justify-center text-sm text-white/60">Chargement...</main>;
  }

  if (!authed) {
    return (
      <main className="flex h-screen items-center justify-center px-6">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-xs rounded-3xl border border-white/10 bg-black/50 p-6 text-center shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
        >
          <h1 className="text-shadow-glass mb-4 text-lg font-semibold">Dashboard Méca-Riyan</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mot de passe"
            autoFocus
            className="w-full rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-center text-sm text-white outline-none focus:border-accent/50"
          />
          {loginError && <p className="mt-2 text-xs text-red-400">{loginError}</p>}
          <button
            type="submit"
            className="mt-4 w-full rounded-full bg-accent px-4 py-2 text-sm font-medium text-white transition-transform hover:scale-105"
          >
            Entrer
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="mx-auto flex h-screen max-w-5xl flex-col px-4 py-6">
      <header className="mb-4 flex items-center justify-between rounded-3xl border border-white/10 bg-black/45 px-5 py-4 shadow-[0_8px_32px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
        <h1 className="text-shadow-glass text-base font-semibold">Dashboard Méca-Riyan</h1>
        <div className="flex items-center gap-3">
          <div className="flex gap-1 rounded-full border border-white/10 bg-white/[0.05] p-1">
            <button
              onClick={() => setTab("conversations")}
              className={`text-shadow-glass rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                tab === "conversations" ? "bg-accent text-white" : "text-white/60 hover:text-white"
              }`}
            >
              Conversations
            </button>
            <button
              onClick={() => setTab("unanswered")}
              className={`text-shadow-glass rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                tab === "unanswered" ? "bg-accent text-white" : "text-white/60 hover:text-white"
              }`}
            >
              Sans réponse {unanswered.length > 0 && `(${unanswered.length})`}
            </button>
          </div>
          <button onClick={handleLogout} className="text-shadow-glass text-xs text-white/50 hover:text-white">
            Déconnexion
          </button>
        </div>
      </header>

      {tab === "conversations" ? (
        <div className="flex min-h-0 flex-1 gap-4">
          <div className="w-full max-w-xs shrink-0 space-y-2 overflow-y-auto rounded-3xl border border-white/10 bg-black/40 p-3 backdrop-blur-2xl">
            {conversations.length === 0 && (
              <p className="text-shadow-glass p-3 text-xs text-white/50">Aucune conversation pour l&apos;instant.</p>
            )}
            {conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => selectConversation(c.id)}
                className={`text-shadow-glass block w-full rounded-2xl border px-3 py-2.5 text-left text-xs transition-colors ${
                  selectedId === c.id
                    ? "border-accent/50 bg-accent/15"
                    : "border-white/10 bg-white/[0.04] hover:bg-white/[0.08]"
                }`}
              >
                <div className="mb-1 flex items-center justify-between text-white/50">
                  <span>{formatDate(c.last_message_at)}</span>
                  <span>{c.messageCount} msg</span>
                </div>
                <p className="truncate text-white/85">{c.firstUserMessage ?? "(vide)"}</p>
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto rounded-3xl border border-white/10 bg-black/40 p-4 backdrop-blur-2xl">
            {!selectedId && <p className="text-shadow-glass text-sm text-white/50">Sélectionne une conversation.</p>}
            {loadingMessages && <p className="text-shadow-glass text-sm text-white/50">Chargement...</p>}
            {!loadingMessages && selectedId && (
              <div className="space-y-3">
                {messages.map((m) => (
                  <div key={m.id} className={m.role === "user" ? "text-right" : "text-left"}>
                    <div
                      className={`text-shadow-glass inline-block max-w-[80%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-left text-sm ${
                        m.role === "user" ? "bg-accent text-white" : "border border-white/10 bg-white/[0.06] text-white/90"
                      }`}
                    >
                      {m.content}
                    </div>
                    <p className="text-shadow-glass mt-1 text-[10px] text-white/40">{formatDate(m.created_at)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 space-y-2 overflow-y-auto rounded-3xl border border-white/10 bg-black/40 p-4 backdrop-blur-2xl">
          {unanswered.length === 0 && (
            <p className="text-shadow-glass text-sm text-white/50">Aucune question sans réponse pour l&apos;instant 🎉</p>
          )}
          {unanswered.map((q) => (
            <div key={q.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
              <div className="text-shadow-glass mb-1 flex items-center justify-between text-xs text-white/50">
                <span>{formatDate(q.created_at)}</span>
                {q.conversation_id && (
                  <button
                    onClick={() => {
                      setTab("conversations");
                      selectConversation(q.conversation_id!);
                    }}
                    className="text-accent hover:underline"
                  >
                    Voir la conversation →
                  </button>
                )}
              </div>
              <p className="text-shadow-glass text-sm text-white/90">{q.question}</p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
