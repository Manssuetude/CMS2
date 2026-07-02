import { createClient } from "@supabase/supabase-js";

const url = "https://qyagkxsgfzfuqefjlqdu.supabase.co";
const key =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5YWdreHNnZnpmdXFlZmpscWR1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODc3NzcyNCwiZXhwIjoyMDk0MzUzNzI0fQ.Tv6XmrG1COtACIwxU-yj7iyzVx-2DcQpZFuOdw4HGLM";

const supabase = createClient(url, key);

const { data, error } = await supabase
  .from("productions")
  .select("id, slug, title, content_blocks")
  .eq("id", "400f22fc-1975-44e1-8894-739c93e86de5")
  .single();

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
