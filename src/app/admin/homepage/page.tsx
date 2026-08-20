import { ExternalLink } from "lucide-react";
import { pageRepository } from "@/repositories/pageRepository";
import { mediaRepository } from "@/repositories/mediaRepository";
import { activityRepository } from "@/repositories/activityRepository";
import { ImageCropField } from "@/components/media/ImageCropField";
import { HERO_ASPECT } from "@/constants/imageAspects";
import { pickActivityOfTheMoment } from "@/utils/activityOfTheMoment";
import { saveHomepageFieldsAction } from "./actions";

export default async function AdminHomepage() {
  const [page, media, activities] = await Promise.all([
    pageRepository.getPage("accueil"),
    mediaRepository.list(),
    activityRepository.listActivities(),
  ]);

  const images = media.filter((m) => m.type === "image");
  const fallbackActivity = page?.featuredActivityId
    ? (activities.find((a) => a.id === page.featuredActivityId) ?? null)
    : null;
  const activityOfTheMoment = pickActivityOfTheMoment(activities, fallbackActivity);

  return (
    <section className="admin-panel">
      <div className="admin-page-header">
        <div>
          <h1>Page d&apos;accueil</h1>
          <p>Modifiez le contenu et les photos affichés sur la page d&apos;accueil du site.</p>
        </div>
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="btn-sm"
          title="Voir la page publique dans un nouvel onglet"
        >
          <ExternalLink size={13} strokeWidth={2} />
          Voir le rendu final
        </a>
      </div>

      <form action={saveHomepageFieldsAction} style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        {/* ── Activité du moment ───────────────────────────────────── */}
        <div className="admin-form-section">
          <h2 className="admin-form-section-title">Activité du moment</h2>
          <p className="admin-form-section-hint">
            Affichée automatiquement sur la page d&apos;accueil, juste sous le hero : s&apos;il y a une activité cette
            semaine, la plus proche s&apos;affiche. Sinon, l&apos;activité choisie ci-dessous s&apos;affiche à la place
            — et si rien n&apos;est choisi, la plus proche d&apos;aujourd&apos;hui (passée ou future) s&apos;affiche par
            défaut.
          </p>
          {activityOfTheMoment ? (
            <p style={{ fontSize: 13, margin: "0 0 14px" }}>
              Actuellement affichée : <strong>{activityOfTheMoment.title}</strong>
              {activityOfTheMoment.date ? ` — ${activityOfTheMoment.date}` : ""}
              {" · "}
              <a href={`/admin/activites/${activityOfTheMoment.id}/edit`} style={{ color: "var(--orange)" }}>
                Modifier cette activité →
              </a>
            </p>
          ) : (
            <p style={{ fontSize: 13, color: "var(--muted)", margin: "0 0 14px" }}>
              Aucune activité avec une date pour l&apos;instant, donc rien ne s&apos;affiche ici.{" "}
              <a href="/admin/activites" style={{ color: "var(--orange)" }}>
                Voir les activités →
              </a>
            </p>
          )}
          <div className="form-field">
            <label className="form-label">Activité de secours (si rien cette semaine)</label>
            <select name="featured_activity_id" className="form-input" defaultValue={page?.featuredActivityId ?? ""}>
              <option value="">— aucune, choisir automatiquement —</option>
              {activities.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.title}
                  {a.date ? ` — ${a.date}` : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

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
        </div>

        {/* ── Photo héro ───────────────────────────────────────────── */}
        <div className="admin-form-section">
          <h2 className="admin-form-section-title">Photo du hero</h2>
          <p className="admin-form-section-hint">
            Choisissez une image depuis la médiathèque. Si aucune n&apos;est sélectionnée, l&apos;image par défaut
            s&apos;affiche.
          </p>
          <div className="form-field">
            <ImageCropField
              label="Sélectionner une image"
              name="image_id"
              cropName="image_crop"
              images={images}
              defaultImageId={page?.imageId ?? ""}
              defaultCrop={page?.imageCrop ?? null}
              aspect={HERO_ASPECT}
            />
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
