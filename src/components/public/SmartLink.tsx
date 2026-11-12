import Link from "next/link";
import type { ReactNode } from "react";
import { isExternalUrl } from "@/utils/announcements";

// Lien des annonces : interne → <Link> (navigation client), externe (http…
// hors manssuetude.com) → nouvel onglet avec rel="noopener noreferrer".
export function SmartLink({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  if (isExternalUrl(href)) {
    return (
      <a className={className} href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }
  if (/^https?:\/\//i.test(href) || href.startsWith("#")) {
    return (
      <a className={className} href={href}>
        {children}
      </a>
    );
  }
  return (
    <Link className={className} href={href}>
      {children}
    </Link>
  );
}
