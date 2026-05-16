import { uniqueTags } from "@/utils/tags";

export const taxonomyService = {
  normalizeTags(tags: string[]) {
    return uniqueTags(tags);
  },

  suggestTags(input: { title?: string | null; description?: string | null; existing?: string[] }) {
    const source = `${input.title || ""} ${input.description || ""}`.toLowerCase();
    const suggestions = [
      ["perca", "PERCA"],
      ["cemac", "CEMAC"],
      ["production", "production"],
      ["débat", "débat"],
      ["debat", "débat"],
      ["ressource", "ressource"],
      ["projet", "projet"],
      ["jeunesse", "jeunesse"],
      ["industrialisation", "industrialisation"],
      ["gouvernance", "gouvernance"],
    ]
      .filter(([needle]) => source.includes(needle))
      .map(([, label]) => label);

    return this.normalizeTags([...(input.existing || []), ...suggestions]);
  },
};
