import { Auth, setEnvDefaults } from "@auth/core";
import { authConfig } from "@/auth";
import { NextRequest } from "next/server";

/**
 * Spotify rejects "localhost" as an insecure redirect URI.
 * Next.js NextRequest normalizes 127.0.0.1 → localhost, so we call
 * Auth from @auth/core directly with a plain Request to preserve
 * the 127.0.0.1 origin from AUTH_URL.
 *
 * On the callback, Spotify redirects to 127.0.0.1 but auth cookies
 * live on localhost (where the user started). So we bounce the
 * callback back to localhost (keeping query params), then process
 * it with the URL rewritten to 127.0.0.1 for the token exchange.
 */

function getAuthOrigin(): URL | null {
  const authUrl = process.env.AUTH_URL;
  if (!authUrl) return null;
  return new URL(authUrl);
}

function isCallbackBounce(req: NextRequest): boolean {
  const host = req.headers.get("host") ?? "";
  return (
    host.startsWith("127.0.0.1") &&
    req.nextUrl.pathname.includes("/api/auth/callback/")
  );
}

function buildRequest(req: NextRequest): Request {
  const target = getAuthOrigin();
  if (!target) return req;

  const currentOrigin = req.nextUrl.origin;
  if (currentOrigin === target.origin) return req;

  const newUrl = req.nextUrl.href.replace(currentOrigin, target.origin);
  const headers = new Headers(req.headers);
  headers.set("host", target.host);

  return new Request(newUrl, {
    method: req.method,
    headers,
    body: req.method !== "GET" ? req.body : undefined,
    // @ts-expect-error duplex is needed for streaming body
    duplex: req.method !== "GET" ? "half" : undefined,
  });
}

function getConfig() {
  const config: any = { ...authConfig };
  setEnvDefaults(process.env, config);
  config.basePath ??= "/api/auth";
  return config;
}

export async function GET(req: NextRequest) {
  // When Spotify redirects to 127.0.0.1, bounce to localhost
  // so the browser sends auth cookies (which live on localhost).
  if (isCallbackBounce(req)) {
    const port = (req.headers.get("host") ?? "").split(":")[1] || "3000";
    const target = `http://localhost:${port}${req.nextUrl.pathname}${req.nextUrl.search}`;
    return new Response(null, { status: 302, headers: { Location: target } });
  }

  return Auth(buildRequest(req), getConfig()) as Promise<Response>;
}

export async function POST(req: NextRequest) {
  return Auth(buildRequest(req), getConfig()) as Promise<Response>;
}
