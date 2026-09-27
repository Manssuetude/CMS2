import type { Metadata } from "next";
import Script from "next/script";
import { Newsreader, Inter, Satisfy } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, SITE_LOGO, SITE_SOCIALS } from "@/constants/site";
import { CONSENT_STORAGE_KEY } from "@/lib/consent";
import { ConsentGate } from "@/components/public/ConsentGate";
import { CookieConsentBanner } from "@/components/public/CookieConsentBanner";
import "@/styles/globals.css";
import "@/styles/editorial.css";

const serif = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

// Initiale calligraphiée « M » — brush proche du logo.
const script = Satisfy({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-script",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Manssuétude",
    template: "%s | Manssuétude",
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "Manssuétude",
    "Manssuetude",
    "association Manssuétude",
    "Manssuétude association",
    "association",
    "association africaine",
    "Afrique",
    "diaspora africaine",
    "jeunesse africaine",
    "développement Afrique",
    "économie africaine",
    "souveraineté africaine",
    "réflexion",
    "production intellectuelle",
    "événements",
    "activités",
    "thèmes",
    "projets",
    "recherche collective",
    "expérimentation collective",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  // Pas de canonique globale ici : elle serait héritée par toutes les pages et les
  // ferait pointer vers l'accueil. Chaque page définit sa propre canonique (auto-référencée).
  icons: {
    icon: SITE_LOGO,
    shortcut: SITE_LOGO,
    apple: SITE_LOGO,
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    locale: "fr_FR",
    images: [{ url: SITE_LOGO, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [SITE_LOGO],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "85Rix1CMIWGc4xcuJxbAApjfJTm66_t309yWBN1ZVbM",
  },
};

// Données structurées (Schema.org) : aident Google à identifier la marque « Manssuétude »
// et à afficher une recherche sur le site (SearchAction) pour les requêtes de marque.
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      // NGO (sous-type schema.org d'Organization) plutôt qu'Organization générique —
      // signale explicitement le caractère associatif/à but non lucratif aux moteurs.
      "@type": "NGO",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      // Variantes du nom (sans accent, avec « association ») pour que Google rattache
      // toutes ces requêtes de marque à la même entité « Manssuétude ».
      alternateName: ["Manssuetude", "Association Manssuétude", "Manssuétude association"],
      url: SITE_URL,
      logo: `${SITE_URL}${SITE_LOGO}`,
      description: SITE_DESCRIPTION,
      sameAs: SITE_SOCIALS,
      // Signale les axes éditoriaux réels (thèmes publiés) pour renforcer la
      // pertinence sur les requêtes thématiques (ex. "association africaine") —
      // à tenir à jour si les grands thèmes changent significativement.
      knowsAbout: [
        "Afrique",
        "Diasporas africaines",
        "Citoyenneté, démocratie et institutions",
        "Jeunesses africaines, diasporas et mobilités",
        "Transformations sociales, égalités et modes de vie",
        "Économies africaines, développement et intégration",
        "Souverainetés, technologies et rapports de puissance",
        "Cultures, mémoires et représentations",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: SITE_NAME,
      alternateName: ["Manssuetude", "Association Manssuétude"],
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      inLanguage: "fr-FR",
      publisher: { "@id": `${SITE_URL}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_URL}/recherche?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

const GA_MEASUREMENT_ID = "G-5TJZEVV0G9";

// Applique le thème choisi avant le premier paint pour éviter tout flash (FOUC).
// Aucun choix stocké = on laisse la préférence système décider (via les media queries CSS).
const themeInitScript = `(function(){try{var t=localStorage.getItem("ms-theme");if(t==="dark"||t==="light"){document.documentElement.setAttribute("data-theme",t);}}catch(e){}})();`;

// Google Consent Mode (avancé) : les signaux par défaut (tout refusé) doivent être
// poussés dans le dataLayer AVANT le chargement de gtag.js, pour que Google Analytics
// respecte le consentement dès sa première exécution (voir CookieConsentBanner/consent.ts
// pour la mise à jour au moment du choix du visiteur). Un visiteur ayant déjà répondu
// (localStorage) passe directement en granted, sans attendre une nouvelle interaction.
const consentDefaultScript = `(function(){
  window.dataLayer = window.dataLayer || [];
  function gtag(){window.dataLayer.push(arguments);}
  window.gtag = gtag;
  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    wait_for_update: 500
  });
  try {
    if (localStorage.getItem('${CONSENT_STORAGE_KEY}') === 'accepted') {
      gtag('consent', 'update', {
        ad_storage: 'granted',
        ad_user_data: 'granted',
        ad_personalization: 'granted',
        analytics_storage: 'granted'
      });
    }
  } catch (e) {}
})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${serif.variable} ${sans.variable} ${script.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <script dangerouslySetInnerHTML={{ __html: consentDefaultScript }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body>
        {children}
        <ConsentGate>
          <Analytics />
          <SpeedInsights />
        </ConsentGate>
        {/* Google Analytics se charge sur toutes les pages (mode de consentement avancé) :
            les signaux par défaut posés dans consentDefaultScript empêchent tout cookie ou
            identifiant tant que le visiteur n'a pas donné son accord. */}
        <Script strategy="afterInteractive" src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} />
        <Script id="ga4-init" strategy="afterInteractive">
          {`gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');`}
        </Script>
        <CookieConsentBanner />
      </body>
    </html>
  );
}
