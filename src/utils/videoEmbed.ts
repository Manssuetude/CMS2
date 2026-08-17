// Reconnaît une URL YouTube/Vimeo "normale" (page de visionnage, lien court...)
// et la convertit en URL d'embed <iframe>, ou en récupère l'ID pour l'oEmbed.
// Pure et testable : aucun appel réseau ici.

export type VideoProvider = "youtube" | "vimeo";

export function detectVideoProvider(url: string): VideoProvider | null {
  if (/(?:youtube\.com|youtu\.be)/i.test(url)) return "youtube";
  if (/vimeo\.com/i.test(url)) return "vimeo";
  return null;
}

export function getEmbedUrl(url: string): string | null {
  const provider = detectVideoProvider(url);
  if (!provider) return null;

  if (provider === "youtube") {
    const idMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{6,})/);
    if (!idMatch) return null;
    return `https://www.youtube-nocookie.com/embed/${idMatch[1]}`;
  }

  const idMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (!idMatch) return null;
  return `https://player.vimeo.com/video/${idMatch[1]}`;
}

// oEmbed public, sans clé API — récupère titre + miniature pour un lien YouTube/Vimeo.
// Appel réseau : à utiliser côté serveur uniquement (route API), jamais dans un composant client.
export async function fetchVideoOEmbed(url: string): Promise<{ title: string; thumbnailUrl: string | null } | null> {
  const provider = detectVideoProvider(url);
  if (!provider) return null;

  const oEmbedUrl =
    provider === "youtube"
      ? `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
      : `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`;

  try {
    const res = await fetch(oEmbedUrl, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    const data = (await res.json()) as { title?: string; thumbnail_url?: string };
    return { title: data.title ?? "", thumbnailUrl: data.thumbnail_url ?? null };
  } catch {
    return null;
  }
}
