"use client";

import { useState } from "react";
import { Link2, Mail } from "lucide-react";
import { FacebookIcon, LinkedInIcon, XIcon, WhatsAppIcon } from "@/components/public/SocialIcons";
import { buildShareUrls } from "@/utils/shareLinks";

type ShareNetwork = "linkedin" | "x" | "whatsapp" | "facebook" | "email";

const DEFAULT_NETWORKS: ShareNetwork[] = ["linkedin", "x", "whatsapp"];

const NETWORKS: Record<ShareNetwork, { label: string; Icon: () => React.ReactElement; external: boolean }> = {
  linkedin: { label: "Partager sur LinkedIn", Icon: () => <LinkedInIcon />, external: true },
  x: { label: "Partager sur X", Icon: () => <XIcon />, external: true },
  whatsapp: { label: "Partager sur WhatsApp", Icon: () => <WhatsAppIcon />, external: true },
  facebook: { label: "Partager sur Facebook", Icon: () => <FacebookIcon />, external: true },
  email: { label: "Partager par e-mail", Icon: () => <Mail size={16} strokeWidth={1.8} />, external: false },
};

// Lien copié en premier pour la page événement (networks fourni), en dernier
// ailleurs (comportement historique).
export function ShareButtons({
  url,
  title,
  networks = DEFAULT_NETWORKS,
  copyFirst = false,
}: {
  url: string;
  title: string;
  networks?: ShareNetwork[];
  copyFirst?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const share = buildShareUrls(url, title);

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const copyButton = (
    <button type="button" onClick={handleCopy} aria-label="Copier le lien" title="Copier le lien">
      <Link2 size={16} strokeWidth={1.8} />
    </button>
  );

  return (
    <div className="share-buttons">
      {copyFirst && copyButton}
      {networks.map((network) => {
        const { label, Icon, external } = NETWORKS[network];
        return (
          <a
            key={network}
            href={share[network]}
            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            aria-label={label}
            title={label}
          >
            <Icon />
          </a>
        );
      })}
      {!copyFirst && copyButton}
      <span className="share-copied" role="status" aria-live="polite">
        {copied ? "Lien copié" : ""}
      </span>
    </div>
  );
}
