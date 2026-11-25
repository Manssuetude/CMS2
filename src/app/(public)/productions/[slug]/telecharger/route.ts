import { NextResponse } from "next/server";
import { getProductionPdfDownload } from "@/services/productionReadingService";

// Téléchargement direct du PDF d'une production publiée. Le fichier ne
// transite pas par la fonction (limite de réponse Vercel ≈ 4,5 Mo) : 302 vers
// l'URL publique du Storage avec `download=<nom>`, Supabase répond alors en
// pièce jointe. 404 si la production est inconnue, non publiée ou sans PDF.

const HEADERS = { "Cache-Control": "public, max-age=300", "X-Robots-Tag": "noindex" };

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let download;
  try {
    download = await getProductionPdfDownload(slug);
  } catch {
    return new NextResponse("Le PDF est momentanément indisponible.", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8", "X-Robots-Tag": "noindex", "Cache-Control": "no-store" },
    });
  }
  if (download.status === 404) {
    return new NextResponse("Ce PDF n'existe pas ou n'est plus disponible.", {
      status: 404,
      headers: { ...HEADERS, "Content-Type": "text/plain; charset=utf-8" },
    });
  }
  return new NextResponse(null, { status: 302, headers: { ...HEADERS, Location: download.location } });
}
