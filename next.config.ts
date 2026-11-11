import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = dirname(fileURLToPath(import.meta.url));
const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  outputFileTracingRoot: projectRoot,
  transpilePackages: ["ckeditor5", "@ckeditor/ckeditor5-react"],
  turbopack: {
    root: projectRoot,
  },
  async headers() {
    if (!isProd) return [];
    return [
      {
        source: "/assets/(.*)",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/_next/static/(.*)",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        // En-têtes de sécurité sans allowlist de domaines (pas de CSP) : une CSP mal
        // calibrée casserait silencieusement CKEditor, les embeds YouTube/Vimeo
        // (chapitre 2) ou Vercel Analytics sans qu'on puisse le vérifier ce soir sur
        // un vrai déploiement — à construire et tester avec un déploiement de preview
        // avant de l'activer, pas à deviner en aveugle.
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          // HSTS : HTTPS imposé 2 ans, sous-domaines compris (membre., apis.… sont
          // tous en HTTPS). « preload » rend le domaine éligible à la liste HSTS
          // des navigateurs — l'inscription sur hstspreload.org reste manuelle.
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "drive.google.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
};

// Analyse du bundle JS à la demande : ANALYZE=true npm run build
// (rapports dans .next/analyze/, jamais activé en CI ni sur Vercel).
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
  openAnalyzer: false,
  analyzerMode: "json",
});

export default withBundleAnalyzer(nextConfig);
