-- EXEMPLE, NON EXÉCUTÉ : première annonce mise en avant (recrutement nov.–déc. 2026).
--
-- La voie normale est de la saisir dans /admin/annonces (Nouvelle annonce).
-- Ce fichier sert de référence des valeurs, ou de raccourci dans l'éditeur SQL
-- Supabase APRÈS la migration supabase/migrations/20261112_announcements.sql.
--
-- Avant de l'exécuter :
--   1. remplacer les deux dates (heure de Paris, ex. '2026-11-15 09:00 Europe/Paris') ;
--   2. importer hero-panel.jpg dans /admin/media (sinon image_id restera vide) ;
--   3. laisser `enabled = false` pour vérifier l'aperçu, puis activer depuis l'admin.
--
-- {date} dans les textes est remplacé à l'affichage par la date de clôture (ends_at).

INSERT INTO public.announcements (
    name, enabled, starts_at, ends_at,
    banner_enabled, banner_label, banner_text, banner_link_label, banner_link_url,
    hero_enabled, eyebrow, title, title_accent, subtitle, image_id,
    primary_cta_label, primary_cta_url, secondary_cta_label, secondary_cta_url,
    period_label, show_deadline, show_key_figures,
    final_enabled, final_eyebrow, final_title, final_text, final_cta_label, final_cta_url,
    header_badge, applies_to_join_page, seo_title, seo_description
) VALUES (
    'Recrutement nov.–déc. 2026',
    false,
    '[DATE DE DÉBUT] Europe/Paris'::timestamptz,  -- ex. '2026-11-15 09:00 Europe/Paris'
    '[DATE DE FIN] Europe/Paris'::timestamptz,    -- ex. '2026-12-31 23:59 Europe/Paris'
    -- Bandeau
    true,
    'Candidatures ouvertes',
    'Manssuétude recrute de nouveaux membres jusqu''au {date}.',
    'Rejoindre Manssuétude →',
    '/nous-rejoindre',
    -- Hero d'accueil
    true,
    'CANDIDATURES OUVERTES',
    'Manssuétude',
    'recrute.',
    'Un an pour poser les fondations. La suite, nous voulons la construire avec vous.',
    (SELECT id FROM public.resources WHERE filename = 'hero-panel.jpg' ORDER BY created_at DESC LIMIT 1),
    'Candidater',
    'https://forms.gle/NyM9MDZrdKcocHAW8',
    'Pourquoi nous rejoindre',
    '/nous-rejoindre',
    'Campagne novembre – décembre 2026',
    true,   -- « Clôture le [date] »
    true,   -- bande de chiffres clés
    -- Bloc final de l'accueil
    true,
    'REJOINDRE MANSSUÉTUDE',
    'Il y a encore tant de questions à poser.',
    'Remplissez le formulaire. Notre équipe Intégration vous recontactera.',
    'Candidater avant le {date}',
    'https://forms.gle/NyM9MDZrdKcocHAW8',
    -- Badge du header, /nous-rejoindre, SEO (vide = dérivé : « Manssuétude recrute | Candidatures ouvertes »)
    'OUVERT',
    true,
    NULL,
    NULL
);
