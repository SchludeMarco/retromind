// "Nur für Eingeladene" (Marco, 2026-10-15): RetroMind is a private offer for
// the people Marco invited, not a public website. Every request needs the
// signed guest cookie from /gate.html (api/_guests.js); without it pages
// redirect to the gate and API calls get 401. Open without a cookie: the gate
// itself, the legal pages, the admin API (it checks Google itself; the gate
// signs in through it) and the approve link in the feedback mail. The guest
// list is checked again at most once a day, so removing someone takes effect
// within a day. Preview deployments are left alone (Vercel protects those).

import { next } from "@vercel/functions";
import { RECHECK_AFTER, clearCookie, guestsConfigured, isGuest, makeCookie, readCookie } from "./api/_guests.js";

const OPEN = [
  /^\/gate\.html$/,
  /^\/(datenschutz|privacy|impressum|imprint)\.html$/,
  /^\/legal\.css$/,
  /^\/retromind-logo-header\.webp$/,
  /^\/favicon\.ico$/,
  /^\/robots\.txt$/,
  /^\/api\/admin$/,
  /^\/api\/feedback-approve$/,
];

export const config = {
  // Built JavaScript and CSS hold no personal data and stay out of the check,
  // which saves middleware calls; the pages that load them are checked.
  matcher: ["/((?!assets/).*)"],
};

const isPage = (request) =>
  request.headers.get("sec-fetch-mode") === "navigate" || (request.headers.get("accept") || "").includes("text/html");

function deny(request, url) {
  if (url.pathname.startsWith("/api/") || !isPage(request)) {
    return new Response(JSON.stringify({ error: "guests_only" }), {
      status: 401,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  }
  const gate = new URL("/gate.html", url);
  gate.searchParams.set("next", url.pathname + url.search);
  return new Response(null, {
    status: 302,
    headers: { Location: gate.toString(), "Cache-Control": "no-store", "Set-Cookie": clearCookie() },
  });
}

export default async function middleware(request) {
  if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production") return next();
  // Without the database the gate can't work; rather stay open than lock everyone out.
  if (!guestsConfigured()) return next();
  const url = new URL(request.url);
  if (OPEN.some((re) => re.test(url.pathname))) return next();

  const guest = await readCookie(request.headers.get("cookie"));
  if (!guest) return deny(request, url);
  if (guest.age > RECHECK_AFTER && isPage(request)) {
    let still = true;
    try {
      still = await isGuest(guest.email);
    } catch {
      // Database hiccup: let the guest in, the next page view checks again.
      return next();
    }
    if (!still) return deny(request, url);
    return next({ headers: { "Set-Cookie": await makeCookie(guest.email) } });
  }
  return next();
}
