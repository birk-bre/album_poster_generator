"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import PDF from "../pdf";
import { processImage } from "@/util/processImage";
import type { AlbumDetail } from "@/lib/spotify";

const PDFViewer = dynamic(
  () => import("@react-pdf/renderer").then((m) => m.PDFViewer),
  { ssr: false }
);

function VinylSpinner() {
  return <div className="vinyl-spinner" />;
}

export default function PosterClient({ album }: { album: AlbumDetail }) {
  const [colors, setColors] = useState<{ r: number; g: number; b: number }[]>();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const query = useSearchParams();

  useEffect(() => {
    processAlbumArt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function processAlbumArt() {
    try {
      const imgResponse = await fetch(album.imgUrl);
      const blob = await imgResponse.blob();
      const file = new File([blob], "album.png", { type: "image/png" });
      const result = await processImage(canvasRef, file);
      setColors(result ?? []);
    } catch (err) {
      console.error("Failed to process album art:", err);
      setError("Failed to process album artwork. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-warm-800 px-6 py-4 pr-32">
        <Link
          href={{
            pathname: "/create",
            query: { search: query.get("search") },
          }}
          className="group inline-flex items-center gap-2 text-sm text-warm-400 transition-colors hover:text-accent"
        >
          <svg
            className="h-4 w-4 transition-transform group-hover:-translate-x-0.5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
            />
          </svg>
          Back to search
        </Link>
        <div className="text-sm text-warm-500">
          <span className="text-warm-400">{album.artistName}</span>
          <span className="mx-2 text-warm-700">/</span>
          <span className="font-display font-semibold text-warm-100">
            {album.albumName}
          </span>
        </div>
      </div>

      {/* Content */}
      {isProcessing ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-6">
          <VinylSpinner />
          <div className="text-center">
            <p className="text-sm font-medium text-warm-300">
              Analyzing album artwork...
            </p>
            <p className="mt-1 text-xs text-warm-600">
              This may take a moment
            </p>
          </div>
        </div>
      ) : error ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-5">
          <p className="text-warm-400">{error}</p>
          <button
            onClick={() => {
              setError(undefined);
              setIsProcessing(true);
              processAlbumArt();
            }}
            className="rounded-full border border-warm-700 bg-warm-900 px-6 py-2.5 text-sm font-medium text-warm-200 transition-all hover:border-accent/40 hover:text-accent"
          >
            Retry
          </button>
        </div>
      ) : colors ? (
        <div className="flex-1 p-4 sm:p-6">
          <div className="mx-auto h-[calc(100vh-80px)] max-w-4xl">
            <PDFViewer
              width="100%"
              height="100%"
              className="rounded-xl border border-warm-800"
              showToolbar={true}
            >
              <PDF
                imageSrc={album.imgUrl}
                category={album.genres}
                songs={album.tracks}
                colors={colors}
                albumName={album.albumName}
                artistName={album.artistName}
                release_date={album.releaseDate}
                label={album.label}
                length={album.length}
              />
            </PDFViewer>
          </div>
        </div>
      ) : null}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
