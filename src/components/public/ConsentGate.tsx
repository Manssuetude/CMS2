"use client";

import { useEffect, useState, type ReactNode } from "react";
import { readStoredConsent, CONSENT_CHANGE_EVENT, type ConsentValue } from "@/lib/consent";

// N'affiche ses enfants (Analytics, SpeedInsights) qu'après consentement
// explicite — conforme au principe RGPD d'opt-in (pas de mesure d'audience
// avant que le visiteur ait fait un choix).
export function ConsentGate({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<ConsentValue | null>(null);

  useEffect(() => {
    setConsent(readStoredConsent());
    function onChange(e: Event) {
      setConsent((e as CustomEvent<ConsentValue>).detail);
    }
    window.addEventListener(CONSENT_CHANGE_EVENT, onChange);
    return () => window.removeEventListener(CONSENT_CHANGE_EVENT, onChange);
  }, []);

  if (consent !== "accepted") return null;
  return <>{children}</>;
}
