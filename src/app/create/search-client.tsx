"use client";

import { useState } from "react";
import Link from "next/link";
import type { AlbumResult } from "@/lib/spotify";

function AlbumSkeleton() {
  return (
    <div className="rounded-xl bg-warm-900 p-3">
      <div className="skeleton aspect-square rounded-lg" />
      <div className="skeleton mt-3 h-4 w-3/4 rounded" />
      <div className="skeleton mt-1.5 h-3 w-1/2 rounded" />
    </div>
  );
}

export default function SearchClient({
  initialQuery = "",
  initialAlbums = [],
}: {
  initialQuery?: string;
  initialAlbums?: AlbumResult[];
}) {
  const [albums, setAlbums] = useState<AlbumResult[]>(initialAlbums);
  const [artist, setArtist] = useState(initialQuery);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(initialAlbums.length > 0);

  async function handleSearch() {
    if (!artist) return;
    setIsSearching(true);
    setHasSearched(true);

    try {
      const res = await fetch(
        `/api/spotify/search?q=${encodeURIComponent(artist)}`
      );
      const data = await res.json();

      if (data.albums?.items) {
        const results: AlbumResult[] = data.albums.items
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

  return (
    <div className="min-h-screen px-4 pb-12 pt-20 animate-fade-in sm:px-8">
      <div
        className={`mx-auto max-w-4xl transition-all duration-700 ease-out ${
          !hasSearched ? "mt-[25vh]" : "mt-0"
        }`}
      >
        {!hasSearched && (
          <div className="mb-8 text-center animate-fade-in">
            <h2 className="font-display text-3xl font-bold text-warm-50 sm:text-4xl">
              Find an album
            </h2>
            <p className="mt-2 text-sm text-warm-400">
              Search by artist, album, or anything
            </p>
          </div>
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
              className="absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-warm-500"
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
              className="w-full rounded-full border border-warm-700 bg-warm-900 py-4 pl-13 pr-5 text-warm-50 placeholder-warm-500 outline-none transition-all focus:border-accent/50 focus:shadow-[0_0_0_3px_rgba(200,169,110,0.08)]"
              style={{ paddingLeft: "3.25rem" }}
            />
          </div>
        </form>
      </div>

      {/* Results count */}
      {!isSearching && hasSearched && albums.length > 0 && (
        <div className="mx-auto mt-10 max-w-6xl animate-fade-in">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px flex-1 bg-warm-800" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-warm-500">
              {albums.length} results
            </span>
            <div className="h-px flex-1 bg-warm-800" />
          </div>
        </div>
      )}

      {isSearching && (
        <div className="mx-auto mt-8 grid max-w-6xl grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <AlbumSkeleton key={i} />
          ))}
        </div>
      )}

      {!isSearching && albums.length > 0 && (
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {albums.map((album, index) => (
            <Link
              href={{
                pathname: `/create/${album.id}`,
                query: { search: artist },
              }}
              key={album.id}
              className="album-card group animate-slide-up overflow-hidden rounded-xl bg-warm-900 p-3 transition-colors hover:bg-warm-850"
              style={{ animationDelay: `${index * 40}ms` }}
            >
              <div className="relative overflow-hidden rounded-lg">
                <img
                  src={album.image}
                  alt={album.name}
                  className="aspect-square w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </div>
              <div className="mt-3 px-0.5">
                <p className="truncate text-sm font-medium text-warm-50">
                  {album.name}
                </p>
                <p className="mt-0.5 truncate text-xs text-warm-400">
                  {album.artist}
                  <span className="text-warm-600"> &middot; </span>
                  {album.year}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!isSearching && hasSearched && albums.length === 0 && (
        <div className="mt-24 text-center">
          <p className="font-display text-lg text-warm-500">No albums found</p>
          <p className="mt-1 text-sm text-warm-600">
            Try a different search term
          </p>
        </div>
      )}
    </div>
  );
}
