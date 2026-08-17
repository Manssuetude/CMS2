"use client";

import { useState } from "react";
import { Link2 } from "lucide-react";

type IconProps = { size?: number };

function LinkedInIcon({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden focusable="false">
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-.95 1.83-1.95 3.77-1.95C20.4 8.75 21 11 21 14.1V21h-4v-6.1c0-1.45-.03-3.3-2.02-3.3-2.02 0-2.33 1.58-2.33 3.2V21H9z" />
    </svg>
  );
}

function XIcon({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden focusable="false">
      <path d="M18.24 3H21l-6.55 7.49L22.2 21h-6.4l-5-6.53L4.9 21H2.13l7.01-8.01L1.5 3h6.55l4.52 5.97L18.24 3zm-1.12 16.17h1.77L7.02 4.73H5.12l12 14.44z" />
    </svg>
  );
}

function WhatsAppIcon({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden focusable="false">
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.65-2.05-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.87 1.22 3.07.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35z" />
      <path d="M12.02 2C6.5 2 2.02 6.48 2.02 12c0 1.85.5 3.58 1.36 5.07L2 22l5.08-1.33A9.95 9.95 0 0 0 12.02 22C17.53 22 22 17.52 22 12S17.53 2 12.02 2zm0 18.15c-1.7 0-3.28-.5-4.61-1.36l-.33-.2-3.02.79.81-2.94-.21-.34a8.13 8.13 0 0 1-1.24-4.1c0-4.5 3.66-8.15 8.6-8.15 4.6 0 8.34 3.65 8.34 8.15 0 4.5-3.74 8.15-8.34 8.15z" />
    </svg>
  );
}

export function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="share-buttons">
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Partager sur LinkedIn"
        title="Partager sur LinkedIn"
      >
        <LinkedInIcon />
      </a>
      <a
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Partager sur X"
        title="Partager sur X"
      >
        <XIcon />
      </a>
      <a
        href={`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Partager sur WhatsApp"
        title="Partager sur WhatsApp"
      >
        <WhatsAppIcon />
      </a>
      <button type="button" onClick={handleCopy} aria-label="Copier le lien" title="Copier le lien">
        <Link2 size={16} strokeWidth={1.8} />
      </button>
      {copied && <span className="share-copied">Lien copié</span>}
    </div>
  );
}
