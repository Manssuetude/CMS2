import { contentRepository } from "@/repositories/contentRepository";
import { mediaRepository } from "@/repositories/mediaRepository";
import { saveHomepageFieldsAction } from "./actions";

function toAbsoluteUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (url.startsWith("http") || url.startsWith("/")) return url;
  return `/${url}`;
}

export default async function AdminHomepage() {
  const [page, media, themes] = await Promise.all([
    contentRepository.getPage("accueil"),
    mediaRepository.list(),
    contentRepository.listThemes(true),
  ]);

  const images = media.filter((m) => m.type === "image");

  return (
    <section className="admin-panel">
      <div className="admin-page-header">
        <div>
          <h1>Page d&apos;accueil</h1>
          <p>Modifiez le contenu et les photos affichés sur la page d&apos;accueil du site.</p>
        </div>
      </div>

      <form action={saveHomepageFieldsAction} style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        {/* ── Hero ─────────────────────────────────────────────────── */}
        <div className="admin-form-section">
          <h2 className="admin-form-section-title">Texte principal (hero)</h2>
          <p className="admin-form-section-hint">
            Ce texte est découpé en phrases. La 1ère sert de titre, le reste devient l&apos;introduction.
          </p>
          <div className="form-field">
            <label className="form-label">Texte de présentation de l&apos;association</label>
            <textarea
              name="body"
              className="form-input"
              rows={5}
              defaultValue={page?.body ?? ""}
              placeholder="Manssuétude est un espace de réflexion..."
            />
          </div>
          <div className="form-row">
            <div className="form-field">
              <label className="form-label">Bouton principal — libellé</label>
              <input
                name="primary_cta_label"
                className="form-input"
                defaultValue={page?.primaryCtaLabel ?? ""}
                placeholder="Rejoindre"
              />
            </div>
            <div className="form-field">
              <label className="form-label">Bouton principal — cible</label>
              <input
                name="primary_cta_target"
                className="form-input"
                defaultValue={page?.primaryCtaTarget ?? ""}
                placeholder="/nous-rejoindre ou FORM:join"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-field">
              <label className="form-label">Bouton secondaire — libellé</label>
              <input
                name="secondary_cta_label"
                className="form-input"
                defaultValue={page?.secondaryCtaLabel ?? ""}
                placeholder="Nous soutenir"
              />
            </div>
            <div className="form-field">
              <label className="form-label">Bouton secondaire — cible</label>
              <input
                name="secondary_cta_target"
                className="form-input"
                defaultValue={page?.secondaryCtaTarget ?? ""}
                placeholder="/nous-soutenir"
              />
            </div>
          </div>
        </div>

        {/* ── Photo héro ───────────────────────────────────────────── */}
        <div className="admin-form-section">
          <h2 className="admin-form-section-title">Photo du hero</h2>
          <p className="admin-form-section-hint">
            Choisissez une image depuis la médiathèque. Si aucune n&apos;est sélectionnée, l&apos;image par défaut
            s&apos;affiche.
          </p>
          {page?.imageUrl && (
            <div style={{ marginBottom: 12 }}>
              <img
                src={toAbsoluteUrl(page.imageUrl)}
                alt="Image actuelle"
                style={{ height: 100, objectFit: "cover", borderRadius: 6, border: "1px solid var(--line)" }}
              />
              <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>Image actuelle</p>
            </div>
          )}
          <div className="form-field">
            <label className="form-label">Sélectionner une image</label>
            <select name="image_id" className="form-input" defaultValue={page?.imageId ?? ""}>
              <option value="">— image par défaut —</option>
              {images.map((img) => (
                <option key={img.id} value={img.id}>
                  {img.title || img.filename}
                </option>
              ))}
            </select>
          </div>
          {images.length === 0 && (
            <p style={{ fontSize: 13, color: "var(--muted)" }}>
              Aucune image dans la médiathèque.{" "}
              <a href="/admin/media" style={{ color: "var(--orange)" }}>
                Importer une photo →
              </a>
            </p>
          )}
        </div>

        {/* ── Sujet du moment ──────────────────────────────────────── */}
        <div className="admin-form-section">
          <h2 className="admin-form-section-title">Sujet du moment</h2>
          <p className="admin-form-section-hint">
            Section mise en avant sur la page d&apos;accueil, juste sous le hero.
          </p>
          <div className="form-field">
            <label className="form-label">Étiquette (eyebrow)</label>
            <input
              name="eyebrow"
              className="form-input"
              defaultValue={page?.eyebrow ?? ""}
              placeholder="Thème du moment"
            />
          </div>
          <div className="form-field">
            <label className="form-label">Titre du sujet</label>
            <input
              name="title"
              className="form-input"
              defaultValue={page?.title ?? ""}
              placeholder="Intelligence artificielle et éthique"
            />
          </div>
          <div className="form-field">
            <label className="form-label">Thème associé</label>
            <p className="admin-form-section-hint" style={{ marginTop: 0 }}>
              Le clic sur le sujet redirige vers la page de ce thème.
            </p>
            <select name="quote" className="form-input" defaultValue={page?.quote ?? ""}>
              <option value="">— aucun thème —</option>
              {themes.map((t) => (
                <option key={t.id} value={t.slug}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label className="form-label">Photo du sujet</label>
            <p className="admin-form-section-hint" style={{ marginTop: 0 }}>
              Image affichée à côté du sujet du moment sur la page d&apos;accueil.
            </p>
            {page?.focusImageUrl && (
              <div style={{ marginBottom: 12 }}>
                <img
                  src={toAbsoluteUrl(page.focusImageUrl)}
                  alt="Photo actuelle du sujet"
                  style={{ height: 100, objectFit: "cover", borderRadius: 6, border: "1px solid var(--line)" }}
                />
              </div>
            )}
            <select name="seo_image_id" className="form-input" defaultValue={page?.seoImageId ?? ""}>
              <option value="">— image par défaut —</option>
              {images.map((img) => (
                <option key={img.id} value={img.id}>
                  {img.title || img.filename}
                </option>
              ))}
            </select>
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
              placeholder="Manssuétude — Réflexion, production, expérimentation"
            />
          </div>
          <div className="form-field">
            <label className="form-label">Description SEO</label>
            <textarea
              name="seo_description"
              className="form-input"
              rows={3}
              defaultValue={page?.seoDescription ?? ""}
              placeholder="Un espace de réflexion, de production et d'expérimentation collective."
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
