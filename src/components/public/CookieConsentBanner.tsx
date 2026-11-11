"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CONSENT_OPEN_EVENT, readStoredConsent, writeStoredConsent, type ConsentValue } from "@/lib/consent";

// Bandeau de consentement : affiché tant qu'aucun choix valide n'est stocké
// (premier passage, ou choix de plus de 6 mois), et rouvert à la demande via le
// lien « Gérer les cookies » du pied de page pour changer d'avis.
export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState<ConsentValue | null>(null);

  useEffect(() => {
    const stored = readStoredConsent();
    setCurrent(stored);
    setVisible(stored === null);
    function onOpen() {
      setCurrent(readStoredConsent());
      setVisible(true);
    }
    window.addEventListener(CONSENT_OPEN_EVENT, onOpen);
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, onOpen);
  }, []);

  function choose(value: ConsentValue) {
    writeStoredConsent(value);
    setCurrent(value);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="cookie-banner" role="dialog" aria-label="Consentement cookies">
      <div className="cookie-banner-text">
        <p className="cookie-banner-title">Cookies</p>
        <p>
          Ce site utilise des cookies de mesure d&apos;audience (Vercel Analytics, Vercel Speed Insights et Google
          Analytics) pour comprendre comment il est utilisé et sa performance. Rien n&apos;est activé sans votre accord
          et aucune donnée n&apos;est revendue. Détails sur notre{" "}
          <Link href="/politique-cookies">politique cookies</Link>.
        </p>
        {current && (
          <p className="cookie-banner-current">
            Votre choix actuel : <strong>{current === "accepted" ? "accepté" : "refusé"}</strong>.
          </p>
        )}
      </div>
      <div className="cookie-banner-actions">
        <button type="button" className="cookie-banner-decline" onClick={() => choose("declined")}>
          Refuser
        </button>
        <button type="button" className="cookie-banner-accept" onClick={() => choose("accepted")}>
          Accepter
        </button>
      </div>
    </div>
  );
}
