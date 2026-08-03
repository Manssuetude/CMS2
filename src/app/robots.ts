import type { MetadataRoute } from "next";
import { SITE_URL } from "@/constants/site";

// Généré par Next.js et servi sur /robots.txt. Autorise l'indexation du site public,
// exclut l'espace d'administration et les routes API, et déclare le sitemap.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
