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

// Libellés utilisés dans l'accusé de réception envoyé au visiteur après
// soumission d'un des formulaires publics (chapitre 6 du plan V2). "followUp"
// distingue les demandes qui appellent un vrai échange individuel de celles
// qui alimentent un contenu existant et sont juste prises en compte — même
// distinction que SUCCESS_MESSAGES dans FormModal.tsx (pop-up de confirmation).
const RECONTACT = "Quelqu'un de l'équipe Manssuétude va l'étudier et vous recontactera par email pour la suite.";
const NOTED = "Elle est prise en compte et sera étudiée par l'équipe éditoriale.";

const SUBMISSION_LABELS: Record<string, { subject: string; intro: string; followUp: string }> = {
  join: {
    subject: "Votre candidature a bien été reçue",
    intro: "Nous avons bien reçu votre candidature pour rejoindre Manssuétude.",
    followUp:
      "L'équipe Manssuétude va l'étudier et reviendra vers vous par email sous 1 à 2 semaines pour vous proposer un premier échange.",
  },
  project: {
    subject: "Votre proposition de projet a bien été reçue",
    intro: "Nous avons bien reçu votre proposition de projet.",
    followUp: RECONTACT,
  },
  content: {
    subject: "Votre contribution a bien été reçue",
    intro: "Nous avons bien reçu votre proposition de contribution.",
    followUp: NOTED,
  },
  partner: {
    subject: "Votre demande de partenariat a bien été reçue",
    intro: "Nous avons bien reçu votre demande de partenariat.",
    followUp: RECONTACT,
  },
  don: {
    subject: "Votre message a bien été reçu",
    intro: "Nous avons bien reçu votre message concernant un soutien à Manssuétude.",
    followUp: "Quelqu'un de l'équipe vous recontactera par email pour organiser votre don.",
  },
  theme: {
    subject: "Votre proposition de thème a bien été reçue",
    intro: "Nous avons bien reçu votre proposition de thème.",
    followUp: NOTED,
  },
  sub_theme: {
    subject: "Votre proposition de sous-thème a bien été reçue",
    intro: "Nous avons bien reçu votre proposition de sous-thème.",
    followUp: NOTED,
  },
  event: {
    subject: "Votre proposition d'événement a bien été reçue",
    intro: "Nous avons bien reçu votre proposition d'événement.",
    followUp: NOTED,
  },
  activity: {
    subject: "Votre proposition d'activité a bien été reçue",
    intro: "Nous avons bien reçu votre proposition d'activité.",
    followUp: NOTED,
  },
  production: {
    subject: "Votre contribution a bien été reçue",
    intro: "Nous avons bien reçu votre proposition de contribution.",
    followUp: RECONTACT,
  },
  contact: {
    subject: "Votre message a bien été reçu",
    intro: "Nous avons bien reçu votre message.",
    followUp: "Nous vous répondrons par email dans les meilleurs délais.",
  },
};

export function submissionConfirmationSubject(formType: string): string {
  return SUBMISSION_LABELS[formType]?.subject ?? "Votre demande a bien été reçue";
}

export function submissionConfirmationHtml(formType: string): string {
  const intro = SUBMISSION_LABELS[formType]?.intro ?? "Nous avons bien reçu votre demande.";
  const followUp = SUBMISSION_LABELS[formType]?.followUp ?? NOTED;
  return `
  <div style="font-family:Inter,Arial,sans-serif;max-width:520px;margin:0 auto;color:#1c1714">
    <h1 style="font-family:Georgia,serif;font-size:22px;color:#1c1714">Merci !</h1>
    <p style="font-size:15px;line-height:1.6;color:#574f48">${intro}</p>
    <p style="font-size:15px;line-height:1.6;color:#574f48">${followUp}</p>
    <p style="font-size:12px;color:#8a7f76">Cet email est envoyé automatiquement, merci de ne pas y répondre.</p>
  </div>`;
}

export function inviteEmailHtml(link: string, roleLabel: string): string {
  const logoUrl = `${env.NEXT_PUBLIC_SITE_URL}/assets/photos/logo-manssuetude.png`;
  return `
  <div style="font-family:Inter,Arial,sans-serif;max-width:520px;margin:0 auto;color:#1c1714">
    <p style="text-align:center;margin:0 0 20px">
      <img src="${logoUrl}" alt="Manssuétude" width="64" height="64"
           style="width:64px;height:64px;display:inline-block;border:0" />
    </p>
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
