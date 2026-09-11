"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { LiquidMetalButton } from "./LiquidMetalButton";

const SEEN_KEY = "riyan-chatbot-onboarded";

const EXAMPLES = [
  "Parle-moi de ton expérience chez Shippingbo",
  "Quelle est la pire chose qui te soit arrivée ?",
  "Tes films préférés ?",
];

export default function Onboarding() {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(SEEN_KEY) !== "1") setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  function dismiss() {
    setExiting(true);
    try {
      localStorage.setItem(SEEN_KEY, "1");
    } catch {
      // localStorage indisponible — l'onboarding réapparaîtra la prochaine fois, sans gravité.
    }
    setTimeout(() => setVisible(false), 500);
  }

  if (!visible) return null;

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/55 px-6 text-center backdrop-blur-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.08, filter: "blur(12px)" }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        >
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            className="h-11 w-11 overflow-hidden rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.4)]"
          >
            <Image src="/meca-riyan.jpg" alt="Méca-Riyan" width={44} height={44} className="h-full w-full object-cover" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            className="text-shadow-glass mt-5 text-2xl font-semibold tracking-tight sm:text-3xl"
          >
            Bienvenue sur Méca-Riyan
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            className="text-shadow-glass mt-3 max-w-sm text-sm leading-relaxed text-white/80"
          >
            Mon CV ne répond plus, alors je l&apos;ai remplacé par ça. Pose-moi tes
            questions sur mon parcours, mes projets, mes compétences, même les plus
            indiscrètes.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.38, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            className="mt-5 flex flex-wrap justify-center gap-2"
          >
            {EXAMPLES.map((ex) => (
              <span
                key={ex}
                className="text-shadow-glass rounded-full border border-white/12 bg-black/45 px-3 py-1.5 text-xs text-white/80"
              >
                {ex}
              </span>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.48, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            className="mt-8"
          >
            <LiquidMetalButton label="Découvrir le chatbot ✨" onClick={dismiss} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
