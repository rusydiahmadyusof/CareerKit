import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PREFIXES = ["/dashboard", "/resumes", "/applications", "/profile"];
const AUTH_PAGES = ["/login", "/signup", "/forgot-password", "/reset-password"];
const ONBOARDING_PATH = "/onboarding";

function isProtected(pathname: string) {
  return PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));
}
function isAuthPage(pathname: string) {
  return AUTH_PAGES.some((p) => pathname === p);
}
function isOnboarding(pathname: string) {
  return pathname === ONBOARDING_PATH || pathname.startsWith(ONBOARDING_PATH + "/");
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return response;
  }

  try {
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (isOnboarding(request.nextUrl.pathname) && !user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (isProtected(request.nextUrl.pathname) && !user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (isProtected(request.nextUrl.pathname) && user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, onboarding_skipped_at")
        .eq("user_id", user.id)
        .single();
      const complete = profile?.full_name?.trim() || profile?.onboarding_skipped_at;
      if (!complete) {
        return NextResponse.redirect(new URL(ONBOARDING_PATH, request.url));
      }
    }
    if (isAuthPage(request.nextUrl.pathname) && user) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  } catch {
    // If Supabase fails (e.g. network), continue without auth redirect
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
