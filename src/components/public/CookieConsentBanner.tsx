"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { readStoredConsent, writeStoredConsent, type ConsentValue } from "@/lib/consent";

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(readStoredConsent() === null);
  }, []);

  function choose(value: ConsentValue) {
    writeStoredConsent(value);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="cookie-banner" role="dialog" aria-label="Consentement cookies">
      <div className="cookie-banner-text">
        <p className="cookie-banner-title">Cookies</p>
        <p>
          Ce site utilise des cookies de mesure d&apos;audience (Vercel Analytics et Vercel Speed Insights) pour
          comprendre comment il est utilisé et sa performance. Aucune donnée n&apos;est revendue. Détails sur notre{" "}
          <Link href="/politique-cookies">politique cookies</Link>.
        </p>
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
