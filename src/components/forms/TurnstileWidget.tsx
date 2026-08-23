"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: { sitekey: string }) => string;
      remove: (widgetId: string) => void;
    };
  }
}

// Widget anti-spam Cloudflare Turnstile. Le champ caché "cf-turnstile-response"
// qu'il injecte dans le <form> parent est vérifié côté serveur (voir
// src/lib/turnstile.ts) avant d'accepter une soumission. Si la clé de site
// n'est pas configurée, le widget ne s'affiche simplement pas (dev local) —
// le honeypot reste la protection active dans ce cas.
export function TurnstileWidget() {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);

  function renderWidget() {
    if (!SITE_KEY || !containerRef.current || !window.turnstile || widgetId.current) return;
    widgetId.current = window.turnstile.render(containerRef.current, { sitekey: SITE_KEY });
  }

  useEffect(() => {
    if (window.turnstile) renderWidget();
    return () => {
      if (widgetId.current && window.turnstile) {
        window.turnstile.remove(widgetId.current);
        widgetId.current = null;
      }
    };
  }, []);

  if (!SITE_KEY) return null;

  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="lazyOnload" onLoad={renderWidget} />
      <div ref={containerRef} className="turnstile-widget" />
    </>
  );
}
