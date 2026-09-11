import Image from "next/image";

export default function Avatar() {
  return (
    <div className="h-7 w-7 shrink-0 overflow-hidden rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
      <Image src="/meca-riyan.jpg" alt="Méca-Riyan" width={28} height={28} className="h-full w-full object-cover" />
    </div>
  );
}
