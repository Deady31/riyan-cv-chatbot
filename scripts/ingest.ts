import { config } from "dotenv";
import { readdirSync, readFileSync } from "fs";
config({ path: ".env.local" });
import { join } from "path";
import { embedText } from "../lib/gemini";
import { getServiceRoleClient } from "../lib/supabase";

const KB_DIR = join(process.cwd(), "knowledge-base");

// Découpe chaque fichier par section ## pour garder un contexte cohérent par chunk
function chunkMarkdown(raw: string, source: string): { content: string; source: string }[] {
  const sections = raw.split(/\n(?=## )/g);
  return sections
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map((content) => ({ content, source }));
}

async function main() {
  const files = readdirSync(KB_DIR).filter((f) => f.endsWith(".md"));
  const supabase = getServiceRoleClient();

  const chunks = files.flatMap((file) => {
    const raw = readFileSync(join(KB_DIR, file), "utf-8");
    return chunkMarkdown(raw, file);
  });

  console.log(`${chunks.length} chunks trouvés dans ${files.length} fichiers.`);

  // Reset complet à chaque ingestion — la base connaissance fait foi
  const { error: deleteError } = await supabase.from("documents").delete().neq("id", 0);
  if (deleteError) throw deleteError;

  for (const chunk of chunks) {
    const embedding = await embedText(chunk.content);
    const { error } = await supabase.from("documents").insert({
      content: chunk.content,
      source: chunk.source,
      embedding,
    });
    if (error) throw error;
    console.log(`✓ ingéré (${chunk.source}) — ${chunk.content.slice(0, 50).replace(/\n/g, " ")}...`);
  }

  console.log("Ingestion terminée.");
}

main().catch((err) => {
  console.error("Erreur ingestion:", err);
  process.exit(1);
});
