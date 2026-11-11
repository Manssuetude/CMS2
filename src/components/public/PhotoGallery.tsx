"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type { GalleryPhoto } from "@/types/cms";
import { photoCountLabel, preparePhotos, splitVisible } from "@/utils/gallery";

// Galerie photo éditoriale réutilisable (compte-rendu d'événement ; à terme
// projets et bloc « gallery »). Mise en page en lignes justifiées en CSS pur
// (flex-grow proportionnel au ratio — voir photo-gallery.css) : aucune mesure
// JS, rendu correct dès le HTML serveur, pas de saut à l'hydratation.

const PhotoGalleryLightbox = dynamic(() => import("@/components/public/PhotoGalleryLightbox"), { ssr: false });

// Hauteurs de ligne (px) — à garder synchronisées avec photo-gallery.css. Une
// vignette peut s'étirer pour remplir sa ligne : marge de 1.4 dans `sizes`.
const ROW_HEIGHT_DESKTOP = 260;
const ROW_HEIGHT_MOBILE = 180;
const SIZES_STRETCH = 1.4;

function thumbnailSizes(ratio: number) {
  const mobile = Math.round(ratio * ROW_HEIGHT_MOBILE * SIZES_STRETCH);
  const desktop = Math.round(ratio * ROW_HEIGHT_DESKTOP * SIZES_STRETCH);
  return `(max-width: 640px) ${mobile}px, ${desktop}px`;
}

export function PhotoGallery({
  photos,
  title,
  heading = "Galerie photo",
}: {
  photos: GalleryPhoto[];
  /** Titre du contenu (événement, projet…) — sert au texte alternatif de repli. */
  title: string;
  heading?: string;
}) {
  const prepared = useMemo(() => preparePhotos(photos, title), [photos, title]);
  const { visible, hiddenCount } = splitVisible(prepared);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Apparition douce au scroll : les vignettes ne sont masquées qu'une fois le
  // JS chargé (data-animate), jamais dans le HTML serveur.
  useEffect(() => {
    const list = listRef.current;
    if (!list || !("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    list.dataset.animate = "true";
    const observer = new IntersectionObserver(
      (entries) => {
        let batch = 0;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const item = entry.target as HTMLElement;
          item.style.setProperty("--reveal-delay", `${Math.min(batch, 6) * 60}ms`);
          item.classList.add("is-visible");
          observer.unobserve(item);
          batch += 1;
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    list.querySelectorAll(".photo-gallery-item").forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, [visible.length]);

  if (prepared.length === 0) return null;

  return (
    <section className="section photo-gallery-section">
      <div className="section-head">
        <h2>{heading}</h2>
        <span className="photo-gallery-count">{photoCountLabel(prepared.length)}</span>
      </div>
      <ul className="photo-gallery" ref={listRef}>
        {visible.map((photo, index) => (
          <li key={photo.id} className="photo-gallery-item" style={{ "--ratio": photo.ratio } as CSSProperties}>
            <button
              type="button"
              className="photo-gallery-trigger"
              aria-label={`Agrandir la photo ${index + 1} sur ${prepared.length} : ${photo.resolvedAlt}`}
              onClick={() => setOpenIndex(index)}
            >
              <Image
                src={photo.url}
                alt={photo.resolvedAlt}
                width={photo.width ?? 1200}
                height={photo.height ?? Math.round(1200 / photo.ratio)}
                sizes={thumbnailSizes(photo.ratio)}
                className="photo-gallery-img"
              />
            </button>
          </li>
        ))}
      </ul>
      {hiddenCount > 0 && (
        <button type="button" className="photo-gallery-more" onClick={() => setOpenIndex(visible.length)}>
          Voir les {prepared.length} photos
        </button>
      )}
      {openIndex !== null && (
        <PhotoGalleryLightbox photos={prepared} index={openIndex} onClose={() => setOpenIndex(null)} />
      )}
    </section>
  );
}
