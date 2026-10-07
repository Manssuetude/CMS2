import { SITE_URL } from "@/constants/site";
import { FORM_TYPE_LABEL } from "@/constants/forms";
import { sendEmail } from "@/lib/email";
import { logger } from "@/lib/logger";
import { siteSettingsRepository } from "@/repositories/siteSettingsRepository";
import { formRepository } from "@/repositories/formRepository";
import { signFormDigestToken } from "@/lib/formDigestToken";
import type { FormSubmission } from "@/types/cms";

const DAY_MS = 24 * 60 * 60 * 1000;
const DOWNLOAD_LINK_VALIDITY_DAYS = 14;

function contactName(data: Record<string, unknown>): string {
  const first = typeof data.firstName === "string" ? data.firstName.trim() : "";
  const last = typeof data.lastName === "string" ? data.lastName.trim() : "";
  if (first || last) return [first, last].filter(Boolean).join(" ");
  const name = typeof data.name === "string" ? data.name.trim() : "";
  return name || "(nom non renseigné)";
}

function digestEmailHtml(submissions: FormSubmission[], downloadUrl: string, intervalDays: number): string {
  const plural = submissions.length > 1 ? "s" : "";
  const rows = submissions
    .map((s) => {
      const data = s.data as Record<string, unknown>;
      const email = typeof data.email === "string" ? data.email : "";
      const typeLabel = FORM_TYPE_LABEL[s.formType] ?? s.formType;
      return `<tr>
        <td style="padding:8px 12px;border-bottom:1px solid #e7dccf;font-size:14px;color:#1c1714">${contactName(data)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e7dccf;font-size:14px;color:#574f48">${email}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e7dccf;font-size:13px;color:#8a7f76">${typeLabel}</td>
      </tr>`;
    })
    .join("");

  const expiryDate = new Date(Date.now() + DOWNLOAD_LINK_VALIDITY_DAYS * DAY_MS).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return `
  <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;color:#1c1714">
    <h1 style="font-family:Georgia,serif;font-size:22px;color:#1c1714">${submissions.length} nouvelle${plural} inscription${plural}</h1>
    <p style="font-size:15px;line-height:1.6;color:#574f48">
      Voici les personnes qui se sont inscrites via le site au cours des ${intervalDays} derniers jours.
    </p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0">
      <thead>
        <tr>
          <th style="text-align:left;padding:8px 12px;font-size:12px;text-transform:uppercase;letter-spacing:0.04em;color:#a23c1e;border-bottom:1px solid #d5c6b4">Nom</th>
          <th style="text-align:left;padding:8px 12px;font-size:12px;text-transform:uppercase;letter-spacing:0.04em;color:#a23c1e;border-bottom:1px solid #d5c6b4">Email</th>
          <th style="text-align:left;padding:8px 12px;font-size:12px;text-transform:uppercase;letter-spacing:0.04em;color:#a23c1e;border-bottom:1px solid #d5c6b4">Formulaire</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <p style="margin:24px 0">
      <a href="${downloadUrl}"
         style="background:#ff4d12;color:#fff;text-decoration:none;padding:12px 22px;border-radius:6px;font-weight:600;display:inline-block">
        Télécharger le détail complet (CSV)
      </a>
    </p>
    <p style="font-size:12px;color:#8a7f76">Ce lien de téléchargement expire le ${expiryDate}.</p>
    <p style="font-size:12px;color:#8a7f76">Cet email est envoyé automatiquement, merci de ne pas y répondre.</p>
  </div>`;
}

export type FormDigestResult = { sent: boolean; reason: "not_due" | "no_new_submissions" | "sent" | "email_failed" };

// Appelé par le cron quotidien (/api/cron/form-digest) : n'envoie réellement
// que si l'intervalle configuré est écoulé ET qu'il y a du nouveau — sinon le
// cron tourne tous les jours pour rien, c'est voulu (il attend que l'un des
// deux critères soit rempli).
export async function runFormDigestIfDue(): Promise<FormDigestResult> {
  const settings = await siteSettingsRepository.getFormDigestSettings();
  const now = new Date();

  if (settings.lastSentAt) {
    const dueAt = new Date(new Date(settings.lastSentAt).getTime() + settings.intervalDays * DAY_MS);
    if (now < dueAt) return { sent: false, reason: "not_due" };
  }

  // Premier envoi jamais effectué : ne remonte que les derniers `intervalDays`
  // jours plutôt que tout l'historique, pour se comporter comme un envoi normal.
  const from = settings.lastSentAt ?? new Date(now.getTime() - settings.intervalDays * DAY_MS).toISOString();
  const to = now.toISOString();

  const all = await formRepository.list();
  const submissions = all.filter((s) => s.receivedAt >= from && s.receivedAt <= to);

  if (submissions.length === 0) {
    return { sent: false, reason: "no_new_submissions" };
  }

  const token = signFormDigestToken(from, to, now.getTime() + DOWNLOAD_LINK_VALIDITY_DAYS * DAY_MS);
  const downloadUrl = `${SITE_URL}/api/forms/digest-download?token=${token}`;
  const plural = submissions.length > 1 ? "s" : "";
  const subject = `${submissions.length} nouvelle${plural} inscription${plural} — Manssuétude`;

  const ok = await sendEmail(
    settings.recipientEmail,
    subject,
    digestEmailHtml(submissions, downloadUrl, settings.intervalDays),
  );
  if (ok) {
    await siteSettingsRepository.markFormDigestSent(now.toISOString());
    logger.info("formDigest.sent", { recipient: settings.recipientEmail, count: submissions.length });
  }
  return { sent: ok, reason: ok ? "sent" : "email_failed" };
}
