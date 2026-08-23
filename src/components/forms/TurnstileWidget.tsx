"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const WIDGET_WIDTH = 300;
const WIDGET_HEIGHT = 65;

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: { sitekey: string; size?: "normal" }) => string;
      remove: (widgetId: string) => void;
    };
  }
}

// Widget anti-spam Cloudflare Turnstile. Le champ caché "cf-turnstile-response"
// qu'il injecte dans le <form> parent est vérifié côté serveur (voir
// src/lib/turnstile.ts) avant d'accepter une soumission. Si la clé de site
// n'est pas configurée, le widget ne s'affiche simplement pas (dev local) —
// le honeypot reste la protection active dans ce cas.
// Toujours rendu en taille "normal" (300×65px, rectangle large) puis mis à
// l'échelle via CSS `transform: scale()` selon la largeur disponible : les
// deux autres tailles Cloudflare ne conviennent pas en dessous de 720px —
// "compact" (150×140px) est plus haut que large (mauvais rendu visuel), et
// "flexible" a un minimum documenté de 300px (déborde quand même). La mise
// à l'échelle préserve la forme rectangulaire à n'importe quelle largeur.
export function TurnstileWidget() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const [scale, setScale] = useState(1);

  function renderWidget() {
    if (!SITE_KEY || !innerRef.current || !window.turnstile || widgetId.current) return;
    widgetId.current = window.turnstile.render(innerRef.current, { sitekey: SITE_KEY, size: "normal" });
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

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w) setScale(Math.min(1, w / WIDGET_WIDTH));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (!SITE_KEY) return null;

  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="lazyOnload" onLoad={renderWidget} />
      <div ref={wrapperRef} className="turnstile-widget" style={{ height: WIDGET_HEIGHT * scale }}>
        <div
          ref={innerRef}
          style={{
            width: WIDGET_WIDTH,
            height: WIDGET_HEIGHT,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        />
      </div>
    </>
  );
}
