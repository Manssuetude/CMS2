import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Variables NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY requises");
  process.exit(1);
}

const supabase = createClient(url, key);

const { data, error } = await supabase.from("productions").select("id, body").limit(1);
if (error) {
  console.error("Error:", error.message);
  if (error.message.includes("body")) {
    console.log("Colonne 'body' absente. Executer dans Supabase SQL editor :");
    console.log("ALTER TABLE productions ADD COLUMN IF NOT EXISTS body text;");
  }
} else {
  console.log("Colonne 'body' presente. Data:", JSON.stringify(data));
}
