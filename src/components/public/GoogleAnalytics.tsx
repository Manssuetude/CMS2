"use client";

import { useEffect } from "react";
import Script from "next/script";
import { GA_MEASUREMENT_ID } from "@/lib/consent";

// Google Analytics en Consent Mode « basique » : ce composant n'est rendu que
// dans <ConsentGate>, donc après un clic sur « Accepter ». Avant cela (et après
// un refus), gtag.js n'est jamais injecté et aucune requête ne part vers Google.
// Seule la mesure d'audience est accordée : les signaux publicitaires restent
// refusés (aucun usage publicitaire sur ce site).
// Durée de vie des cookies _ga ramenée de 2 ans (défaut Google) à 13 mois,
// maximum recommandé par la CNIL pour les cookies de mesure d'audience.
const GA_COOKIE_EXPIRES_SECONDS = 13 * 30 * 24 * 60 * 60;

const GA_INIT = `window.dataLayer = window.dataLayer || [];
function gtag(){window.dataLayer.push(arguments);}
window.gtag = gtag;
gtag('consent', 'default', {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'granted'
});
gtag('js', new Date());
gtag('config', '${GA_MEASUREMENT_ID}', { cookie_expires: ${GA_COOKIE_EXPIRES_SECONDS} });`;

// Vrai dès le premier montage : un montage suivant est une ré-acceptation dans
// la même page (après « Gérer les cookies » → refuser → accepter).
let mountedBefore = false;

export function GoogleAnalytics() {
  // Ré-acceptation : les scripts sont déjà chargés (next/script ne les réexécute
  // pas), on réactive la mesure. Jamais au premier montage, où GA_INIT envoie
  // déjà la page vue (sinon elle serait comptée deux fois).
  useEffect(() => {
    if (!mountedBefore) {
      mountedBefore = true;
      return;
    }
    if (typeof window.gtag !== "function") return;
    window.gtag("consent", "update", { analytics_storage: "granted" });
    window.gtag("config", GA_MEASUREMENT_ID, { cookie_expires: GA_COOKIE_EXPIRES_SECONDS });
  }, []);

  return (
    <>
      <Script id="ga4-init" strategy="afterInteractive">
        {GA_INIT}
      </Script>
      <Script
        id="ga4-src"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
    </>
  );
}
