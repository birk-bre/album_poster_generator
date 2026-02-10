"use client";

import { Suspense, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Login } from "../buttons";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type Album = {
  name: string;
  image: string;
  artist: string;
  id: string;
  year: string;
};

function Spinner() {
  return (
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-spotify-green" />
  );
}

function AlbumSkeleton() {
  return (
    <div>
      <div className="skeleton aspect-square rounded-lg" />
      <div className="skeleton mt-2.5 h-4 w-3/4 rounded" />
      <div className="skeleton mt-1.5 h-3 w-1/2 rounded" />
    </div>
  );
}

function SearchContent() {
  const query = useSearchParams();
  const searchQuery = query.get("search");
  const { data: session, status } = useSession();

  const [albums, setAlbums] = useState<Album[]>([]);
  const [artist, setArtist] = useState(searchQuery || "");
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (artist && session?.accessToken) handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken]);

  async function handleSearch() {
    if (!artist || !session?.accessToken) return;
    setIsSearching(true);
    setHasSearched(true);

    try {
      const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(artist)}&type=album&limit=20`;
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });

      const data = await res.json();

      if (data.albums?.items) {
        const results = data.albums.items
          .filter((album: any) => album.images?.length > 0)
          .map((album: any) => ({
            image: album.images[0].url,
            name: album.name,
            artist: album.artists[0]?.name ?? "",
            id: album.id,
            year: album.release_date?.split("-")[0] ?? "",
          }));
        setAlbums(results);
      }
    } catch (e) {
      console.error("Search failed:", e);
    } finally {
      setIsSearching(false);
    }
  }

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-xl text-zinc-400">Please sign in to continue</p>
        <Login />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 pb-12 pt-20 animate-fade-in">
      <div
        className={`mx-auto max-w-4xl transition-all duration-500 ${
          !hasSearched ? "mt-[28vh]" : "mt-0"
        }`}
      >
        {!hasSearched && (
          <h2 className="mb-6 text-center text-2xl font-bold text-zinc-300 animate-fade-in">
            Search for an album
          </h2>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="relative mx-auto max-w-xl"
        >
          <div className="relative">
            <svg
              className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
            <input
              type="text"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="Search for an artist or album..."
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 py-4 pl-12 pr-4 text-zinc-100 placeholder-zinc-500 outline-none transition-colors focus:border-spotify-green focus:ring-1 focus:ring-spotify-green"
            />
          </div>
        </form>
      </div>

      {isSearching && (
        <div className="mx-auto mt-12 grid max-w-6xl grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <AlbumSkeleton key={i} />
          ))}
        </div>
      )}

      {!isSearching && albums.length > 0 && (
        <div className="mx-auto mt-12 grid max-w-6xl grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {albums.map((album, index) => (
            <Link
              href={{
                pathname: `/create/${album.id}`,
                query: { search: artist },
              }}
              key={album.id}
              className="group animate-slide-up rounded-xl p-2.5 transition-colors hover:bg-zinc-900"
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <div className="relative overflow-hidden rounded-md">
                <img
                  src={album.image}
                  alt={album.name}
                  className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
              </div>
              <div className="mt-2.5 px-0.5">
                <p className="truncate text-sm font-medium text-zinc-100">
                  {album.name}
                </p>
                <p className="truncate text-xs text-zinc-500">
                  {album.artist} &middot; {album.year}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!isSearching && hasSearched && albums.length === 0 && (
        <div className="mt-24 text-center text-zinc-500">
          No albums found. Try a different search.
        </div>
      )}
    </div>
  );
}

function SearchLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Spinner />
    </div>
  );
}

export default function CreatePage() {
  return (
    <Suspense fallback={<SearchLoading />}>
      <SearchContent />
    </Suspense>
  );
}
