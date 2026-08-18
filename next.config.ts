import type { NextConfig } from "next";
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

export default nextConfig;
