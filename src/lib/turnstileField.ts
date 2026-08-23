// Nom du champ caché injecté par le widget Turnstile côté client (voir
// components/forms/TurnstileWidget.tsx) et lu côté serveur (voir
// lib/turnstile.ts). Fichier séparé, sans dépendance serveur (secret/logger),
// pour rester importable en toute sécurité depuis un composant client.
export const TURNSTILE_FIELD_NAME = "cf-turnstile-response";
