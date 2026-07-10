import {
  Yellowtail,
  Pacifico,
  Grand_Hotel,
  Satisfy,
  Norican,
  Damion,
  Courgette,
  Kaushan_Script,
} from "next/font/google";

const yellowtail = Yellowtail({ subsets: ["latin"], weight: "400" });
const pacifico = Pacifico({ subsets: ["latin"], weight: "400" });
const grandHotel = Grand_Hotel({ subsets: ["latin"], weight: "400" });
const satisfy = Satisfy({ subsets: ["latin"], weight: "400" });
const norican = Norican({ subsets: ["latin"], weight: "400" });
const damion = Damion({ subsets: ["latin"], weight: "400" });
const courgette = Courgette({ subsets: ["latin"], weight: "400" });
const kaushan = Kaushan_Script({ subsets: ["latin"], weight: "400" });

const fonts = [
  { name: "Yellowtail", font: yellowtail },
  { name: "Pacifico", font: pacifico },
  { name: "Grand Hotel", font: grandHotel },
  { name: "Satisfy", font: satisfy },
  { name: "Norican", font: norican },
  { name: "Damion", font: damion },
  { name: "Courgette", font: courgette },
  { name: "Kaushan Script", font: kaushan },
];

export default function ApercuMPage() {
  return (
    <main
      style={{
        maxWidth: 1000,
        margin: "0 auto",
        padding: "48px 24px 96px",
        fontFamily: "Inter, system-ui, sans-serif",
        color: "#1c1714",
      }}
    >
      <h1 style={{ fontFamily: "Georgia, serif", fontSize: 32, marginBottom: 8 }}>Choix du « M » calligraphié</h1>
      <p style={{ color: "#574f48", marginBottom: 32 }}>
        Compare chaque police au M du logo (ci-dessous) et dis-moi le numéro qui s&apos;en rapproche le plus.
      </p>

      <div style={{ marginBottom: 40 }}>
        <p style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: "0.1em", color: "#8a7f76" }}>
          Logo de référence
        </p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/photos/logo-manssuetude.png?v=2"
          alt="Logo Manssuétude"
          style={{ height: 120, width: "auto" }}
        />
      </div>

      <ol style={{ display: "grid", gap: 20, listStyle: "none", padding: 0, margin: 0 }}>
        {fonts.map((f, i) => (
          <li
            key={f.name}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 28,
              padding: "20px 28px",
              border: "1px solid #e7dccf",
              borderRadius: 12,
              background: "#fffdfa",
            }}
          >
            <span style={{ fontSize: 14, color: "#8a7f76", width: 24 }}>{i + 1}</span>
            <span className={f.font.className} style={{ fontSize: 96, lineHeight: 1, color: "#ff4d12" }}>
              M
            </span>
            <span style={{ fontSize: 30, fontFamily: "Georgia, serif" }}>
              <span className={f.font.className} style={{ fontSize: 54, color: "#ff4d12" }}>
                M
              </span>
              anssuétude
            </span>
            <span style={{ marginLeft: "auto", fontSize: 14, color: "#574f48" }}>{f.name}</span>
          </li>
        ))}
      </ol>
    </main>
  );
}
