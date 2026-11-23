import { uploadWithTicket } from "@/services/mediaClientService";
import { MAX_DOCX_BYTES } from "@/constants/docxImport";

export type DocxImportResult = { html: string; warnings: string[]; imageCount: number };

async function readError(response: Response, fallback: string): Promise<string> {
  const body = (await response.json().catch(() => null)) as { error?: string } | null;
  return body?.error || fallback;
}

// Import Word côté navigateur : ticket → envoi direct du .docx au Storage →
// conversion côté serveur (mammoth). Le binaire ne transite jamais par nos
// fonctions (limite de taille de requête Vercel).
export async function importDocx(file: File, productionId?: string | null): Promise<DocxImportResult> {
  if (!/\.docx$/i.test(file.name)) throw new Error("Choisissez un document Word au format .docx.");
  if (file.size > MAX_DOCX_BYTES) throw new Error("Fichier trop volumineux (15 Mo maximum).");

  const ticketRes = await fetch("/api/productions/import-docx/ticket", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ filename: file.name, size: file.size }),
  });
  if (!ticketRes.ok) throw new Error(await readError(ticketRes, "Échec de la préparation de l'import."));
  const ticket = (await ticketRes.json()) as { path: string; token: string };

  await uploadWithTicket(ticket, file);

  const res = await fetch("/api/productions/import-docx", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ path: ticket.path, filename: file.name, productionId: productionId ?? null }),
  });
  if (!res.ok) throw new Error(await readError(res, "La conversion du document a échoué."));
  return (await res.json()) as DocxImportResult;
}
