import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/db";
import { isCollectionName } from "@/constants/collections";
import { AppError, errorResponse } from "@/lib/errors";

export async function PATCH(request: Request, { params }: { params: Promise<{ collection: string; id: string }> }) {
  try {
    await requireRole(["admin", "editor"]);
    const { collection, id } = await params;
    if (!isCollectionName(collection)) throw new AppError("Collection inconnue.", 404, "UNKNOWN_COLLECTION");
    const payload = await request.json();
    const db = getSupabaseAdmin();
    const { data, error } = await db
      .from(collection)
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ collection: string; id: string }> }) {
  try {
    await requireRole(["admin"]);
    const { collection, id } = await params;
    if (!isCollectionName(collection)) throw new AppError("Collection inconnue.", 404, "UNKNOWN_COLLECTION");
    const db = getSupabaseAdmin();
    const { error } = await db.from(collection).delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
