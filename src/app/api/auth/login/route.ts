import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { encodeSession, sessionCookieName } from "@/lib/auth";
import { authRepository } from "@/repositories/authRepository";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const user = await authRepository.verify(email, password);

  const origin = new URL(request.url).origin;
  if (!user) return NextResponse.redirect(`${origin}/admin/login?error=1`, 303);

  const cookieStore = await cookies();
  cookieStore.set(sessionCookieName, encodeSession({ userId: user.id, email: user.email, role: user.role }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return NextResponse.redirect(`${origin}/admin/dashboard`, 303);
}
