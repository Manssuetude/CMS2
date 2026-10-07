import { formRepository } from "@/repositories/formRepository";
import { buildFormsCsv } from "@/lib/formsCsv";
import { verifyFormDigestToken } from "@/lib/formDigestToken";
import { errorResponse, AppError } from "@/lib/errors";

// Téléchargement sans connexion admin : le jeton (signé, expirant 14 jours
// après l'envoi de l'email groupé — voir lib/formDigest.ts) fait office
// d'autorisation, à la place d'une session.
export async function GET(request: Request) {
  try {
    const token = new URL(request.url).searchParams.get("token") ?? "";
    const range = verifyFormDigestToken(token);
    if (!range) {
      throw new AppError("Ce lien de téléchargement est invalide ou a expiré.", 403, "INVALID_DIGEST_TOKEN");
    }

    const all = await formRepository.list();
    const rows = all.filter((row) => row.receivedAt >= range.from && row.receivedAt <= range.to);

    const csv = buildFormsCsv(rows);
    const fromDate = range.from.slice(0, 10);
    const toDate = range.to.slice(0, 10);

    return new Response(csv, {
      headers: {
        "content-type": "text/csv;charset=utf-8",
        "content-disposition": `attachment; filename=inscriptions-manssuetude-${fromDate}-au-${toDate}.csv`,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
