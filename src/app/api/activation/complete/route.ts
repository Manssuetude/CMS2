import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/db";
import { userRepository } from "@/repositories/userRepository";

// Finalise l'activation : met à jour le nom de l'utilisateur dans la table `users`.
// Sécurisé par le jeton d'accès (Bearer) issu de la session d'invitation.
export async function POST(request: Request) {
  const auth = request.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const body = (await request.json().catch(() => ({}))) as { name?: string };
  const name = (body.name ?? "").trim();

  if (!token || !name) return NextResponse.json({ ok: false }, { status: 400 });

  const db = getSupabaseAdmin();
  const {
    data: { user },
    error,
  } = await db.auth.getUser(token);
  if (error || !user) return NextResponse.json({ ok: false }, { status: 401 });

  await userRepository.setName(user.id, name);
  return NextResponse.json({ ok: true });
}
