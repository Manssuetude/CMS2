import Link from "next/link";

export default function NotFound() {
  return (
    <div className="site-shell notfound">
      <div className="notfound-inner">
        <img className="notfound-logo" src="/assets/photos/logo-manssuetude.png?v=2" alt="Manssuétude" />

        <svg
          className="notfound-art"
          viewBox="0 0 400 220"
          role="img"
          aria-label="Illustration : chantier en cours"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="chantier-stripes"
              width="20"
              height="20"
              patternTransform="rotate(45)"
              patternUnits="userSpaceOnUse"
            >
              <rect width="20" height="20" fill="#faf6f0" />
              <rect width="10" height="20" fill="#ff4d12" />
            </pattern>
            <clipPath id="cone-clip">
              <path d="M320 112 L300 188 L340 188 Z" />
            </clipPath>
          </defs>

          {/* sol */}
          <line x1="36" y1="190" x2="364" y2="190" stroke="#1c1714" strokeWidth="2.5" strokeLinecap="round" />

          {/* barrière : pieds */}
          <path d="M84 132 L68 188" stroke="#1c1714" strokeWidth="4" strokeLinecap="round" />
          <path d="M84 132 L100 188" stroke="#1c1714" strokeWidth="4" strokeLinecap="round" />
          <path d="M246 132 L230 188" stroke="#1c1714" strokeWidth="4" strokeLinecap="round" />
          <path d="M246 132 L262 188" stroke="#1c1714" strokeWidth="4" strokeLinecap="round" />

          {/* barrière : planche rayée */}
          <rect
            x="66"
            y="108"
            width="198"
            height="26"
            rx="4"
            fill="url(#chantier-stripes)"
            stroke="#1c1714"
            strokeWidth="2.5"
          />

          {/* cône de chantier */}
          <rect x="294" y="184" width="52" height="9" rx="2.5" fill="#1c1714" />
          <path
            d="M320 112 L300 188 L340 188 Z"
            fill="#ff4d12"
            stroke="#1c1714"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <g clipPath="url(#cone-clip)">
            <rect x="296" y="140" width="48" height="9" fill="#faf6f0" />
            <rect x="296" y="160" width="48" height="9" fill="#faf6f0" />
          </g>

          {/* petites étincelles / poussière */}
          <circle cx="290" cy="96" r="3" fill="#a23c1e" />
          <circle cx="356" cy="120" r="2.5" fill="#a23c1e" />
          <circle cx="52" cy="86" r="2.5" fill="#a23c1e" />
        </svg>

        <p className="eyebrow">Erreur 404</p>
        <h1>Cette page est en chantier</h1>
        <p className="notfound-text">
          Nous construisons encore cette partie du site. Revenez bientôt : il y aura de quoi lire, débattre et
          contribuer.
        </p>
        <Link className="cta" href="/">
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
