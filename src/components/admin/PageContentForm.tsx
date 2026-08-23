"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import type { Media, Page } from "@/types/cms";
import { ImageCropField } from "@/components/media/ImageCropField";
import { HERO_ASPECT } from "@/constants/imageAspects";

type ActionFn = (formData: FormData) => Promise<void>;

const RichTextEditor = dynamic(() => import("@/components/editor/RichTextEditor").then((m) => m.RichTextEditor), {
  ssr: false,
  loading: () => (
    <div
      style={{
        minHeight: 160,
        border: "1px solid var(--line)",
        borderRadius: "var(--radius)",
        background: "var(--soft)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--muted)",
        fontSize: 13,
      }}
    >
      Chargement de l&apos;éditeur...
    </div>
  ),
});

interface Props {
  slug: string;
  label: string;
  page: Page | null;
  images: Media[];
  action: ActionFn;
}

export function PageContentForm({ slug, label, page, images, action }: Props) {
  const [body, setBody] = useState(page?.body ?? "");

  return (
    <form action={action} style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="body" value={body} />

      {/* ── En-tête (hero) ─────────────────────────────────────────── */}
      <div className="admin-form-section">
        <h2 className="admin-form-section-title">En-tête</h2>
        <div className="form-field">
          <label className="form-label">Étiquette (eyebrow)</label>
          <input name="eyebrow" className="form-input" defaultValue={page?.eyebrow ?? ""} placeholder={label} />
        </div>
        <div className="form-field">
          <label className="form-label">Titre</label>
          <input name="title" className="form-input" defaultValue={page?.title ?? ""} placeholder={label} />
        </div>
        <div className="form-field">
          <label className="form-label">Texte d&apos;introduction</label>
          <RichTextEditor value={body} onChange={setBody} />
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
            placeholder={`${label} — Manssuétude`}
          />
        </div>
        <div className="form-field">
          <label className="form-label">Description SEO</label>
          <textarea name="seo_description" className="form-input" rows={3} defaultValue={page?.seoDescription ?? ""} />
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button type="submit" className="cta" style={{ minWidth: 160 }}>
          Enregistrer les modifications
        </button>
      </div>
    </form>
  );
}
