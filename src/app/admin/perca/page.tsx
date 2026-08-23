import { ExternalLink } from "lucide-react";
import { pageRepository } from "@/repositories/pageRepository";
import { PercaBodyEditor } from "@/components/admin/PercaBodyEditor";
import { PercaStepsEditor } from "@/components/admin/PercaStepsEditor";
import { savePercaFieldsAction } from "./actions";

export default async function AdminPerca() {
  const page = await pageRepository.getPage("perca");

  return (
    <section className="admin-panel">
      <div className="admin-page-header">
        <div>
          <h1>Page PERCA</h1>
          <p>
            Modifiez le texte de la page PERCA. Les 5 étapes (Penser, Exprimer, Relier, Concrétiser, Ancrer) sont fixes
            et s&apos;affichent automatiquement au-dessus du texte.
          </p>
        </div>
        <a
          href="/perca"
          target="_blank"
          rel="noreferrer"
          className="btn-sm"
          title="Voir la page publique dans un nouvel onglet"
        >
          <ExternalLink size={13} strokeWidth={2} />
          Voir le rendu final
        </a>
      </div>

      <form action={savePercaFieldsAction} style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        {/* ── En-tête ──────────────────────────────────────────────── */}
        <div className="admin-form-section">
          <h2 className="admin-form-section-title">En-tête</h2>
          <div className="form-field">
            <label className="form-label">Étiquette (eyebrow)</label>
            <input
              name="eyebrow"
              className="form-input"
              defaultValue={page?.eyebrow ?? ""}
              placeholder="Notre méthode"
            />
          </div>
          <div className="form-field">
            <label className="form-label">Titre</label>
            <input name="title" className="form-input" defaultValue={page?.title ?? ""} placeholder="PERCA" />
          </div>
        </div>

        {/* ── Texte descriptif ─────────────────────────────────────── */}
        <div className="admin-form-section">
          <h2 className="admin-form-section-title">Texte descriptif</h2>
          <p className="admin-form-section-hint">
            Ce texte s&apos;affiche sous les 5 étapes. Utilisez la barre d&apos;outils pour mettre en forme (titres,
            gras, listes, liens…), comme le contenu principal des productions.
          </p>
          <div className="form-field">
            <label className="form-label">Description</label>
            <PercaBodyEditor initial={page?.body ?? ""} />
          </div>
        </div>

        {/* ── Étapes ───────────────────────────────────────────────── */}
        <div className="admin-form-section">
          <h2 className="admin-form-section-title">Détail de chaque étape</h2>
          <p className="admin-form-section-hint">
            Chaque étape devient cliquable sur la page publique et déplie son propre contenu. Laissez vide pour
            qu&apos;elle reste non cliquable.
          </p>
          <PercaStepsEditor initial={page?.percaSteps ?? []} />
        </div>

        {/* ── SEO ──────────────────────────────────────────────────── */}
        <div className="admin-form-section">
          <h2 className="admin-form-section-title">SEO</h2>
          <div className="form-field">
            <label className="form-label">Titre SEO (onglet navigateur)</label>
            <input
              name="seo_title"
              className="form-input"
              defaultValue={page?.seoTitle ?? ""}
              placeholder="PERCA · La méthode Manssuétude"
            />
          </div>
          <div className="form-field">
            <label className="form-label">Description SEO</label>
            <textarea
              name="seo_description"
              className="form-input"
              rows={3}
              defaultValue={page?.seoDescription ?? ""}
              placeholder="Penser, Exprimer, Relier, Concrétiser, Ancrer : le cadre de travail de Manssuétude."
            />
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button type="submit" className="cta" style={{ minWidth: 160 }}>
            Enregistrer les modifications
          </button>
        </div>
      </form>
    </section>
  );
}
