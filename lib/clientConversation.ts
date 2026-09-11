"use client";

const STORAGE_KEY = "chatbot-conversation-id";

// Un id stable par visiteur (persisté en localStorage), pour regrouper ses
// messages sous une même conversation côté dashboard admin.
export function getOrCreateConversationId(): string {
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing) return existing;
    const id = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, id);
    return id;
  } catch {
    // localStorage indisponible — id éphémère pour cette requête uniquement.
    return crypto.randomUUID();
  }
}
