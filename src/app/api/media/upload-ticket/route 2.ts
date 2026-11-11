import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { createUploadTicket } from "@/lib/media";
import { ALLOWED_EXTENSIONS } from "@/utils/uploadValidation";
import { errorResponse, AppError } from "@/lib/errors";

// Requête JSON minuscule (pas de binaire) : prépare un envoi direct du
// fichier vers Supabase Storage depuis le navigateur, qui contourne la
// limite de taille de requête des fonctions Vercel — voir lib/media.ts.
export async function POST(request: Request) {
  try {
    await requireRole(["admin", "editor"]);
    const body = await request.json().catch(() => null);
    const filename = typeof body?.filename === "string" ? body.filename.trim() : "";
    if (!filename) {
      throw new AppError("Nom de fichier manquant.", 400, "MISSING_FILENAME");
    }
    const ext = filename.split(".").pop()?.toLowerCase() ?? "";
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      throw new AppError(`Type de fichier non autorisé (.${ext || "?"}).`, 400, "UPLOAD_TYPE_NOT_ALLOWED");
    }
    const ticket = await createUploadTicket(filename);
    return NextResponse.json(ticket);
  } catch (error) {
    return errorResponse(error);
  }
}
