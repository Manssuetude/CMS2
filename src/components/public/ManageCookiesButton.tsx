"use client";

import { openConsentBanner } from "@/lib/consent";

// Lien « Gérer les cookies » du pied de page : rouvre le bandeau de consentement
// pour changer son choix à tout moment (accepter ↔ refuser).
export function ManageCookiesButton() {
  return (
    <button type="button" className="footer-cookie-button" onClick={openConsentBanner}>
      Gérer les cookies
    </button>
  );
}
