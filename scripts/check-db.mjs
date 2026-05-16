import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";

function loadEnv() {
  const raw = readFileSync(join(process.cwd(), ".env.local"), "utf8");
  for (const line of raw.split(/\r?\n/)) {
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const [key, ...rest] = line.split("=");
    process.env[key.trim()] ||= rest.join("=").trim();
  }
}

loadEnv();

const requiredTables = [
  "users",
  "pages",
  "themes",
  "productions",
  "activities",
  "projects",
  "resources",
  "form_submissions",
  "site_settings",
];

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Variables Supabase manquantes dans .env.local");
  process.exit(1);
}

const db = createClient(url, key, { auth: { persistSession: false } });
let hasError = false;

for (const table of requiredTables) {
  const { error } = await db.from(table).select("id").limit(1);
  if (error) {
    hasError = true;
    console.log(`✗ ${table}: ${error.message}`);
  } else {
    console.log(`✓ ${table}`);
  }
}

if (hasError) {
  console.log("\nSchéma incomplet. Exécute supabase/schema.sql puis supabase/storage.sql dans Supabase SQL Editor.");
  process.exit(1);
}

console.log("\nBase Supabase prête pour npm run seed.");
