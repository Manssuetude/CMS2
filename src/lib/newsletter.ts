import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

// Intégration Brevo minimale : un seul appel REST (créer/mettre à jour un
// contact), pas besoin du SDK complet @getbrevo/brevo (couvre CRM, e-commerce,
// deals... très au-delà du besoin ici). Le lien de désinscription est géré
// nativement par Brevo dans les emails envoyés depuis leur plateforme —
// rien à construire côté application pour ça.
const BREVO_CONTACTS_URL = "https://api.brevo.com/v3/contacts";

export type NewsletterSubscribeResult = { success: boolean; error?: string };

export async function subscribeToNewsletter(email: string): Promise<NewsletterSubscribeResult> {
  if (!env.BREVO_API_KEY) {
    logger.warn("subscribeToNewsletter: BREVO_API_KEY absente — inscription non envoyée", { email });
    return { success: false, error: "Configuration manquante." };
  }

  try {
    const res = await fetch(BREVO_CONTACTS_URL, {
      method: "POST",
      headers: {
        "api-key": env.BREVO_API_KEY,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({ email, updateEnabled: true }),
    });

    // 204 = créé, 400 "duplicate_parameter" = déjà inscrit (on considère ça comme un succès côté visiteur).
    if (res.ok || res.status === 204) return { success: true };
    const body = await res.json().catch(() => ({}));
    if (res.status === 400 && (body as { code?: string }).code === "duplicate_parameter") {
      return { success: true };
    }

    logger.error("subscribeToNewsletter: Brevo a refusé l'inscription", { email, status: res.status, body });
    return { success: false, error: "Erreur lors de l'inscription." };
  } catch (e) {
    logger.error("subscribeToNewsletter: exception", { email, reason: e instanceof Error ? e.message : String(e) });
    return { success: false, error: "Erreur lors de l'inscription." };
  }
}
