import { requireRole } from "@/lib/auth";
import { formRepository } from "@/repositories/formRepository";
import type { FormSubmission } from "@/types/cms";

const headers: Array<keyof FormSubmission> = ["id", "formType", "status", "receivedAt", "data", "notes"];

export async function GET(request: Request) {
  await requireRole(["admin", "editor"]);
  const type = new URL(request.url).searchParams.get("type");
  const all = await formRepository.list();
  const rows = type ? all.filter((r) => r.formType === type) : all;
  const csv = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((key) => {
          const value = row[key];
          const normalized = typeof value === "object" && value !== null ? JSON.stringify(value) : String(value ?? "");
          return `"${normalized.replaceAll('"', '""')}"`;
        })
        .join(","),
    ),
  ].join("\n");

  return new Response(csv, {
    headers: {
      "content-type": "text/csv;charset=utf-8",
      "content-disposition": "attachment; filename=formulaires-manssuetude.csv",
    },
  });
}
