"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: { sitekey: string; size?: "flexible" | "normal" | "compact" },
      ) => string;
      remove: (widgetId: string) => void;
    };
  }
}

// Widget anti-spam Cloudflare Turnstile. Le champ caché "cf-turnstile-response"
// qu'il injecte dans le <form> parent est vérifié côté serveur (voir
// src/lib/turnstile.ts) avant d'accepter une soumission. Si la clé de site
// n'est pas configurée, le widget ne s'affiche simplement pas (dev local) —
// le honeypot reste la protection active dans ce cas.
// Taille responsive : "normal" (300×65px, rectangle large, le plus soigné
// visuellement) au-delà de 720px de large — au même seuil que le panneau
// newsletter passe en 2 colonnes, donc toujours assez de place. En dessous,
// "compact" (150×140px, plus haut que large) — ni "normal" ni "flexible"
// (100% avec un minimum de 300px, cf. doc Cloudflare) ne rentrent dans une
// colonne de formulaire mobile étroite, d'où le débordement horizontal
// observé avec la taille par défaut.
function computeSize(): "normal" | "compact" {
  return window.matchMedia("(min-width: 720px)").matches ? "normal" : "compact";
}

export function TurnstileWidget() {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  // Lu par renderWidget() au moment où le script Cloudflare finit de charger
  // (asynchrone, délai réseau variable) : un paramètre de fonction capturé
  // dans la closure de <Script onLoad> se fige à sa valeur au moment du montage
  // et ignore les changements de taille suivants (resize, ou même la valeur
  // initiale correcte si le state n'a pas encore été mis à jour au moment du
  // montage) — une ref garantit de toujours lire la dernière taille voulue.
  const sizeRef = useRef<"normal" | "compact">("compact");
  const [size, setSize] = useState<"normal" | "compact">("compact");

  function renderWidget() {
    if (!SITE_KEY || !containerRef.current || !window.turnstile) return;
    if (widgetId.current) {
      window.turnstile.remove(widgetId.current);
      widgetId.current = null;
    }
    widgetId.current = window.turnstile.render(containerRef.current, { sitekey: SITE_KEY, size: sizeRef.current });
  }

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 720px)");
    setSize(computeSize());
    const onChange = (e: MediaQueryListEvent) => setSize(e.matches ? "normal" : "compact");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    sizeRef.current = size;
    if (window.turnstile) renderWidget();
    return () => {
      if (widgetId.current && window.turnstile) {
        window.turnstile.remove(widgetId.current);
        widgetId.current = null;
      }
    };
  }, [size]);

  if (!SITE_KEY) return null;

  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="lazyOnload" onLoad={renderWidget} />
      <div ref={containerRef} className="turnstile-widget" />
    </>
  );
}
