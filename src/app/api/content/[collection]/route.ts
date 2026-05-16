import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/db";
import { isCollectionName } from "@/constants/collections";
import { AppError, errorResponse } from "@/lib/errors";

export async function GET(_: Request, { params }: { params: Promise<{ collection: string }> }) {
  try {
    await requireRole(["admin", "editor", "viewer"]);
    const { collection } = await params;
    if (!isCollectionName(collection)) throw new AppError("Collection inconnue.", 404, "UNKNOWN_COLLECTION");
    const db = getSupabaseAdmin();
    const { data, error } = await db.from(collection).select("*").order("updated_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ collection: string }> }) {
  try {
    await requireRole(["admin", "editor"]);
    const { collection } = await params;
    if (!isCollectionName(collection)) throw new AppError("Collection inconnue.", 404, "UNKNOWN_COLLECTION");
    const payload = await request.json();
    const db = getSupabaseAdmin();
    const { data, error } = await db.from(collection).insert(payload).select().single();
    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    return errorResponse(error);
  }
}
