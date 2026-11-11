// Renseigne resources.width / resources.height pour les images existantes
// (migration 20261111_resources_image_dimensions). Idempotent : ne traite que
// les images sans largeur. Par défaut, simple simulation — rien n'est écrit.
//
//   node scripts/backfill-image-dimensions.mjs           # simulation (dry-run)
//   node scripts/backfill-image-dimensions.mjs --apply   # écrit en base
//
// Même logique que readImageDimensions (src/lib/media.ts) : lecture partielle
// des 128 premiers Ko, fichier complet en repli, rotation EXIF appliquée.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { imageSize } from "image-size";

function loadEnv() {
  const raw = readFileSync(join(process.cwd(), ".env.local"), "utf8");
  for (const line of raw.split(/\r?\n/)) {
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const [key, ...rest] = line.split("=");
    process.env[key.trim()] ||= rest.join("=").trim();
  }
}

loadEnv();

const apply = process.argv.includes("--apply");
const PROBE_BYTES = 128 * 1024;

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Variables Supabase manquantes dans .env.local");
  process.exit(1);
}

const db = createClient(url, key, { auth: { persistSession: false } });

function dimensionsFromBytes(bytes) {
  const result = imageSize(bytes);
  if (!result.width || !result.height) return null;
  const rotated = (result.orientation ?? 1) >= 5;
  return rotated ? { width: result.height, height: result.width } : { width: result.width, height: result.height };
}

async function readDimensions(imageUrl) {
  const partial = await fetch(imageUrl, { headers: { Range: `bytes=0-${PROBE_BYTES - 1}` } });
  if (partial.ok) {
    try {
      const dims = dimensionsFromBytes(new Uint8Array(await partial.arrayBuffer()));
      if (dims) return { ...dims, mode: "partielle" };
    } catch {
      // En-tête au-delà des premiers Ko : fichier complet ci-dessous.
    }
  }
  const full = await fetch(imageUrl);
  if (!full.ok) throw new Error(`HTTP ${full.status}`);
  const dims = dimensionsFromBytes(new Uint8Array(await full.arrayBuffer()));
  if (!dims) throw new Error("dimensions illisibles");
  return { ...dims, mode: "complète" };
}

const { data: rows, error } = await db
  .from("resources")
  .select("id,filename,url")
  .eq("type", "image")
  .is("width", null)
  .order("created_at", { ascending: true });
if (error) {
  console.error(`Lecture impossible : ${error.message}`);
  process.exit(1);
}

console.log(`${apply ? "APPLICATION" : "SIMULATION (dry-run)"} — ${rows.length} image(s) sans dimensions\n`);

const failures = [];
let updated = 0;

for (const row of rows) {
  try {
    const dims = await readDimensions(row.url);
    if (apply) {
      const { error: updateError } = await db
        .from("resources")
        .update({ width: dims.width, height: dims.height })
        .eq("id", row.id)
        .is("width", null);
      if (updateError) throw new Error(updateError.message);
      updated += 1;
    }
    console.log(`✓ ${row.filename} → ${dims.width}×${dims.height} (lecture ${dims.mode})`);
  } catch (err) {
    failures.push(row);
    console.log(`✗ ${row.filename} (${row.id}) : ${err instanceof Error ? err.message : String(err)}`);
  }
}

console.log(
  `\n${rows.length - failures.length} lue(s), ${failures.length} échec(s)${apply ? `, ${updated} mise(s) à jour` : " — rien n'a été écrit (ajouter --apply)"}.`,
);
if (failures.length > 0) process.exit(1);
