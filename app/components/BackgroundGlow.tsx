// Fond sobre : base sombre neutre + deux halos discrets bleu/gris qui dérivent
// très lentement. Sert uniquement de support au flou du liquid glass —
// intentionnellement quasi monochrome, pas de palette multicolore.
export default function BackgroundGlow() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-ink">
      <div className="absolute -top-40 left-1/4 h-[560px] w-[560px] animate-float1 rounded-full bg-accent/[0.12] blur-[150px]" />
      <div className="absolute bottom-0 -right-32 h-[480px] w-[480px] animate-float2 rounded-full bg-white/[0.05] blur-[150px]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.05),transparent_60%)]" />
    </div>
  );
}
