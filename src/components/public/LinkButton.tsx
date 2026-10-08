"use client";

import { resolveLinkIcon } from "@/utils/linkIcons";

// Envoie un événement GA4 "link_click" (nom du lien en paramètre) à chaque
// clic, pour suivre les statistiques par lien dans Google Analytics — c'est
// le but principal de cette page. transport_type "beacon" garantit l'envoi
// même si la navigation démarre avant la fin de la requête.
function trackClick(label: string, url: string) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", "link_click", {
    link_label: label,
    link_url: url,
    transport_type: "beacon",
  });
}

export function LinkButton({ label, url, icon }: { label: string; url: string; icon: string }) {
  const Icon = resolveLinkIcon(icon);
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="link-page-button"
      onClick={() => trackClick(label, url)}
    >
      <span className="link-page-icon">
        <Icon size={18} strokeWidth={1.8} />
      </span>
      <span>{label}</span>
    </a>
  );
}
