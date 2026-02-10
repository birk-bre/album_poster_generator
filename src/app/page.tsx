import { auth } from "@/auth";
import { Login } from "./buttons";
import Link from "next/link";

export default async function Home() {
  const session = await auth();

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="text-center animate-fade-in">
        <div className="mb-3 text-sm font-medium uppercase tracking-widest text-zinc-500">
          Album Poster Generator
        </div>
        <h1 className="text-5xl font-bold tracking-tight text-zinc-50 sm:text-6xl">
          Create stunning posters
          <br />
          <span className="text-spotify-green">from your music</span>
        </h1>
        <p className="mx-auto mt-4 max-w-md text-lg text-zinc-400">
          Search any album on Spotify and generate a beautifully designed
          printable poster with track listing and color palette.
        </p>
        <div className="mt-10">
          {session ? (
            <Link
              href="/create"
              className="inline-flex items-center gap-2 rounded-full bg-spotify-green px-8 py-3.5 text-lg font-semibold text-black transition-all hover:bg-spotify-hover hover:scale-105 active:scale-100"
            >
              Start Creating
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </Link>
          ) : (
            <Login />
          )}
        </div>
      </div>
    </main>
  );
}
