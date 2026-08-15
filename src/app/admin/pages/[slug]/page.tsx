import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth";
import { pageRepository } from "@/repositories/pageRepository";
import { mediaRepository } from "@/repositories/mediaRepository";
import { ImageCropField } from "@/components/media/ImageCropField";
import { HERO_ASPECT } from "@/constants/imageAspects";
import { savePageContentAction } from "../actions";

const PAGE_LABELS: Record<string, string> = {
  "a-propos": "À propos",
  "nous-rejoindre": "Nous rejoindre",
  "nous-soutenir": "Nous soutenir",
  activites: "Activités",
  productions: "Productions",
  projets: "Projets",
  themes: "Thèmes",
};

export default async function EditPageBySlug({ params }: { params: Promise<{ slug: string }> }) {
  await requirePermission("pages:edit");
  const { slug } = await params;
  if (!PAGE_LABELS[slug]) notFound();

  const [page, media] = await Promise.all([pageRepository.getPage(slug), mediaRepository.list()]);
  const images = media.filter((m) => m.type === "image");

  return (
    <section className="admin-panel">
      <div className="admin-page-header">
        <div>
          <Link href="/admin/pages" className="btn-sm" style={{ marginBottom: 10 }}>
            ← Toutes les pages
          </Link>
          <h1>Modifier — {PAGE_LABELS[slug]}</h1>
          <p>Éditez le texte, la photo hero et le SEO de cette page.</p>
        </div>
      </div>

      <form action={savePageContentAction} style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        <input type="hidden" name="slug" value={slug} />

        {/* ── En-tête (hero) ─────────────────────────────────────────── */}
        <div className="admin-form-section">
          <h2 className="admin-form-section-title">En-tête</h2>
          <div className="form-field">
            <label className="form-label">Étiquette (eyebrow)</label>
            <input
              name="eyebrow"
              className="form-input"
              defaultValue={page?.eyebrow ?? ""}
              placeholder={PAGE_LABELS[slug]}
            />
          </div>
          <div className="form-field">
            <label className="form-label">Titre</label>
            <input
              name="title"
              className="form-input"
              defaultValue={page?.title ?? ""}
              placeholder={PAGE_LABELS[slug]}
            />
          </div>
          <div className="form-field">
            <label className="form-label">Texte d&apos;introduction</label>
            <textarea
              name="body"
              className="form-input"
              rows={4}
              defaultValue={page?.body ?? ""}
              placeholder="Texte affiché sous le titre."
            />
          </div>
        </div>

        {/* ── Photo hero ─────────────────────────────────────────────── */}
        <div className="admin-form-section">
          <h2 className="admin-form-section-title">Photo hero</h2>
          <div className="form-field">
            <ImageCropField
              label="Choisir une image"
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
              <Link href="/admin/media" style={{ color: "var(--orange)" }}>
                Importer une photo →
              </Link>
            </p>
          )}
        </div>

        {/* ── SEO ────────────────────────────────────────────────────── */}
        <div className="admin-form-section">
          <h2 className="admin-form-section-title">SEO</h2>
          <div className="form-field">
            <label className="form-label">Titre SEO (onglet navigateur)</label>
            <input
              name="seo_title"
              className="form-input"
              defaultValue={page?.seoTitle ?? ""}
              placeholder={`${PAGE_LABELS[slug]} — Manssuétude`}
            />
          </div>
          <div className="form-field">
            <label className="form-label">Description SEO</label>
            <textarea
              name="seo_description"
              className="form-input"
              rows={3}
              defaultValue={page?.seoDescription ?? ""}
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
