import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { runFormDigestIfDue } from "@/lib/formDigest";
import { archiveProcessedFormSubmissions } from "@/lib/formArchive";
import { logger } from "@/lib/logger";

// Déclenché quotidiennement par Vercel Cron (voir vercel.json). Vercel ajoute
// automatiquement l'en-tête "Authorization: Bearer <CRON_SECRET>" sur les
// invocations cron dès que la variable d'environnement CRON_SECRET est
// définie — à configurer dans les réglages Vercel du projet.
//
// Regroupe deux tâches d'entretien quotidien des formulaires (envoi groupé +
// archivage auto des soumissions traitées) sur un seul créneau de cron plutôt
// que d'en consommer deux pour des tâches aussi légères.
export async function GET(request: Request) {
  if (env.CRON_SECRET) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
    }
  } else {
    logger.warn("cron.form-digest: CRON_SECRET absente — endpoint non protégé");
  }

  const digest = await runFormDigestIfDue();
  const archive = await archiveProcessedFormSubmissions();
  return NextResponse.json({ digest, archive });
}
