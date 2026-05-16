import { inferMediaType } from "@/lib/media";

export const mediaService = {
  analyze(filename: string, mimeType?: string, size?: number) {
    const type = inferMediaType(filename);
    return {
      type,
      mimeType: mimeType || "application/octet-stream",
      sizeLabel: size ? `${Math.max(1, Math.round(size / 1024))} Ko` : null,
      suggestedTags: [type, filename.split(".").pop()?.toLowerCase()].filter(Boolean),
      needsAlt: type === "image",
    };
  },

  isHeavy(size?: number) {
    return Boolean(size && size > 2_500_000);
  },
};
