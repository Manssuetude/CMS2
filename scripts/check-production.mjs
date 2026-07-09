import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Variables NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY requises");
  process.exit(1);
}

const supabase = createClient(url, key);

const { data, error } = await supabase.from("productions").select("id, slug, title, content_blocks").limit(1).single();

if (error) {
  console.error("Error:", error.message);
} else {
  console.log("title:", data.title);
  const blocks = data.content_blocks;
  console.log("content_blocks type:", typeof blocks);
  console.log("content_blocks:", JSON.stringify(blocks).slice(0, 200));
  if (Array.isArray(blocks)) {
    const bodyBlock = blocks.find((b) => b.type === "body");
    console.log("body block found:", !!bodyBlock);
    if (bodyBlock) console.log("body value length:", bodyBlock.value?.length);
  }
}
