import { NextResponse } from "next/server";
import { z } from "zod";
import { logAction } from "@/lib/audit";
import { errorResponse } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { requireProductionEditor } from "@/lib/productionAccess";
import { importDocxFromStorage } from "@/services/docxImportService";

const bodySchema = z.object({
  path: z.string().min(1),
  filename: z.string().min(1).max(255),
  productionId: z.string().uuid().optional().nullable(),
});

// Convertit un .docx déjà déposé dans le Storage en HTML d'article. Rien n'est
// enregistré sur la production : le HTML est renvoyé à l'éditeur, l'équipe
// relit puis enregistre elle-même. Les images rejoignent la médiathèque.
export async function POST(request: Request) {
  try {
    await requireProductionEditor();
    const input = bodySchema.parse(await request.json().catch(() => null));
    const result = await importDocxFromStorage(input.path, input.filename);
    logger.info("production.docx.imported", { images: result.imageCount, warnings: result.warnings.length });
    await logAction("import", {
      entityType: "production",
      entityId: input.productionId ?? undefined,
      summary: `Import Word : ${input.filename} (${result.imageCount} image${result.imageCount > 1 ? "s" : ""})`,
    });
    return NextResponse.json(result);
  } catch (error) {
    return errorResponse(error);
  }
}
