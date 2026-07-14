import { contentRepository } from "@/repositories/contentRepository";
import { mediaRepository } from "@/repositories/mediaRepository";
import { savePageImageAction } from "./actions";

const PAGE_LABELS: Record<string, string> = {
  accueil: "Page d'accueil",
  "a-propos": "À propos",
  "nous-rejoindre": "Nous rejoindre",
  "nous-soutenir": "Nous soutenir",
  activites: "Activités",
  productions: "Productions",
  projets: "Projets",
  themes: "Thèmes",
};

const PAGE_FALLBACK: Record<string, string> = {
  accueil: "/assets/photos/hero-accueil.png",
  "a-propos": "",
  "nous-rejoindre": "/assets/photos/hero-nous-rejoindre.png",
  "nous-soutenir": "/assets/photos/hero-nous-soutenir.png",
  activites: "/assets/photos/hero-activites.png",
  productions: "/assets/photos/hero-productions.png",
  projets: "/assets/photos/hero-projets.png",
  themes: "/assets/photos/hero-themes.png",
};

function toAbsoluteUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (url.startsWith("http") || url.startsWith("/")) return url;
  return `/${url}`;
}

export default async function AdminPages() {
  const [pages, media] = await Promise.all([contentRepository.listPages(true), mediaRepository.list()]);

  const images = media.filter((m) => m.type === "image");

  const staticPages = pages.filter((p) => Object.keys(PAGE_LABELS).includes(p.slug));

  return (
    <section className="admin-panel">
      <div className="admin-page-header">
        <div>
          <h1>Pages du site</h1>
          <p>
            Modifiez le texte, la photo hero et le SEO de chaque page. Photo rapide ci-dessous, ou « Éditer le contenu »
            pour tout.
          </p>
        </div>
        <a href="/admin/media" className="btn secondary">
          Médiathèque →
        </a>
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
          const fallback = PAGE_FALLBACK[page.slug] ?? "";
          const currentUrl = toAbsoluteUrl(page.imageUrl ?? fallback);

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
                  href={page.slug === "accueil" ? "/admin/homepage" : `/admin/pages/${page.slug}`}
                  style={{ fontSize: 12, color: "var(--orange)", fontWeight: 600 }}
                >
                  Éditer le contenu →
                </a>
              </div>

              {/* Formulaire image picker */}
              <form action={savePageImageAction} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input type="hidden" name="slug" value={page.slug} />
                <select
                  name="image_id"
                  className="form-input"
                  defaultValue={page.imageId ?? ""}
                  style={{ minWidth: 220, fontSize: 13 }}
                >
                  <option value="">— image par défaut —</option>
                  {images.map((img) => (
                    <option key={img.id} value={img.id}>
                      {img.title || img.filename}
                    </option>
                  ))}
                </select>
                <button type="submit" className="btn secondary" style={{ whiteSpace: "nowrap", fontSize: 13 }}>
                  Appliquer
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
