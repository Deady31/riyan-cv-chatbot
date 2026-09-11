import { createHash } from "crypto";

export const ADMIN_COOKIE_NAME = "meca_riyan_admin";

// Le cookie stocke un hash du mot de passe, jamais le mot de passe en clair.
// Pas de session côté serveur (Vercel = stateless) : on revalide le hash à
// chaque requête, suffisant pour un panneau admin perso à faible enjeu.
function getExpectedHash(): string {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    throw new Error("ADMIN_PASSWORD manquante — voir .env.example");
  }
  return createHash("sha256").update(password).digest("hex");
}

export function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

export function isValidAdminCookie(cookieValue: string | undefined): boolean {
  if (!cookieValue) return false;
  try {
    return cookieValue === getExpectedHash();
  } catch {
    return false;
  }
}

export function checkPassword(password: string): boolean {
  try {
    return hashPassword(password) === getExpectedHash();
  } catch {
    return false;
  }
}
