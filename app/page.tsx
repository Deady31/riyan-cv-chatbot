"use client";

import { FormEvent, useRef, useState } from "react";
import Avatar from "./components/Avatar";
import CopyButton from "./components/CopyButton";
import MessageContent from "./components/MessageContent";

type ChatMessage = { role: "user" | "assistant"; content: string; time: string };

const SUGGESTIONS = [
  "Ton expérience chez Shippingbo",
  "Pourquoi ton dernier contrat s'est arrêté ?",
  "Ton plus gros point faible",
  "Tes prétentions salariales",
];

function now(): string {
  return new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function sendMessage(content: string) {
    if (!content.trim() || isStreaming) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content, time: now() }];
    setMessages(nextMessages);
    setInput("");
    setIsStreaming(true);

    setMessages((prev) => [...prev, { role: "assistant", content: "", time: now() }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages.map(({ role, content }) => ({ role, content })) }),
      });

      if (!res.ok || !res.body) {
        throw new Error(await res.text());
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantText += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", content: assistantText, time: updated[updated.length - 1].time };
          return updated;
        });
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: "Oups, erreur de mon côté. Réessaie dans un instant, ou contacte-moi directement sur LinkedIn.",
          time: updated[updated.length - 1].time,
        };
        return updated;
      });
    } finally {
      setIsStreaming(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  return (
    <main className="mx-auto flex h-screen max-w-2xl flex-col px-4 py-6 sm:py-8">
      {/* Header glass pill */}
      <header className="mb-4 flex items-center gap-3 rounded-3xl border border-white/10 bg-white/[0.05] px-5 py-4 shadow-[0_8px_32px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold shadow-[0_2px_10px_rgba(0,0,0,0.4)]">
          RB
        </div>
        <div>
          <h1 className="text-base font-semibold tracking-tight">Riyan Besseghir</h1>
          <p className="text-xs text-white/50">Mon CV ne répond plus — pose-moi tes questions</p>
        </div>
      </header>

      {/* Messages glass panel */}
      <div className="flex-1 space-y-3 overflow-y-auto rounded-[28px] border border-white/10 bg-white/[0.04] p-4 shadow-[0_8px_40px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:p-5">
        {messages.length === 0 && (
          <p className="animate-fade-up text-sm leading-relaxed text-white/55">
            Recruteur, manager, curieux — demande-moi ce que tu veux sur mon parcours, mes projets ou mes
            compétences. Les suggestions en bas peuvent t&apos;aider à démarrer.
          </p>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={`group flex animate-fade-up items-end gap-1.5 ${
              m.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {m.role === "assistant" && <Avatar />}
            {m.role === "assistant" && m.content && <CopyButton text={m.content} />}
            <div className="flex max-w-[78%] flex-col">
              <div
                className={
                  "whitespace-pre-wrap rounded-3xl px-4 py-2.5 text-sm leading-relaxed shadow-[0_2px_10px_rgba(0,0,0,0.35)] " +
                  (m.role === "user"
                    ? "rounded-br-md bg-accent text-white"
                    : "rounded-bl-md border border-white/10 bg-white/[0.07] text-white/90 backdrop-blur-xl")
                }
              >
                {m.content ? (
                  <MessageContent text={m.content} />
                ) : isStreaming && i === messages.length - 1 ? (
                  <span className="inline-flex gap-1">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/50 [animation-delay:-0.3s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/50 [animation-delay:-0.15s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/50" />
                  </span>
                ) : null}
              </div>
              <span className={`mt-1 text-[10px] text-white/35 ${m.role === "user" ? "text-right" : "text-left"}`}>
                {m.time}
              </span>
            </div>
            {m.role === "user" && <CopyButton text={m.content} />}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions — pinned above the input bar */}
      <div className="mt-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => sendMessage(s)}
            disabled={isStreaming}
            className="shrink-0 whitespace-nowrap rounded-full border border-white/12 bg-white/[0.05] px-3.5 py-2 text-xs font-medium text-white/70 shadow-[0_2px_8px_rgba(0,0,0,0.3)] backdrop-blur-xl transition-all hover:border-accent/40 hover:bg-white/10 hover:text-white disabled:opacity-40"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Input glass pill */}
      <form
        onSubmit={handleSubmit}
        className="mt-3 flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-2xl focus-within:border-accent/50"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Pose ta question..."
          className="flex-1 bg-transparent px-3 py-2 text-sm text-white placeholder-white/40 outline-none"
          disabled={isStreaming}
        />
        <button
          type="submit"
          disabled={isStreaming || !input.trim()}
          aria-label="Envoyer"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-white shadow-[0_2px_10px_rgba(0,0,0,0.4)] transition-transform hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </form>
    </main>
  );
}
