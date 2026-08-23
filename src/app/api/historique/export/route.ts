import { requireAdmin } from "@/lib/auth";
import { auditRepository, type AuditLog } from "@/repositories/auditRepository";

const headers: Array<keyof AuditLog> = [
  "createdAt",
  "actorEmail",
  "actorRole",
  "action",
  "entityType",
  "entityId",
  "summary",
];

export async function GET(request: Request) {
  await requireAdmin();
  const action = new URL(request.url).searchParams.get("action");
  const logs = await auditRepository.list({ action: action || undefined, limit: 5000 });

  const csv = [
    headers.join(","),
    ...logs.map((row) => headers.map((key) => `"${String(row[key] ?? "").replaceAll('"', '""')}"`).join(",")),
  ].join("\n");

  return new Response(csv, {
    headers: {
      "content-type": "text/csv;charset=utf-8",
      "content-disposition": "attachment; filename=historique-manssuetude.csv",
    },
  });
}
