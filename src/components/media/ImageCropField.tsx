"use client";

import { useMemo, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import type { ImageCrop, Media } from "@/types/cms";
import { cropToImageStyle } from "@/utils/imageCrop";

function toAbsoluteUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (url.startsWith("http") || url.startsWith("/")) return url;
  return `/${url}`;
}

export function ImageCropField({
  label,
  name,
  cropName,
  images,
  defaultImageId,
  defaultCrop,
  aspect,
  emptyOptionLabel = "Image par défaut",
}: {
  label?: string;
  /** Nom du champ pour l'id de l'image (ex. "image_id"). */
  name: string;
  /** Nom du champ caché pour le recadrage (ex. "image_crop"). */
  cropName: string;
  images: Media[];
  defaultImageId?: string | null;
  defaultCrop?: ImageCrop | null;
  /** Ratio largeur/hauteur du conteneur cible (voir constants/imageAspects.ts). */
  aspect: number;
  emptyOptionLabel?: string;
}) {
  const [imageId, setImageId] = useState(defaultImageId ?? "");
  const [crop, setCrop] = useState<ImageCrop | null>(defaultCrop ?? null);
  const [editing, setEditing] = useState(false);

  const selectedUrl = useMemo(() => {
    const found = images.find((img) => img.id === imageId);
    return toAbsoluteUrl(found?.url);
  }, [images, imageId]);

  function handleImageChange(nextId: string) {
    setImageId(nextId);
    // Le cadrage est propre à une image + un emplacement : on le réinitialise si l'image change.
    if (nextId !== (defaultImageId ?? "")) {
      setCrop(null);
    } else {
      setCrop(defaultCrop ?? null);
    }
  }

  return (
    <div className="image-crop-field">
      {label ? <label className="form-label">{label}</label> : null}

      <select
        name={name}
        className="form-input"
        value={imageId}
        onChange={(event) => handleImageChange(event.target.value)}
      >
        <option value="">{emptyOptionLabel}</option>
        {images.map((img) => (
          <option key={img.id} value={img.id}>
            {img.title || img.filename}
          </option>
        ))}
      </select>

      {/* Valeur du recadrage soumise avec le formulaire (chaîne JSON ou vide). */}
      <input type="hidden" name={cropName} value={crop ? JSON.stringify(crop) : ""} />

      {selectedUrl ? (
        <div className="image-crop-preview-row">
          <div className="image-crop-preview" style={{ aspectRatio: String(aspect) }}>
            <img
              src={selectedUrl}
              alt="Aperçu du cadrage"
              style={{ width: "100%", height: "100%", objectFit: "cover", ...cropToImageStyle(crop) }}
            />
          </div>
          <div className="image-crop-actions">
            <button type="button" className="button" onClick={() => setEditing(true)}>
              Éditer l&apos;image
            </button>
            {crop ? (
              <button type="button" className="button button--ghost" onClick={() => setCrop(null)}>
                Cadrage par défaut
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      {editing && selectedUrl ? (
        <CropModal
          url={selectedUrl}
          aspect={aspect}
          initialCrop={crop}
          onCancel={() => setEditing(false)}
          onValidate={(value) => {
            setCrop(value);
            setEditing(false);
          }}
        />
      ) : null}
    </div>
  );
}

function CropModal({
  url,
  aspect,
  initialCrop,
  onCancel,
  onValidate,
}: {
  url: string;
  aspect: number;
  initialCrop: ImageCrop | null;
  onCancel: () => void;
  onValidate: (crop: ImageCrop) => void;
}) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(initialCrop?.zoom ?? 1);
  const [area, setArea] = useState<ImageCrop | null>(initialCrop);

  const initialAreaPercentages = initialCrop
    ? { x: initialCrop.x, y: initialCrop.y, width: initialCrop.width, height: initialCrop.height }
    : undefined;

  // react-easy-crop appelle onCropComplete(croppedArea, croppedAreaPixels) :
  // le 1er argument est en POURCENTAGES (ce qu'on stocke), le 2nd en pixels.
  function handleCropComplete(percentages: Area, _pixels: Area) {
    setArea({ x: percentages.x, y: percentages.y, width: percentages.width, height: percentages.height, zoom });
  }

  return (
    <div className="crop-modal-overlay" role="dialog" aria-modal="true" aria-label="Éditer le cadrage de l'image">
      <div className="crop-modal">
        <div className="crop-modal-head">
          <strong>Cadrer l&apos;image</strong>
          <span className="crop-modal-hint">Glissez pour déplacer, utilisez le curseur ou la molette pour zoomer.</span>
        </div>
        <div className="crop-modal-stage">
          <Cropper
            image={url}
            crop={position}
            zoom={zoom}
            aspect={aspect}
            minZoom={1}
            maxZoom={4}
            zoomWithScroll
            restrictPosition
            initialCroppedAreaPercentages={initialAreaPercentages}
            onCropChange={setPosition}
            onZoomChange={setZoom}
            onCropComplete={handleCropComplete}
          />
        </div>
        <div className="crop-modal-controls">
          <label className="crop-modal-zoom">
            Zoom
            <input
              type="range"
              min={1}
              max={4}
              step={0.01}
              value={zoom}
              onChange={(event) => setZoom(Number(event.target.value))}
            />
          </label>
        </div>
        <div className="crop-modal-footer">
          <button type="button" className="button button--ghost" onClick={onCancel}>
            Annuler
          </button>
          <button
            type="button"
            className="button"
            onClick={() => {
              if (area) onValidate({ ...area, zoom });
              else onCancel();
            }}
          >
            Valider le cadrage
          </button>
        </div>
      </div>
    </div>
  );
}
