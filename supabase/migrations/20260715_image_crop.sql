-- Recadrage non destructif des images par emplacement.
-- Stocke le cadrage (croppedArea react-easy-crop en %) sans jamais modifier le fichier source.
-- Appliqué en CSS à l'affichage. Voir docs/DATABASE.md.

alter table pages add column if not exists image_crop jsonb;
alter table pages add column if not exists focus_image_crop jsonb;

comment on column pages.image_crop is 'Recadrage CSS de l''image hero (image_id) : { x, y, width, height, zoom } en %. NULL = cadrage par défaut (object-fit: cover centré).';
comment on column pages.focus_image_crop is 'Recadrage CSS de la photo du sujet du moment (seo_image_id) : { x, y, width, height, zoom } en %.';
