import { Resend } from "resend";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

// Envoi tolérant : si RESEND_API_KEY est absent, on n'envoie rien (le lien reste
// affiché dans l'admin). Retourne true si l'email est parti. Les échecs sont journalisés
// (visibles dans les logs Vercel) pour rester diagnosticables — bac à sable Resend,
// domaine non vérifié, clé absente, etc.
export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  if (!env.RESEND_API_KEY) {
    logger.warn("sendEmail: RESEND_API_KEY absente — e-mail non envoyé (redéploiement requis ?)", { to });
    return false;
  }
  try {
    const resend = new Resend(env.RESEND_API_KEY);
    const { error } = await resend.emails.send({ from: env.EMAIL_FROM, to, subject, html });
    if (error) {
      logger.error("sendEmail: Resend a refusé l'envoi", { to, from: env.EMAIL_FROM, reason: error.message });
      return false;
    }
    return true;
  } catch (e) {
    logger.error("sendEmail: exception lors de l'envoi", { to, reason: e instanceof Error ? e.message : String(e) });
    return false;
  }
}

export function inviteEmailHtml(link: string, roleLabel: string): string {
  return `
  <div style="font-family:Inter,Arial,sans-serif;max-width:520px;margin:0 auto;color:#1c1714">
    <h1 style="font-family:Georgia,serif;font-size:22px;color:#1c1714">Bienvenue chez Manssuétude</h1>
    <p style="font-size:15px;line-height:1.6;color:#574f48">
      Vous avez été invité·e à rejoindre l'espace d'administration de Manssuétude
      avec le rôle <strong>${roleLabel}</strong>.
    </p>
    <p style="font-size:15px;line-height:1.6;color:#574f48">
      Cliquez ci-dessous pour définir votre nom et votre mot de passe :
    </p>
    <p style="margin:24px 0">
      <a href="${link}"
         style="background:#ff4d12;color:#fff;text-decoration:none;padding:12px 22px;border-radius:6px;font-weight:600;display:inline-block">
        Activer mon compte
      </a>
    </p>
    <p style="font-size:12px;color:#8a7f76">Ce lien est personnel et à usage unique.</p>
  </div>`;
}
