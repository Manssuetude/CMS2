import { requireRole } from "@/lib/auth";
import { formRepository } from "@/repositories/formRepository";
import { buildFormsCsv } from "@/lib/formsCsv";

export async function GET(request: Request) {
  await requireRole(["admin", "editor"]);
  const type = new URL(request.url).searchParams.get("type");
  const all = await formRepository.list();
  const rows = type ? all.filter((r) => r.formType === type) : all;

  const csv = buildFormsCsv(rows);
  const exportDate = new Date().toISOString().slice(0, 10);

  return new Response(csv, {
    headers: {
      "content-type": "text/csv;charset=utf-8",
      "content-disposition": `attachment; filename=formulaires-manssuetude-${exportDate}.csv`,
    },
  });
}
