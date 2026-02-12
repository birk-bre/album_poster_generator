import { Suspense } from "react";
import { fetchAlbum } from "@/lib/spotify";
import PosterClient from "./poster-client";

function VinylSpinner() {
  return <div className="vinyl-spinner" />;
}

function PosterLoading() {
  return (
    <div className="flex min-h-screen flex-col animate-fade-in">
      <div className="flex items-center border-b border-warm-800 px-6 py-4">
        <span className="text-sm text-warm-500">Loading...</span>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-6">
        <VinylSpinner />
        <div className="text-center">
          <p className="text-sm font-medium text-warm-300">
            Fetching album data...
          </p>
          <p className="mt-1 text-xs text-warm-600">This may take a moment</p>
        </div>
      </div>
    </div>
  );
}

async function AlbumPoster({ id }: { id: string }) {
  const album = await fetchAlbum(id);
  return <PosterClient album={album} />;
}

export default async function PosterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Suspense fallback={<PosterLoading />}>
      <AlbumPoster id={id} />
    </Suspense>
  );
}
