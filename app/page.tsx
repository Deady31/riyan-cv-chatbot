"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import Avatar from "./components/Avatar";
import CopyButton from "./components/CopyButton";
import MessageContent from "./components/MessageContent";
import TypingIndicator from "./components/TypingIndicator";
import Onboarding from "./components/Onboarding";
import { playReceive, playSend } from "@/lib/sound";

type ChatMessage = { role: "user" | "assistant"; content: string; time: string };

const SUGGESTIONS = [
  "Ton expérience chez Shippingbo",
  "Pourquoi ton dernier contrat s'est arrêté ?",
  "Ton plus gros point faible",
  "Tes prétentions salariales",
];

const BUBBLE_SPRING = { type: "spring", stiffness: 380, damping: 28, mass: 0.8 } as const;
const MUTE_STORAGE_KEY = "chatbot-muted";

function now(): string {
  return new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [muted, setMuted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      setMuted(localStorage.getItem(MUTE_STORAGE_KEY) === "1");
    } catch {
      // localStorage indisponible — reste non muet par défaut.
    }
  }, []);

  function toggleMute() {
    setMuted((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(MUTE_STORAGE_KEY, next ? "1" : "0");
      } catch {
        // ignore
      }
      return next;
    });
  }

  async function sendMessage(content: string) {
    if (!content.trim() || isStreaming) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content, time: now() }];
    setMessages(nextMessages);
    setInput("");
    setIsStreaming(true);
    if (!muted) playSend();

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

      if (!muted) playReceive();
    } catch (err) {
      const fallback =
        "Oups, erreur de mon côté. Réessaie dans un instant, ou contacte-moi directement sur LinkedIn.";
      const message = err instanceof Error && err.message ? err.message : fallback;
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: message,
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
    <>
      <Onboarding />
      <main className="mx-auto flex h-screen max-w-2xl flex-col px-4 py-6 sm:py-8">
      {/* Header glass pill */}
      <header className="mb-4 flex items-center gap-3 rounded-3xl border border-white/10 bg-black/45 px-5 py-4 shadow-[0_8px_32px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.4)]">
          <Image src="/meca-riyan.jpg" alt="Méca-Riyan" width={40} height={40} className="h-full w-full object-cover" />
        </div>
        <div className="flex-1">
          <h1 className="text-shadow-glass text-base font-semibold tracking-tight">Méca-Riyan</h1>
          <p className="text-shadow-glass text-xs text-white/70">Mon CV ne répond plus — pose-moi tes questions</p>
        </div>
        <button
          type="button"
          onClick={toggleMute}
          aria-label={muted ? "Activer le son" : "Couper le son"}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        >
          {muted ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 5 6 9H2v6h4l5 4V5Z" strokeLinecap="round" strokeLinejoin="round" />
              <path d="m23 9-6 6M17 9l6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 5 6 9H2v6h4l5 4V5Z" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
      </header>

      {/* Messages glass panel */}
      <div className="flex-1 space-y-3 overflow-y-auto rounded-[28px] border border-white/10 bg-black/40 p-4 shadow-[0_8px_40px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:p-5">
        {messages.length === 0 && (
          <p className="text-shadow-glass animate-fade-up text-sm leading-relaxed text-white/75">
            Recruteur, manager, curieux — demande-moi ce que tu veux sur mon parcours, mes projets ou mes
            compétences. Les suggestions en bas peuvent t&apos;aider à démarrer.
          </p>
        )}

        {messages.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.85, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={BUBBLE_SPRING}
            style={{ transformOrigin: m.role === "user" ? "100% 100%" : "0% 100%" }}
            className={`group flex items-end gap-1.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {m.role === "assistant" && <Avatar />}
            {m.role === "assistant" && m.content && <CopyButton text={m.content} />}
            <div className="flex max-w-[78%] flex-col">
              <div
                className={
                  "whitespace-pre-wrap rounded-3xl px-4 py-2.5 text-sm leading-relaxed shadow-[0_2px_10px_rgba(0,0,0,0.35)] " +
                  (m.role === "user"
                    ? "rounded-br-md bg-accent text-white"
                    : "rounded-bl-md bg-white text-ink")
                }
              >
                {m.content ? (
                  <MessageContent text={m.content} />
                ) : isStreaming && i === messages.length - 1 ? (
                  <TypingIndicator size={6} />
                ) : null}
              </div>
              <span className={`text-shadow-glass mt-1 text-[10px] text-white/55 ${m.role === "user" ? "text-right" : "text-left"}`}>
                {m.time}
              </span>
            </div>
            {m.role === "user" && <CopyButton text={m.content} />}
          </motion.div>
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
            className="text-shadow-glass shrink-0 whitespace-nowrap rounded-full border border-white/12 bg-black/45 px-3.5 py-2 text-xs font-medium text-white/85 shadow-[0_2px_8px_rgba(0,0,0,0.3)] backdrop-blur-xl transition-all hover:border-accent/40 hover:bg-black/55 hover:text-white disabled:opacity-40"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Input glass pill */}
      <form
        onSubmit={handleSubmit}
        className="mt-3 flex items-center gap-2 rounded-full border border-white/12 bg-black/45 p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-2xl focus-within:border-accent/50"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Pose ta question..."
          className="text-shadow-glass flex-1 bg-transparent px-3 py-2 text-sm text-white placeholder-white/55 outline-none"
          disabled={isStreaming}
        />
        <motion.button
          type="submit"
          disabled={isStreaming || !input.trim()}
          aria-label="Envoyer"
          whileTap={{ scale: 0.88 }}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-white shadow-[0_2px_10px_rgba(0,0,0,0.4)] transition-transform hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.button>
      </form>
      </main>
    </>
  );
}
