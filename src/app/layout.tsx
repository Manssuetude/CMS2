import type { Metadata } from "next";
import { Newsreader, Inter, Satisfy } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
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
  title: {
    default: "Manssuétude",
    template: "%s | Manssuétude",
  },
  description: "Un espace de réflexion, de production et d'expérimentation collective.",
  icons: {
    icon: "/assets/photos/logo-manssuetude.png",
    shortcut: "/assets/photos/logo-manssuetude.png",
    apple: "/assets/photos/logo-manssuetude.png",
  },
};

// Applique le thème choisi avant le premier paint pour éviter tout flash (FOUC).
// Aucun choix stocké = on laisse la préférence système décider (via les media queries CSS).
const themeInitScript = `(function(){try{var t=localStorage.getItem("ms-theme");if(t==="dark"||t==="light"){document.documentElement.setAttribute("data-theme",t);}}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${serif.variable} ${sans.variable} ${script.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
