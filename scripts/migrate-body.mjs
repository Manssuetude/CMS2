import { createClient } from "@supabase/supabase-js";

const url = "https://qyagkxsgfzfuqefjlqdu.supabase.co";
const key =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5YWdreHNnZnpmdXFlZmpscWR1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODc3NzcyNCwiZXhwIjoyMDk0MzUzNzI0fQ.Tv6XmrG1COtACIwxU-yj7iyzVx-2DcQpZFuOdw4HGLM";

const supabase = createClient(url, key);

// Test: check if body column exists by querying a production
const { data, error } = await supabase.from("productions").select("id, body").limit(1);
if (error) {
  console.error("Error:", error.message);
  if (error.message.includes("body")) {
    console.log("Column 'body' does not exist. Need to add it via Supabase dashboard.");
    console.log("Run this SQL in Supabase SQL editor:");
    console.log("ALTER TABLE productions ADD COLUMN IF NOT EXISTS body text;");
  }
} else {
  console.log("Column 'body' exists! Data:", JSON.stringify(data));
}
