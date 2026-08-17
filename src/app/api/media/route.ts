import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { mediaRepository } from "@/repositories/mediaRepository";
import { errorResponse } from "@/lib/errors";
import { externalMediaSchema, mediaMetadataSchema } from "@/lib/validation";
import { logger } from "@/lib/logger";
import { parseTags } from "@/utils/tags";
import { fetchVideoOEmbed } from "@/utils/videoEmbed";

export async function GET() {
  try {
    await requireRole(["admin", "editor", "viewer"]);
    const media = await mediaRepository.list();
    return NextResponse.json(media);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireRole(["admin", "editor"]);
    const formData = await request.formData();
    const file = formData.get("file");

    if (file instanceof File) {
      const metadata = mediaMetadataSchema.parse({
        title: String(formData.get("title") || ""),
        alt: String(formData.get("alt") || ""),
        caption: String(formData.get("caption") || ""),
        description: String(formData.get("description") || ""),
        tags: String(formData.get("tags") || ""),
        visibility: String(formData.get("visibility") || "draft"),
      });
      const media = await mediaRepository.upload(file, metadata);
      logger.info("media.uploaded", { id: media.id, type: media.type });
      return NextResponse.json(media);
    }

    const externalMedia = externalMediaSchema.parse({
      externalUrl: String(formData.get("externalUrl") || ""),
      title: String(formData.get("title") || ""),
      type: String(formData.get("type") || "document"),
      tags: String(formData.get("tags") || ""),
      visibility: String(formData.get("visibility") || "draft"),
    });

    const source = externalMedia.externalUrl.includes("drive.google")
      ? "google-drive"
      : externalMedia.externalUrl.includes("youtube")
        ? "youtube"
        : externalMedia.externalUrl.includes("vimeo")
          ? "vimeo"
          : "external-url";

    // Vidéo YouTube/Vimeo : récupère titre + miniature via oEmbed public (pas de clé API)
    // si l'équipe n'a pas déjà renseigné un titre elle-même.
    let thumbnailUrl: string | null = null;
    let title = externalMedia.title;
    if (externalMedia.type === "video" && (source === "youtube" || source === "vimeo")) {
      const oEmbed = await fetchVideoOEmbed(externalMedia.externalUrl);
      if (oEmbed) {
        thumbnailUrl = oEmbed.thumbnailUrl;
        if (!title) title = oEmbed.title;
      }
    }

    const media = await mediaRepository.create({
      title: title || externalMedia.externalUrl,
      filename: externalMedia.externalUrl.split("/").pop() || "external-media",
      source,
      type: externalMedia.type || "document",
      mime_type: "application/octet-stream",
      url: externalMedia.externalUrl,
      preview_url: externalMedia.externalUrl,
      thumbnail_url: thumbnailUrl,
      tags: parseTags(externalMedia.tags),
      visibility: externalMedia.visibility,
    });
    logger.info("media.external.created", { id: media.id, source: media.source });
    return NextResponse.json(media);
  } catch (error) {
    return errorResponse(error);
  }
}
