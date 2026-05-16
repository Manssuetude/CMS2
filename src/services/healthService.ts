import type { Media, Page, Production } from "@/types/cms";

export const healthService = {
  summarize(input: { pages: Page[]; media: Media[]; productions: Production[]; formsCount: number }) {
    return [
      {
        label: "SEO manquant",
        value: input.pages.filter((page) => !page.seoTitle || !page.seoDescription).length,
        severity: "high",
      },
      {
        label: "Images sans alt text",
        value: input.media.filter((media) => media.type === "image" && !media.alt).length,
        severity: "medium",
      },
      {
        label: "Brouillons oubliés",
        value: input.productions.filter((production) => production.status === "draft").length,
        severity: "medium",
      },
      {
        label: "Formulaires à traiter",
        value: input.formsCount,
        severity: "high",
      },
    ];
  },
};
