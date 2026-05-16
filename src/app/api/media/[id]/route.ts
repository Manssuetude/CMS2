import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { mediaRepository } from "@/repositories/mediaRepository";

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireRole(["admin", "editor"]);
  const { id } = await params;
  await mediaRepository.remove(id);
  return NextResponse.json({ ok: true });
}
