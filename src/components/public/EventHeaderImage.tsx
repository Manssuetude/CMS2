"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import type { GalleryPhoto } from "@/types/cms";
import { preparePhotos } from "@/utils/gallery";

// Même visionneuse que la galerie photo, chargée seulement au clic.
const PhotoGalleryLightbox = dynamic(() => import("@/components/public/PhotoGalleryLightbox"), { ssr: false });

// Image d'en-tête d'un événement (Classique ou Bannière). Au-dessus de la ligne
// de flottaison : chargée en priorité, avec ses vraies dimensions. Un clic
// l'ouvre en grand. `fit` : « contain » pour une affiche (jamais recadrée),
// « cover » pour une photo.
export function EventHeaderImage({
  photo,
  title,
  isPoster,
  fit,
  sizes,
  className,
}: {
  photo: GalleryPhoto;
  title: string;
  isPoster: boolean;
  fit: "contain" | "cover";
  sizes: string;
  className: string;
}) {
  const [prepared] = useMemo(() => preparePhotos([photo], title), [photo, title]);
  const [open, setOpen] = useState(false);
  // Repli d'alt générique (« titre, photo 1 ») remplacé par un libellé explicite.
  const alt = prepared.resolvedAlt.endsWith(", photo 1")
    ? `${isPoster ? "Affiche" : "Photo"} de l'événement « ${title} »`
    : prepared.resolvedAlt;

  return (
    <>
      <button
        type="button"
        className={`event-header-image ${className} event-header-image--${fit}`}
        aria-label={`Agrandir l'image : ${alt}`}
        onClick={() => setOpen(true)}
      >
        <Image
          src={photo.url}
          alt={alt}
          width={photo.width ?? 1600}
          height={photo.height ?? Math.round(1600 / prepared.ratio)}
          sizes={sizes}
          priority
        />
      </button>
      {open && (
        <PhotoGalleryLightbox photos={[{ ...prepared, resolvedAlt: alt }]} index={0} onClose={() => setOpen(false)} />
      )}
    </>
  );
}
