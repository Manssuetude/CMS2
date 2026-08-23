import Link from "next/link";

// Petite illustration éditoriale « page en cours de rédaction » (ligne claire, couleurs Manssuétude).
function MaintenanceArt() {
  return (
    <svg
      className="maintenance-art"
      viewBox="0 0 220 170"
      role="img"
      aria-label="Illustration : page en cours de rédaction"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* feuille de papier */}
      <rect
        x="42"
        y="34"
        width="112"
        height="118"
        rx="8"
        fill="var(--ed-raise)"
        stroke="var(--ed-ink)"
        strokeWidth="3"
      />
      {/* coin corné */}
      <path
        d="M134 34 L154 54 L134 54 Z"
        fill="var(--ed-sink)"
        stroke="var(--ed-ink)"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* lignes de texte */}
      <line x1="58" y1="66" x2="122" y2="66" stroke="var(--ed-line-strong)" strokeWidth="4" strokeLinecap="round" />
      <line x1="58" y1="82" x2="138" y2="82" stroke="var(--ed-line-strong)" strokeWidth="4" strokeLinecap="round" />
      <line x1="58" y1="98" x2="112" y2="98" stroke="var(--ed-line-strong)" strokeWidth="4" strokeLinecap="round" />
      <line x1="58" y1="114" x2="132" y2="114" stroke="var(--ed-line-strong)" strokeWidth="4" strokeLinecap="round" />
      {/* stylo / plume en diagonale */}
      <g stroke="var(--ed-ink)" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round">
        <path d="M150 128 L186 92" fill="none" />
        <path d="M150 128 L142 136 L150 136 Z" fill="var(--ed-brand)" stroke="none" />
        <path d="M182 88 L192 78 L200 86 L190 96 Z" fill="var(--ed-clay)" />
      </g>
      {/* petites idées / étincelles */}
      <circle cx="40" cy="24" r="4" fill="var(--ed-brand)" />
      <circle cx="176" cy="140" r="3.5" fill="var(--ed-clay)" />
      <circle cx="26" cy="120" r="3" fill="var(--ed-clay)" />
    </svg>
  );
}

export function MaintenanceNotice({
  eyebrow = "Bientôt disponible",
  title = "Cette page est en maintenance.",
  body = "Nous préparons ce contenu avec soin. Revenez d'ici peu. En attendant, vous pouvez continuer à explorer Manssuétude.",
}: {
  eyebrow?: string;
  title?: string;
  body?: string;
}) {
  return (
    <section className="maintenance">
      <MaintenanceArt />
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p className="maintenance-body">{body}</p>
      <div className="maintenance-actions">
        <Link className="button primary" href="/">
          Retour à l&apos;accueil
        </Link>
        <Link className="button secondary" href="/a-propos">
          À propos de nous
        </Link>
      </div>
    </section>
  );
}
