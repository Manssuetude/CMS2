import Link from "next/link";
import { Hero } from "@/components/public/Hero";
import type { Page } from "@/types/cms";
import { PercaStepsInteractive } from "@/components/public/PercaStepsInteractive";

export function AboutEditorial({ page, percaPage }: { page: Page; percaPage?: Page | null }) {
  return (
    <div className="about">
      <Hero
        eyebrow={page.eyebrow}
        title={page.title}
        body={page.body}
        imageUrl={page.imageUrl ?? undefined}
        primaryLabel={page.primaryCtaLabel}
        primaryTarget={page.primaryCtaTarget}
        secondaryLabel={page.secondaryCtaLabel}
        secondaryTarget={page.secondaryCtaTarget}
      />

      {/* Statut légal — ligne fixe (pas un champ éditable) pour ne pas risquer
          qu'elle disparaisse en modifiant le texte de la page. */}
      <p className="about-status">Manssuétude est une association à but non lucratif.</p>

      {page.quote ? (
        <section className="about-quote">
          <blockquote>{page.quote}</blockquote>
        </section>
      ) : null}

      {/* Notre méthode PERCA — aperçu seulement, le détail complet vit sur /perca. */}
      <section className="about-perca">
        <div className="section-head">
          <p className="eyebrow">Notre méthode</p>
          <h2>PERCA</h2>
        </div>
        <p className="about-perca-intro">
          Cinq dimensions qui donnent du rythme et du sens à nos activités. Cliquez une lettre pour un aperçu.
        </p>
        <PercaStepsInteractive steps={percaPage?.percaSteps ?? []} />
        <Link className="about-perca-link" href="/perca">
          PERCA plus en détail <span aria-hidden>→</span>
        </Link>
      </section>
    </div>
  );
}
