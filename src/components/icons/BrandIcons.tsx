// Icônes réseaux sociaux (SVG inline pour ne dépendre d'aucune librairie d'icônes —
// Lucide, déjà utilisé partout ailleurs, ne couvre pas les logos de marque).
// Partagées entre SiteFooter et la page /link (voir utils/linkIcons.ts).
export type IconProps = { size?: number };

export function InstagramIcon({ size = 18 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      aria-hidden
      focusable="false"
    >
      <rect x="2.5" y="2.5" width="19" height="19" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function TikTokIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden focusable="false">
      <path d="M16.5 3c.32 2.13 1.6 3.62 3.5 3.86v2.63c-1.28.13-2.47-.29-3.5-1.02v6.88c0 3.18-2.57 5.65-5.68 5.65C7.68 21 5 18.4 5 15.29c0-3.02 2.4-5.52 5.4-5.62.32-.01.64.01.95.07v2.72a2.9 2.9 0 0 0-.9-.15c-1.6 0-2.82 1.28-2.82 2.88 0 1.6 1.22 2.9 2.82 2.9 1.6 0 2.9-1.24 2.9-2.9V3h3.15z" />
    </svg>
  );
}

export function LinkedInIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden focusable="false">
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-.95 1.83-1.95 3.77-1.95C20.4 8.75 21 11 21 14.1V21h-4v-6.1c0-1.45-.03-3.3-2.02-3.3-2.02 0-2.33 1.58-2.33 3.2V21H9z" />
    </svg>
  );
}
