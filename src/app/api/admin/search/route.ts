import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ results: [] }, { status: 401 });

  const q = req.nextUrl.searchParams.get("q") ?? "";
  if (q.length < 2) return NextResponse.json({ results: [] });

  const db = getSupabaseAdmin();
  const pattern = `%${q}%`;

  const [acts, prods, projs, themes, subThemes] = await Promise.all([
    db.from("activities").select("id, title, status").ilike("title", pattern).limit(5),
    db.from("productions").select("id, title, status").ilike("title", pattern).limit(5),
    db.from("projects").select("id, title, status").ilike("title", pattern).limit(5),
    db.from("themes").select("id, title, status").ilike("title", pattern).limit(5),
    db.from("sub_themes").select("id, title, status").ilike("title", pattern).limit(5),
  ]);

  const results = [
    ...(acts.data ?? []).map((r) => ({ ...r, type: "activity", href: `/admin/activites/${r.id}/edit` })),
    ...(prods.data ?? []).map((r) => ({ ...r, type: "production", href: `/admin/productions/${r.id}/edit` })),
    ...(projs.data ?? []).map((r) => ({ ...r, type: "project", href: `/admin/projets/${r.id}/edit` })),
    ...(themes.data ?? []).map((r) => ({ ...r, type: "theme", href: `/admin/themes/${r.id}/edit` })),
    ...(subThemes.data ?? []).map((r) => ({ ...r, type: "sub_theme", href: `/admin/sousthemes/${r.id}/edit` })),
  ];

  return NextResponse.json({ results });
}
