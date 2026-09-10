// Petits sons synthétisés (Web Audio API) façon iMessage — pas de fichier audio
// à charger, juste un blip généré à la volée. Silencieux si l'API est indisponible.
let audioCtx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!audioCtx) audioCtx = new Ctor();
  return audioCtx;
}

function blip(freqStart: number, freqEnd: number, duration: number, volume: number) {
  const ctx = getContext();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freqStart, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freqEnd, ctx.currentTime + duration);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Contexte audio indisponible (ex: politique autoplay) — silencieux.
  }
}

export function playSend(): void {
  blip(700, 1000, 0.09, 0.045);
}

export function playReceive(): void {
  blip(520, 660, 0.12, 0.05);
}
