import { handlers } from "@/auth";
import { NextRequest } from "next/server";

function ensureAuthUrl(req: NextRequest) {
  if (!process.env.AUTH_URL) {
    const proto = req.headers.get("x-forwarded-proto") ?? "https";
    const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
    if (host) {
      process.env.AUTH_URL = `${proto}://${host}`;
    }
  }
}

export async function GET(req: NextRequest) {
  ensureAuthUrl(req);
  return handlers.GET(req);
}

export async function POST(req: NextRequest) {
  ensureAuthUrl(req);
  return handlers.POST(req);
}
