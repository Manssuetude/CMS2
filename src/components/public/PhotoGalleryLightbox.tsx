"use client";

import Lightbox, { type SlideImage } from "yet-another-react-lightbox";
import Captions from "yet-another-react-lightbox/plugins/captions";
import Counter from "yet-another-react-lightbox/plugins/counter";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";
import "yet-another-react-lightbox/plugins/counter.css";
import type { PreparedPhoto } from "@/utils/gallery";

// Visionneuse plein écran de PhotoGallery — chargée uniquement au premier clic
// (next/dynamic), pour ne rien ajouter au chargement initial de la page.
// La librairie gère déjà : focus piégé (reste de la page en `inert`), focus
// rendu à la vignette à la fermeture, clavier (flèches, Échap), swipe, et
// prefers-reduced-motion.

// Largeurs servies par l'optimiseur Next (deviceSizes par défaut) : le navigateur
// choisit via srcSet — ~1080px sur mobile, 1920/2048px sur grand écran, jamais
// l'original brut (jusqu'à 6 Mo).
const LIGHTBOX_WIDTHS = [640, 1080, 1920, 2048];

function optimizedUrl(src: string, width: number) {
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=80`;
}

function toSlide(photo: PreparedPhoto): SlideImage {
  const width = photo.width ?? 2048;
  const height = photo.height ?? Math.round(width / photo.ratio);
  const widths = LIGHTBOX_WIDTHS.filter((w) => w <= width);
  const sources = (widths.length > 0 ? widths : [LIGHTBOX_WIDTHS[0]]).map((w) => ({
    src: optimizedUrl(photo.url, w),
    width: w,
    height: Math.round((w * height) / width),
  }));
  return {
    src: sources[sources.length - 1].src,
    alt: photo.resolvedAlt,
    width,
    height,
    srcSet: sources,
    description: photo.caption ?? undefined,
  };
}

export default function PhotoGalleryLightbox({
  photos,
  index,
  onClose,
}: {
  photos: PreparedPhoto[];
  index: number;
  onClose: () => void;
}) {
  return (
    <Lightbox
      open
      index={index}
      close={onClose}
      slides={photos.map(toSlide)}
      plugins={[Captions, Counter]}
      className="photo-lightbox"
      controller={{ closeOnBackdropClick: true }}
      carousel={{ finite: photos.length <= 1, padding: "16px" }}
      captions={{ descriptionTextAlign: "center", descriptionMaxLines: 4 }}
      render={photos.length <= 1 ? { buttonPrev: () => null, buttonNext: () => null } : undefined}
      labels={{
        Previous: "Photo précédente",
        Next: "Photo suivante",
        Close: "Fermer",
        Lightbox: "Visionneuse photo",
        Carousel: "Diaporama",
        "Photo gallery": "Galerie photo",
        Slide: "Photo",
        Caption: "Légende",
        "{index} of {total}": "{index} sur {total}",
      }}
    />
  );
}
