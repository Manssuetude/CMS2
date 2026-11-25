import { NextResponse } from "next/server";
import { AppError, errorResponse } from "@/lib/errors";
import { createUploadTicket } from "@/lib/media";
import { requireProductionEditor } from "@/lib/productionAccess";
import { DOCX_IMPORT_FOLDER } from "@/services/docxImportService";
import { MAX_DOCX_BYTES } from "@/constants/docxImport";

// Ticket d'envoi direct d'un .docx vers le Storage (dossier temporaire
// `imports/`), sans faire transiter le binaire par la fonction serveur (limite
// de taille de requête Vercel). Voir /api/productions/import-docx.
export async function POST(request: Request) {
  try {
    await requireProductionEditor();
    const body = await request.json().catch(() => null);
    const filename = typeof body?.filename === "string" ? body.filename.trim() : "";
    const size = typeof body?.size === "number" ? body.size : 0;
    if (!/\.docx$/i.test(filename)) {
      throw new AppError("Choisissez un document Word au format .docx.", 400, "DOCX_TYPE");
    }
    if (size > MAX_DOCX_BYTES) {
      throw new AppError("Fichier trop volumineux (15 Mo maximum).", 400, "DOCX_TOO_LARGE");
    }
    return NextResponse.json(await createUploadTicket(filename, DOCX_IMPORT_FOLDER));
  } catch (error) {
    return errorResponse(error);
  }
}
