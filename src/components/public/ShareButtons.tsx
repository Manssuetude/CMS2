"use client";

import { useState } from "react";
import { Link2 } from "lucide-react";
import { LinkedInIcon, XIcon, WhatsAppIcon } from "@/components/public/SocialIcons";
import { buildShareUrls } from "@/utils/shareLinks";

export function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const share = buildShareUrls(url, title);

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="share-buttons">
      <a
        href={share.linkedin}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Partager sur LinkedIn"
        title="Partager sur LinkedIn"
      >
        <LinkedInIcon />
      </a>
      <a href={share.x} target="_blank" rel="noopener noreferrer" aria-label="Partager sur X" title="Partager sur X">
        <XIcon />
      </a>
      <a
        href={share.whatsapp}
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
