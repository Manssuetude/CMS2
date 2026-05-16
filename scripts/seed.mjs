import { readFileSync } from "node:fs";
import { join } from "node:path";
import vm from "node:vm";
import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

function loadEnv() {
  const envPath = join(process.cwd(), ".env.local");
  const raw = readFileSync(envPath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const [key, ...rest] = line.split("=");
    process.env[key.trim()] ||= rest.join("=").trim();
  }
}

function loadLegacyContent() {
  const raw = readFileSync(join(process.cwd(), "content.js"), "utf8");
  const context = {};
  vm.createContext(context);
  vm.runInContext(`${raw}; this.SITE_CONTENT = SITE_CONTENT;`, context);
  if (!context.SITE_CONTENT) throw new Error("SITE_CONTENT introuvable dans content.js");
  return context.SITE_CONTENT;
}

function stableUuid(input) {
  const hash = createHash("sha1").update(input).digest("hex");
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-8${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

function inferMediaType(filename) {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (["jpg", "jpeg", "png", "webp", "svg"].includes(ext || "")) return "image";
  if (["mp4", "mov", "webm"].includes(ext || "")) return "video";
  if (["mp3", "wav", "m4a"].includes(ext || "")) return "audio";
  if (ext === "pdf") return "pdf";
  if (ext === "zip") return "archive";
  return "document";
}

function status(value) {
  return value === "archived" ? "archived" : value === "draft" ? "draft" : "published";
}

function progress(value) {
  const map = {
    idée: "idea",
    preparation: "preparation",
    préparation: "preparation",
    "en cours": "active",
    active: "active",
    terminé: "completed",
    completed: "completed",
    suspendu: "paused",
  };
  return value ? map[value] || "preparation" : null;
}

async function upsert(db, table, payload, onConflict) {
  const { error } = await db.from(table).upsert(payload, { onConflict });
  if (error) throw new Error(`${table}: ${error.message}`);
}

async function main() {
  loadEnv();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) throw new Error("Variables Supabase manquantes dans .env.local");

  const db = createClient(url, serviceKey, { auth: { persistSession: false } });
  const content = loadLegacyContent();
  const mediaByUrl = new Map();

  const mediaInputs = [
    content.meta.logo,
    content.meta.favicon,
    content.meta.fallbackImage,
    ...Object.values(content.pages).flatMap((page) => [page.image, page.seo?.image]),
    ...content.collections.themes.flatMap((item) => [item.heroImage, item.thumbnail]),
    ...content.collections.productions.flatMap((item) => [item.thumbnail, item.fileUrl]),
    ...content.collections.activities.flatMap((item) => [...(item.gallery || [])]),
    ...content.collections.resources.map((item) => item.url),
  ].filter(Boolean);

  for (const mediaUrl of [...new Set(mediaInputs)]) {
    const id = stableUuid(`media:${mediaUrl}`);
    const filename = String(mediaUrl).split("/").pop() || "media";
    mediaByUrl.set(mediaUrl, id);
    await upsert(
      db,
      "resources",
      {
        id,
        title: filename.replace(/\.[^.]+$/, "").replaceAll("-", " "),
        filename,
        source: "upload",
        type: inferMediaType(filename),
        mime_type: "application/octet-stream",
        url: mediaUrl,
        preview_url: mediaUrl,
        thumbnail_url: inferMediaType(filename) === "image" ? mediaUrl : null,
        alt: filename,
        description: "Média importé depuis content.js",
        tags: [],
        visibility: "public",
      },
      "id",
    );
  }

  for (const [slug, page] of Object.entries(content.pages)) {
    await upsert(
      db,
      "pages",
      {
        id: stableUuid(`page:${slug}`),
        slug,
        title: page.title,
        eyebrow: page.eyebrow,
        body: page.body,
        image_id: mediaByUrl.get(page.image) || null,
        quote: page.quote || null,
        primary_cta_label: page.primary?.label || null,
        primary_cta_target: page.primary?.ctaKey || null,
        secondary_cta_label: page.secondary?.label || null,
        secondary_cta_target: page.secondary?.ctaKey || null,
        sections: page.sections || [],
        seo_title: page.seo?.title || page.title,
        seo_description: page.seo?.description || page.body,
        seo_image_id: mediaByUrl.get(page.seo?.image) || null,
        status: "published",
      },
      "slug",
    );
  }

  for (const theme of content.collections.themes) {
    await upsert(
      db,
      "themes",
      {
        id: stableUuid(theme.id),
        slug: theme.slug,
        title: theme.title,
        short_title: theme.shortTitle,
        description: theme.description,
        long_description: theme.longDescription,
        hero_image_id: mediaByUrl.get(theme.heroImage) || null,
        thumbnail_id: mediaByUrl.get(theme.thumbnail) || null,
        status: status(theme.status),
        progress_status: progress(theme.progressStatus),
        featured: Boolean(theme.featured),
        tags: theme.tags || [],
      },
      "slug",
    );
  }

  for (const prod of content.collections.productions) {
    await upsert(
      db,
      "productions",
      {
        id: stableUuid(prod.id),
        slug: prod.slug,
        title: prod.title,
        type: prod.type,
        description: prod.description,
        content_blocks: prod.contentBlocks || [],
        author: prod.author,
        date: prod.date || null,
        thumbnail_id: mediaByUrl.get(prod.thumbnail) || null,
        file_id: mediaByUrl.get(prod.fileUrl) || null,
        reading_time: prod.readingTime || null,
        pages: prod.pages || null,
        tags: prod.tags || [],
        status: status(prod.status),
        featured: Boolean(prod.featured),
      },
      "slug",
    );
  }

  for (const activity of content.collections.activities) {
    await upsert(
      db,
      "activities",
      {
        id: stableUuid(activity.id),
        slug: activity.slug,
        title: activity.title,
        format: activity.format,
        description: activity.description,
        date: activity.date,
        status: status(activity.status),
        progress_status: progress(activity.progressStatus),
        gallery: (activity.gallery || []).map((galleryUrl) => mediaByUrl.get(galleryUrl)).filter(Boolean),
        documents: [],
      },
      "slug",
    );
  }

  for (const project of content.collections.projects) {
    await upsert(
      db,
      "projects",
      {
        id: stableUuid(project.id),
        slug: project.slug,
        title: project.title,
        category: project.category,
        status: status(project.status),
        progress_status: progress(project.progressStatus),
        priority: project.priority,
        description: project.description,
        objectives: project.objectives || [],
        deliverables: project.deliverables || [],
        documents: [],
        featured: Boolean(project.featured),
      },
      "slug",
    );
  }

  for (const resource of content.collections.resources) {
    await upsert(
      db,
      "resources",
      {
        id: stableUuid(resource.id),
        title: resource.title,
        filename: resource.filename,
        source: resource.source || "upload",
        type: resource.type === "pdf" ? "pdf" : resource.type || inferMediaType(resource.filename),
        mime_type: resource.mimeType || "application/octet-stream",
        url: resource.url,
        preview_url: resource.previewUrl || resource.url,
        thumbnail_url: resource.thumbnailUrl || null,
        size: resource.size,
        alt: resource.alt,
        caption: resource.caption,
        description: resource.description || resource.caption,
        tags: resource.tags || [],
        visibility: resource.visibility === "privé" ? "private" : resource.visibility || "public",
      },
      "id",
    );
  }

  await upsert(
    db,
    "site_settings",
    {
      id: "default",
      logo_id: mediaByUrl.get(content.meta.logo) || null,
      favicon_id: mediaByUrl.get(content.meta.favicon) || null,
      primary_color: content.meta.colors.primary,
      secondary_color: content.meta.colors.secondary,
      fallback_image_id: mediaByUrl.get(content.meta.fallbackImage) || null,
      tagline: content.meta.tagline,
      footer_config: content.footerConfig,
      homepage_config: content.homepageConfig,
    },
    "id",
  );

  if (process.env.ADMIN_INITIAL_EMAIL && process.env.ADMIN_INITIAL_PASSWORD) {
    await upsert(
      db,
      "users",
      {
        email: process.env.ADMIN_INITIAL_EMAIL,
        name: "Administrateur Manssuétude",
        role: "admin",
        password_hash: createHash("sha256").update(process.env.ADMIN_INITIAL_PASSWORD).digest("hex"),
      },
      "email",
    );
  }

  console.log("Seed Manssuétude terminé.");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
