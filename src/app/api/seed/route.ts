import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";

export async function POST() {
  await requireRole(["admin"]);
  return NextResponse.json(
    {
      ok: false,
      message: "Utilisez npm run seed côté serveur pour éviter d'exposer la clé service Supabase.",
    },
    { status: 409 },
  );
}
