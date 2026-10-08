import { Globe, Mail, Heart, Link2, type LucideIcon } from "lucide-react";
import { InstagramIcon, TikTokIcon, LinkedInIcon, type IconProps } from "@/components/icons/BrandIcons";

type LinkIconComponent = LucideIcon | ((props: IconProps) => React.JSX.Element);

// Icônes disponibles pour un lien de la page /link — clé stockée en base
// (colonne `icon`), résolue ici côté admin (sélecteur) et public (rendu du
// bouton). Mélange d'icônes de marque dessinées à la main (voir
// components/icons/BrandIcons.tsx, Lucide ne couvre pas les logos de réseaux)
// et d'icônes génériques Lucide pour les autres usages.
export const LINK_ICONS: Record<string, LinkIconComponent> = {
  instagram: InstagramIcon,
  tiktok: TikTokIcon,
  linkedin: LinkedInIcon,
  website: Globe,
  email: Mail,
  donate: Heart,
  link: Link2,
};

export const LINK_ICON_LABELS: Record<string, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  linkedin: "LinkedIn",
  website: "Site web",
  email: "Email",
  donate: "Don",
  link: "Lien générique",
};

export function resolveLinkIcon(icon: string | null | undefined): LinkIconComponent {
  return (icon && LINK_ICONS[icon]) || Link2;
}
