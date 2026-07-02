import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const origin = new URL(request.url).origin;

  if (!email || !password) {
    return NextResponse.redirect(`${origin}/admin/login?error=1`, 303);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return NextResponse.redirect(`${origin}/admin/login?error=1`, 303);
  }

  return NextResponse.redirect(`${origin}/admin/dashboard`, 303);
}
