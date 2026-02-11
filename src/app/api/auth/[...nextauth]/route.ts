import { handlers } from "@/auth";
import { NextRequest } from "next/server";

// Debug wrapper to log env vars and headers in Vercel function logs
async function withDebug(handler: Function, req: NextRequest) {
  console.log("[auth-debug] AUTH_URL:", process.env.AUTH_URL ?? "(unset)");
  console.log("[auth-debug] NEXTAUTH_URL:", process.env.NEXTAUTH_URL ?? "(unset)");
  console.log("[auth-debug] VERCEL_URL:", process.env.VERCEL_URL ?? "(unset)");
  console.log("[auth-debug] AUTH_SECRET set:", !!process.env.AUTH_SECRET);
  console.log("[auth-debug] AUTH_SPOTIFY_ID:", process.env.AUTH_SPOTIFY_ID ?? "(unset)");
  console.log("[auth-debug] host:", req.headers.get("host"));
  console.log("[auth-debug] x-forwarded-host:", req.headers.get("x-forwarded-host"));
  console.log("[auth-debug] x-forwarded-proto:", req.headers.get("x-forwarded-proto"));

  try {
    return await handler(req);
  } catch (error) {
    console.error("[auth-debug] Error:", error);
    throw error;
  }
}

export async function GET(req: NextRequest) {
  return withDebug(handlers.GET, req);
}

export async function POST(req: NextRequest) {
  return withDebug(handlers.POST, req);
}
