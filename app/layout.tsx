import type { Metadata } from "next";
import "./globals.css";
import SilkBackground from "./components/SilkBackground";

export const metadata: Metadata = {
  title: "Riyan Besseghir — Mon CV ne répond plus",
  description: "Pose tes questions directement à l'agent IA de Riyan Besseghir, Product Manager.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="relative min-h-screen overflow-x-hidden bg-ink text-white">
        <SilkBackground />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
