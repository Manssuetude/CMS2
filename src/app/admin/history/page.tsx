import { ExternalLink } from "lucide-react";
import { pageRepository } from "@/repositories/pageRepository";
import { PercaBodyEditor } from "@/components/admin/PercaBodyEditor";
import { saveHistoryFieldsAction } from "./actions";

export default async function AdminHistory() {
  const page = await pageRepository.getPage("history");

  return (
    <section className="admin-panel">
      <div className="admin-page-header">
        <div>
          <h1>Page Histoire</h1>
          <p>Modifiez le contenu de la page « Notre histoire » (accessible sur /history).</p>
        </div>
        <a
          href="/history"
          target="_blank"
          rel="noreferrer"
          className="btn-sm"
          title="Voir la page publique dans un nouvel onglet"
        >
          <ExternalLink size={13} strokeWidth={2} />
          Voir le rendu final
        </a>
      </div>

      <form action={saveHistoryFieldsAction} style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        {/* ── En-tête ──────────────────────────────────────────────── */}
        <div className="admin-form-section">
          <h2 className="admin-form-section-title">En-tête</h2>
          <div className="form-field">
            <label className="form-label">Étiquette (eyebrow)</label>
            <input
              name="eyebrow"
              className="form-input"
              defaultValue={page?.eyebrow ?? ""}
              placeholder="Notre parcours"
            />
          </div>
          <div className="form-field">
            <label className="form-label">Titre</label>
            <input name="title" className="form-input" defaultValue={page?.title ?? ""} placeholder="Notre histoire" />
          </div>
        </div>

        {/* ── Contenu ──────────────────────────────────────────────── */}
        <div className="admin-form-section">
          <h2 className="admin-form-section-title">Contenu</h2>
          <p className="admin-form-section-hint">
            Rédigez le contenu avec la barre d&apos;outils (titres, gras, listes, liens…), comme pour les articles.
          </p>
          <div className="form-field">
            <label className="form-label">Texte de la page</label>
            <PercaBodyEditor initial={page?.body ?? ""} />
          </div>
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
              placeholder="Notre histoire · Manssuétude"
            />
          </div>
          <div className="form-field">
            <label className="form-label">Description SEO</label>
            <textarea
              name="seo_description"
              className="form-input"
              rows={3}
              defaultValue={page?.seoDescription ?? ""}
              placeholder="L'histoire et le parcours de Manssuétude."
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
