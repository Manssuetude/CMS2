import type { MetadataRoute } from "next";
import { SITE_URL } from "@/constants/site";
import { activityRepository } from "@/repositories/activityRepository";
import { productionRepository } from "@/repositories/productionRepository";
import { projectRepository } from "@/repositories/projectRepository";
import { subThemeRepository } from "@/repositories/subThemeRepository";
import { themeRepository } from "@/repositories/themeRepository";
import { journalRepository } from "@/repositories/journalRepository";

// Régénéré au plus toutes les 60s (cohérent avec l'ISR des pages publiques).
export const revalidate = 60;

// Pages statiques du site public (hors espace admin / API / pages de repli).
const STATIC_PATHS: Array<{
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
}> = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/themes", priority: 0.9, changeFrequency: "weekly" },
  { path: "/activites", priority: 0.9, changeFrequency: "weekly" },
  { path: "/productions", priority: 0.9, changeFrequency: "weekly" },
  { path: "/journal", priority: 0.8, changeFrequency: "weekly" },
  { path: "/projets", priority: 0.8, changeFrequency: "weekly" },
  { path: "/perca", priority: 0.7, changeFrequency: "monthly" },
  { path: "/a-propos", priority: 0.7, changeFrequency: "monthly" },
  { path: "/nous-soutenir", priority: 0.6, changeFrequency: "monthly" },
  { path: "/nous-rejoindre", priority: 0.6, changeFrequency: "monthly" },
  { path: "/ressources", priority: 0.6, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.5, changeFrequency: "yearly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map(({ path, priority, changeFrequency }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));

  // Entités dynamiques (uniquement le contenu publié — includeDrafts par défaut = false).
  try {
    const [themes, subThemes, productions, activities, projects, journalEntries] = await Promise.all([
      themeRepository.listThemes(),
      subThemeRepository.listSubThemes(),
      productionRepository.listProductions(),
      activityRepository.listActivities(),
      projectRepository.listProjects(),
      journalRepository.listEntries(),
    ]);
    const themeSlugById = new Map(themes.map((t) => [t.id, t.slug]));

    const dynamicEntries: MetadataRoute.Sitemap = [
      ...themes.map((t) => ({
        url: `${SITE_URL}/themes/${t.slug}`,
        lastModified: new Date(t.updatedAt),
        changeFrequency: "monthly" as const,
        priority: 0.7,
      })),
      ...subThemes.flatMap((st) => {
        const themeSlug = themeSlugById.get(st.themeId);
        return themeSlug
          ? [
              {
                url: `${SITE_URL}/themes/${themeSlug}/${st.slug}`,
                lastModified: new Date(st.updatedAt),
                changeFrequency: "monthly" as const,
                priority: 0.6,
              },
            ]
          : [];
      }),
      ...productions.map((p) => ({
        url: `${SITE_URL}/productions/${p.slug}`,
        lastModified: new Date(p.updatedAt),
        changeFrequency: "monthly" as const,
        priority: 0.7,
      })),
      ...activities.map((a) => ({
        url: `${SITE_URL}/activites/${a.slug}`,
        lastModified: new Date(a.updatedAt),
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
      ...projects.map((p) => ({
        url: `${SITE_URL}/projets/${p.slug}`,
        lastModified: new Date(p.updatedAt),
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
      ...journalEntries.map((e) => ({
        url: `${SITE_URL}/journal/${e.slug}`,
        lastModified: new Date(e.updatedAt),
        changeFrequency: "monthly" as const,
        priority: 0.5,
      })),
    ];

    return [...staticEntries, ...dynamicEntries];
  } catch {
    // Base injoignable au build (CI sans identifiants) : le sitemap se remplira à la première requête via l'ISR.
    return staticEntries;
  }
}
