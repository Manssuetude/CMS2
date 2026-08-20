import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Redirections 301 administrables (/admin/redirects) — lookup léger via
// l'API REST Supabase (pas de client @supabase/ssr complet ici : on n'a pas
// besoin de synchroniser les cookies de session sur les pages publiques).
async function findRedirectTarget(pathname: string): Promise<string | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) return null;

  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/redirects?from_path=eq.${encodeURIComponent(pathname)}&select=to_path&limit=1`,
      { headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` } },
    );
    if (!res.ok) return null;
    const rows: Array<{ to_path: string }> = await res.json();
    return rows[0]?.to_path ?? null;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname.startsWith("/admin");

  if (!isAdminRoute) {
    const target = await findRedirectTarget(pathname);
    if (target) {
      const redirectUrl = target.startsWith("http") ? target : new URL(target, request.url);
      return NextResponse.redirect(redirectUrl, 301);
    }
    return NextResponse.next();
  }

  // Expose le chemin courant aux Server Components (pour l'enforcement RBAC dans le layout).
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);
  let supabaseResponse = NextResponse.next({ request: { headers: requestHeaders } });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request: { headers: requestHeaders } });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, {
            ...options,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
          }),
        );
      },
    },
  });

  // Rafraichit la session Supabase Auth sur chaque requete
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isLoginPage = pathname === "/admin/login";
  // Page d'activation d'un compte invité : accessible sans session (les jetons
  // arrivent dans le fragment d'URL, pas dans un cookie).
  const isPublicAdmin = isLoginPage || pathname === "/admin/activation";

  // Redirige vers /admin/login si la session est absente
  if (!isPublicAdmin && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    return NextResponse.redirect(loginUrl);
  }

  // Redirige vers /admin/dashboard si deja connecte
  if (isLoginPage && user) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/admin/dashboard";
    return NextResponse.redirect(dashboardUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|txt|xml)$).*)"],
};
