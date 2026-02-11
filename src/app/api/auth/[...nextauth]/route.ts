import { Auth, setEnvDefaults } from "@auth/core";
import { authConfig } from "@/auth";
import { NextRequest } from "next/server";

/**
 * Spotify rejects "localhost" as an insecure redirect URI, requiring
 * 127.0.0.1 instead. Next.js NextRequest normalizes 127.0.0.1 → localhost,
 * so we call Auth from @auth/core directly with a plain Request to
 * preserve the 127.0.0.1 origin from AUTH_URL.
 *
 * Access the dev app at http://127.0.0.1:3000 (not localhost) so that
 * auth cookies and the Spotify callback share the same origin.
 */

function buildRequest(req: NextRequest): Request {
  const authUrl = process.env.AUTH_URL;
  if (!authUrl) return req;

  const target = new URL(authUrl);
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
  const builtReq = buildRequest(req);
  console.log("[auth] GET", builtReq.url);
  console.log("[auth] Cookie header:", builtReq.headers.get("cookie")?.substring(0, 200));
  const response = (await Auth(builtReq, getConfig())) as Response;
  const setCookies = response.headers.getSetCookie?.() ?? [];
  if (setCookies.length > 0) {
    console.log("[auth] Response Set-Cookie count:", setCookies.length);
    setCookies.forEach((c) => console.log("[auth]  ", c.substring(0, 100)));
  }
  console.log("[auth] Response status:", response.status);
  return response;
}

export async function POST(req: NextRequest) {
  const builtReq = buildRequest(req);
  console.log("[auth] POST", builtReq.url);
  console.log("[auth] Cookie header:", builtReq.headers.get("cookie")?.substring(0, 200));
  const response = (await Auth(builtReq, getConfig())) as Response;
  const setCookies = response.headers.getSetCookie?.() ?? [];
  if (setCookies.length > 0) {
    console.log("[auth] Response Set-Cookie count:", setCookies.length);
    setCookies.forEach((c) => console.log("[auth]  ", c.substring(0, 100)));
  }
  console.log("[auth] Response status:", response.status);
  return response;
}
