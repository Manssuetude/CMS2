// Champ honeypot partagé par tous les formulaires publics (FormModal,
// NewsletterForm) : invisible pour un visiteur humain, souvent rempli
// automatiquement par les bots. Nom générique ("website") volontairement
// plausible pour un champ de formulaire classique.
export const HONEYPOT_FIELD_NAME = "website";

export function isHoneypotFilled(formData: FormData): boolean {
  const value = formData.get(HONEYPOT_FIELD_NAME);
  return typeof value === "string" && value.trim().length > 0;
}
