import { pageRepository } from "@/repositories/pageRepository";
import { mediaRepository } from "@/repositories/mediaRepository";
import { siteSettingsRepository } from "@/repositories/siteSettingsRepository";
import { ImageCropField } from "@/components/media/ImageCropField";
import { HERO_ASPECT } from "@/constants/imageAspects";
import { MAIN_NAV_ITEMS } from "@/constants/site";
import { savePageImageAction, saveNavVisibilityAction } from "./actions";

const PAGE_LABELS: Record<string, string> = {
  accueil: "Page d'accueil",
  "a-propos": "À propos",
  "nous-rejoindre": "Nous rejoindre",
  "nous-soutenir": "Nous soutenir",
  activites: "Activités",
  productions: "Productions",
  projets: "Projets",
  themes: "Thèmes",
  perca: "Page PERCA",
  history: "Page Histoire",
};

// Certaines pages ont leur propre éditeur dédié (plus riche qu'un simple champ
// photo/SEO) — on y renvoie plutôt que de dupliquer leur formulaire ici.
const DEDICATED_EDITOR: Record<string, string> = {
  accueil: "/admin/homepage",
  perca: "/admin/perca",
  history: "/admin/history",
};

function toAbsoluteUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (url.startsWith("http") || url.startsWith("/")) return url;
  return `/${url}`;
}

export default async function AdminPages() {
  const [pages, media, navVisibility] = await Promise.all([
    pageRepository.listPages(true),
    mediaRepository.list(),
    siteSettingsRepository.getNavVisibility(),
  ]);

  const images = media.filter((m) => m.type === "image");

  const staticPages = pages.filter((p) => Object.keys(PAGE_LABELS).includes(p.slug));

  return (
    <section className="admin-panel">
      <div className="admin-page-header">
        <div>
          <h1>Gestion des pages</h1>
          <p>
            Point central pour les grandes pages du site : visibilité dans le menu, photo hero rapide ci-dessous, et
            lien vers l&apos;éditeur de contenu complet de chaque page.
          </p>
        </div>
        <a href="/admin/media" className="btn secondary">
          Médiathèque →
        </a>
      </div>

      {/* ── Visibilité dans le menu ──────────────────────────────── */}
      <div className="admin-form-section" style={{ marginBottom: 24 }}>
        <h2 className="admin-form-section-title">Visibilité dans le menu</h2>
        <p className="admin-form-section-hint">
          Décochez une page pour la retirer du header et du menu public. La page reste accessible par son URL directe —
          elle n&apos;est pas dépubliée, seule son entrée de navigation disparaît.
        </p>
        <form action={saveNavVisibilityAction} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {MAIN_NAV_ITEMS.filter((item) => item.togglable).map((item) => (
            <div className="form-checkbox" key={item.key}>
              <input
                type="checkbox"
                id={`nav-${item.key}`}
                name={`nav_${item.key}`}
                defaultChecked={navVisibility[item.key] !== false}
              />
              <label htmlFor={`nav-${item.key}`}>{item.label}</label>
            </div>
          ))}
          <button type="submit" className="button primary" style={{ alignSelf: "flex-start", marginTop: 10 }}>
            Enregistrer
          </button>
        </form>
      </div>

      {images.length === 0 && (
        <div
          className="admin-empty"
          style={{ marginBottom: 24, background: "var(--orange-soft)", borderColor: "var(--orange)" }}
        >
          <strong>Aucune image dans la médiathèque</strong>
          <p>
            Importez des photos via la{" "}
            <a href="/admin/media" style={{ color: "var(--orange)" }}>
              Médiathèque
            </a>{" "}
            pour pouvoir les sélectionner ici.
          </p>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {staticPages.map((page) => {
          const currentUrl = toAbsoluteUrl(page.imageUrl ?? "");

          return (
            <div
              key={page.slug}
              style={{
                display: "flex",
                gap: 20,
                alignItems: "center",
                padding: "16px 0",
                borderBottom: "1px solid var(--line)",
              }}
            >
              {/* Aperçu image */}
              <div
                style={{
                  width: 96,
                  height: 64,
                  borderRadius: 6,
                  overflow: "hidden",
                  border: "1px solid var(--line)",
                  flexShrink: 0,
                  background: "var(--soft)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {currentUrl ? (
                  <img src={currentUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <span style={{ fontSize: 11, color: "var(--muted)" }}>Pas de photo</span>
                )}
              </div>

              {/* Infos page */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, marginBottom: 2 }}>{PAGE_LABELS[page.slug] ?? page.slug}</div>
                <a
                  href={DEDICATED_EDITOR[page.slug] ?? `/admin/pages/${page.slug}`}
                  style={{ fontSize: 12, color: "var(--orange)", fontWeight: 600 }}
                >
                  Éditer le contenu →
                </a>
              </div>

              {/* Formulaire image picker */}
              <form
                action={savePageImageAction}
                style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "stretch", minWidth: 260 }}
              >
                <input type="hidden" name="slug" value={page.slug} />
                <ImageCropField
                  name="image_id"
                  cropName="image_crop"
                  images={images}
                  defaultImageId={page.imageId ?? ""}
                  defaultCrop={page.imageCrop ?? null}
                  aspect={HERO_ASPECT}
                />
                <button type="submit" className="cta" style={{ whiteSpace: "nowrap", alignSelf: "flex-end" }}>
                  Appliquer les changements
                </button>
              </form>
            </div>
          );
        })}
      </div>

      {staticPages.length === 0 && (
        <div className="admin-empty">
          <strong>Aucune page statique trouvée</strong>
          <p>Les pages de contenu apparaîtront ici une fois créées en base.</p>
        </div>
      )}
    </section>
  );
}
