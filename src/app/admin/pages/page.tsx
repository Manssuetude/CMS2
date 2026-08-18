import Link from "next/link";
import { ExternalLink, Pencil } from "lucide-react";
import { pageRepository } from "@/repositories/pageRepository";
import { siteSettingsRepository } from "@/repositories/siteSettingsRepository";
import { MAIN_NAV_ITEMS, PAGE_DIRECTORY } from "@/constants/site";
import { saveNavVisibilityAction } from "./actions";

export default async function AdminPages() {
  const [pages, navVisibility] = await Promise.all([
    pageRepository.listPages(true),
    siteSettingsRepository.getNavVisibility(),
  ]);

  const staticPages = pages.filter((p) => Object.keys(PAGE_DIRECTORY).includes(p.slug));

  return (
    <section className="admin-panel">
      <div className="admin-page-header">
        <div>
          <h1>Gestion des pages</h1>
          <p>
            Point central pour les grandes pages du site : visibilité dans le menu, et accès à l&apos;éditeur de chacune
            (texte, photo si la page en a une, SEO).
          </p>
        </div>
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

      {/* ── Annuaire des pages ───────────────────────────────────── */}
      {staticPages.length === 0 ? (
        <div className="admin-empty">
          <strong>Aucune page statique trouvée</strong>
          <p>Les pages de contenu apparaîtront ici une fois créées en base.</p>
        </div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Page</th>
              <th className="col-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {staticPages.map((page) => {
              const entry = PAGE_DIRECTORY[page.slug];
              return (
                <tr key={page.slug}>
                  <td className="col-title">{entry?.label ?? page.slug}</td>
                  <td className="col-actions">
                    <div className="row-actions">
                      <a
                        href={entry?.publicPath ?? "/"}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-sm"
                        title="Voir la page publique dans un nouvel onglet"
                      >
                        <ExternalLink size={13} strokeWidth={2} />
                        Voir le rendu final
                      </a>
                      <Link href={entry?.editorPath ?? `/admin/pages/${page.slug}`} className="btn-sm">
                        <Pencil size={13} strokeWidth={2} />
                        Modifier
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </section>
  );
}
