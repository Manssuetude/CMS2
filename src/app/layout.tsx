import type { Metadata } from "next";
import { Newsreader, Inter, Satisfy } from "next/font/google";
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
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${serif.variable} ${sans.variable} ${script.variable}`}>
      <body>{children}</body>
    </html>
  );
}
