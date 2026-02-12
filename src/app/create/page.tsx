import { Suspense } from "react";
import { searchAlbums, type AlbumResult } from "@/lib/spotify";
import SearchClient from "./search-client";

function VinylSpinner() {
  return <div className="vinyl-spinner" />;
}

function SearchSkeleton() {
  return (
    <div className="min-h-screen px-4 pb-12 pt-20 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="skeleton mx-auto h-14 max-w-xl rounded-full" />
      </div>
      <div className="mx-auto mt-16 grid max-w-6xl grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="rounded-xl bg-warm-900 p-3">
            <div className="skeleton aspect-square rounded-lg" />
            <div className="skeleton mt-3 h-4 w-3/4 rounded" />
            <div className="skeleton mt-1.5 h-3 w-1/2 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

async function SearchResults({ query }: { query: string }) {
  const albums = await searchAlbums(query);
  return <SearchClient initialQuery={query} initialAlbums={albums} />;
}

export default async function CreatePage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const { search } = await searchParams;

  if (search) {
    return (
      <Suspense fallback={<SearchSkeleton />}>
        <SearchResults query={search} />
      </Suspense>
    );
  }

  return <SearchClient />;
}
