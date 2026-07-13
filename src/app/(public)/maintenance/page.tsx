import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page en maintenance",
  description: "Cette page est en cours de préparation.",
};

export default function MaintenancePage() {
  return (
    <section className="maintenance">
      <p className="eyebrow">Bientôt disponible</p>
      <h1>Cette page est en maintenance.</h1>
      <p className="maintenance-body">
        Nous préparons ce contenu avec soin. Revenez d&apos;ici peu — en attendant, vous pouvez continuer à explorer
        Manssuétude.
      </p>
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
