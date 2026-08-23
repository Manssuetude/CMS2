export type PublicFormType =
  | "join"
  | "project"
  | "content"
  | "partner"
  | "don"
  | "theme"
  | "sub_theme"
  | "event"
  | "activity"
  | "production"
  | "contact";

export type FormFieldDefinition = {
  name: string;
  label: string;
  type: "text" | "email" | "checkbox" | "file" | "textarea";
  required?: boolean;
  hint?: string;
};

export const formDefinitions: Record<PublicFormType, FormFieldDefinition[]> = {
  join: [
    { name: "firstName", label: "Prénom", type: "text", required: true },
    { name: "lastName", label: "Nom", type: "text", required: true },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "phone", label: "Téléphone", type: "text", required: true },
    { name: "city", label: "Ville ou région", type: "text", required: true },
    { name: "interests", label: "Centres d'intérêt", type: "text" },
    {
      name: "motivation",
      label: "Motivation",
      type: "textarea",
      hint: "Parlez-nous de votre parcours, ce qui vous amène vers Manssuétude et comment vous aimeriez contribuer.",
    },
    {
      name: "consent",
      label: "Consentement RGPD",
      type: "checkbox",
      required: true,
      hint: "Le RGPD est le Règlement général sur la protection des données. En cochant cette case, vous autorisez Manssuétude à conserver et traiter les informations de ce formulaire uniquement dans le cadre de votre demande. Vos données ne sont jamais revendues et vous pouvez demander leur suppression à tout moment.",
    },
  ],
  project: [
    { name: "name", label: "Nom", type: "text" },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "projectTitle", label: "Titre du projet", type: "text" },
    { name: "description", label: "Description", type: "text" },
    { name: "objective", label: "Objectif", type: "text" },
    { name: "resources", label: "Ressources nécessaires", type: "text" },
    { name: "progress", label: "État d'avancement", type: "text" },
    { name: "commission", label: "Commission liée", type: "text" },
    {
      name: "consent",
      label: "Consentement RGPD",
      type: "checkbox",
      required: true,
      hint: "En cochant cette case, vous autorisez Manssuétude à conserver et traiter les informations de cette proposition de projet uniquement pour l'étudier et vous recontacter. Vos données ne sont jamais revendues et vous pouvez demander leur suppression à tout moment.",
    },
  ],
  content: [
    { name: "name", label: "Nom", type: "text" },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "contentType", label: "Type de contenu", type: "text" },
    { name: "title", label: "Titre", type: "text" },
    { name: "summary", label: "Résumé", type: "text" },
    { name: "theme", label: "Thème associé", type: "text" },
    {
      name: "consent",
      label: "Consentement RGPD",
      type: "checkbox",
      required: true,
      hint: "En cochant cette case, vous autorisez Manssuétude à conserver et traiter les informations de cette proposition de contenu uniquement pour l'étudier et vous recontacter. Vos données ne sont jamais revendues et vous pouvez demander leur suppression à tout moment.",
    },
  ],
  partner: [
    { name: "organization", label: "Organisation", type: "text" },
    { name: "contact", label: "Contact", type: "text" },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "partnershipType", label: "Type de partenariat", type: "text" },
    { name: "message", label: "Message", type: "text" },
    {
      name: "consent",
      label: "Consentement RGPD",
      type: "checkbox",
      required: true,
      hint: "En cochant cette case, vous autorisez Manssuétude à conserver et traiter les informations de cette demande de partenariat uniquement pour l'étudier et vous recontacter. Vos données ne sont jamais revendues et vous pouvez demander leur suppression à tout moment.",
    },
  ],
  don: [
    { name: "amount", label: "Montant", type: "text" },
    { name: "frequency", label: "Fréquence", type: "text" },
    { name: "name", label: "Nom", type: "text" },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "message", label: "Message optionnel", type: "text" },
    {
      name: "consent",
      label: "Consentement RGPD",
      type: "checkbox",
      required: true,
      hint: "En cochant cette case, vous autorisez Manssuétude à conserver et traiter les informations de cette demande de don uniquement pour la traiter et vous recontacter. Vos données ne sont jamais revendues et vous pouvez demander leur suppression à tout moment.",
    },
  ],
  // Plus proposé publiquement (remplacé par "sub_theme", ci-dessous) — conservé
  // uniquement pour l'affichage correct des soumissions historiques en admin.
  theme: [
    { name: "name", label: "Nom", type: "text", required: true },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "themeTitle", label: "Thème proposé", type: "text", required: true },
    { name: "description", label: "Pourquoi ce thème ?", type: "text" },
    {
      name: "consent",
      label: "Consentement RGPD",
      type: "checkbox",
      required: true,
      hint: "En cochant cette case, vous autorisez Manssuétude à conserver et traiter les informations de cette proposition de thème uniquement pour l'étudier et vous recontacter. Vos données ne sont jamais revendues et vous pouvez demander leur suppression à tout moment.",
    },
  ],
  // Proposé depuis chaque page de thème (pas depuis /themes) — "themeTitle" est
  // injecté en champ caché (voir ThemeDetail.tsx) plutôt que saisi par le
  // visiteur, pour que le sous-thème proposé reste rattaché au bon thème.
  sub_theme: [
    { name: "name", label: "Nom", type: "text", required: true },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "themeTitle", label: "Thème parent", type: "text", required: true },
    { name: "subThemeTitle", label: "Sous-thème proposé", type: "text", required: true },
    { name: "description", label: "Pourquoi ce sous-thème ?", type: "text" },
    {
      name: "consent",
      label: "Consentement RGPD",
      type: "checkbox",
      required: true,
      hint: "En cochant cette case, vous autorisez Manssuétude à conserver et traiter les informations de cette proposition de sous-thème uniquement pour l'étudier et vous recontacter. Vos données ne sont jamais revendues et vous pouvez demander leur suppression à tout moment.",
    },
  ],
  event: [
    { name: "name", label: "Nom", type: "text", required: true },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "eventTitle", label: "Titre de l'événement", type: "text", required: true },
    { name: "format", label: "Format (atelier, débat, séance…)", type: "text" },
    { name: "description", label: "Description / objectif", type: "textarea" },
    {
      name: "consent",
      label: "Consentement RGPD",
      type: "checkbox",
      required: true,
      hint: "En cochant cette case, vous autorisez Manssuétude à conserver et traiter les informations de cette proposition d'événement uniquement pour l'étudier et vous recontacter. Vos données ne sont jamais revendues et vous pouvez demander leur suppression à tout moment.",
    },
  ],
  // "Activité" ici = technique/format d'animation du répertoire (/activites,
  // Fishbowl, Hot Takes...), pas un événement daté — les deux entités sont
  // distinctes depuis le renommage Activité→Événement (voir CLAUDE.md).
  activity: [
    { name: "firstName", label: "Prénom", type: "text", required: true },
    { name: "lastName", label: "Nom", type: "text", required: true },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "activityTitle", label: "Activité proposée", type: "text", required: true },
    { name: "description", label: "Description de l'activité", type: "textarea" },
    { name: "useCase", label: "Cas d'application", type: "textarea" },
    { name: "other", label: "Autre (liens, précisions...)", type: "textarea" },
    {
      name: "consent",
      label: "Consentement RGPD",
      type: "checkbox",
      required: true,
      hint: "En cochant cette case, vous autorisez Manssuétude à conserver et traiter les informations de cette proposition d'activité uniquement pour l'étudier et vous recontacter. Vos données ne sont jamais revendues et vous pouvez demander leur suppression à tout moment.",
    },
  ],
  // Proposer une contribution sur une production précise — "productionTitle" est
  // injecté en champ caché (voir ProductionDetail.tsx), pas saisi par le
  // visiteur, pour que la contribution reste rattachée à la bonne production.
  // Distinct de "content" (bouton "Contribuer" partagé par Thèmes/Sous-thèmes,
  // sans production précise) pour ne pas leur imposer ce champ de contexte.
  production: [
    { name: "firstName", label: "Prénom", type: "text", required: true },
    { name: "lastName", label: "Nom", type: "text", required: true },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "productionTitle", label: "Production concernée", type: "text", required: true },
    { name: "contributionTitle", label: "Titre de votre contribution", type: "text", required: true },
    { name: "description", label: "Description de la contribution", type: "textarea" },
    { name: "other", label: "Autre (liens, précisions...)", type: "textarea" },
    {
      name: "consent",
      label: "Consentement RGPD",
      type: "checkbox",
      required: true,
      hint: "En cochant cette case, vous autorisez Manssuétude à conserver et traiter les informations de cette contribution uniquement pour l'étudier et vous recontacter. Vos données ne sont jamais revendues et vous pouvez demander leur suppression à tout moment.",
    },
  ],
  // Champs du formulaire de contact (src/components/public/ContactForm.tsx) —
  // composant autonome, pas rendu via formDefinitions, mais listé ici pour que
  // l'admin (FormSubmissionRow) affiche des libellés français plutôt que les
  // noms de champs bruts.
  contact: [
    { name: "name", label: "Nom", type: "text", required: true },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "subject", label: "Sujet", type: "text" },
    { name: "message", label: "Message", type: "text", required: true },
    {
      name: "consent",
      label: "Consentement RGPD",
      type: "checkbox",
      required: true,
      hint: "En cochant cette case, vous autorisez Manssuétude à conserver et traiter les informations de ce message uniquement pour vous répondre. Vos données ne sont jamais revendues et vous pouvez demander leur suppression à tout moment.",
    },
  ],
};

export function toSubmissionFormType(formType: PublicFormType) {
  return formType === "don" ? "donation" : formType;
}
