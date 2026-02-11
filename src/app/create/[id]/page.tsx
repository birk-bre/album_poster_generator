"use client";

import { PDFViewer } from "@react-pdf/renderer";
import { Suspense, useEffect, useRef, useState } from "react";
import PDF from "../pdf";
import { processImage } from "@/util/processImage";
import { useSession } from "next-auth/react";
import { redirect, useSearchParams, useParams } from "next/navigation";
import Link from "next/link";

type Data = {
  colors: { r: number; g: number; b: number }[];
  albumName: string;
  artistName: string;
  releaseDate: string;
  label: string;
  tracks: string[];
  length: string;
  imgUrl: string;
  genres: string;
};

function VinylSpinner() {
  return <div className="vinyl-spinner" />;
}

function PosterContent() {
  const params = useParams<{ id: string }>();
  const { data: session, status } = useSession();
  const [data, setData] = useState<Data>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [loadingStep, setLoadingStep] = useState("Fetching album data...");
  const [isClient, setIsClient] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const query = useSearchParams();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (session?.accessToken && params.id) {
      handleCreate(params.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken, params.id]);

  async function handleCreate(id: string) {
    setIsLoading(true);
    setError(undefined);
    try {
      setLoadingStep("Fetching album data...");
      const res = await fetch(`https://api.spotify.com/v1/albums/${id}`, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch album data");
      const albumData = await res.json();

      setLoadingStep("Analyzing album artwork...");
      const imgResponse = await fetch(albumData.images[0].url);
      const blob = await imgResponse.blob();
      const file = new File([blob], "album.png", { type: "image/png" });
      const colors = await processImage(canvasRef, file);

      setLoadingStep("Generating poster...");
      const albumName: string = albumData.name;
      const artistName: string = albumData.artists[0].name;
      const releaseDate: string = albumData.release_date;
      const formattedDate = new Date(releaseDate)
        .toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
        .replace(/,/g, "");
      const label: string = albumData.label;
      const tracks: string[] = albumData.tracks.items.map(
        (track: any) => track.name
      );
      const lengthMs: number = albumData.tracks.items
        .map((track: any) => track.duration_ms)
        .reduce((a: number, b: number) => a + b, 0);
      const lengthMin = Math.floor(lengthMs / 60000);
      const lengthSec = Math.floor((lengthMs % 60000) / 1000);
      const totalLength = `${lengthMin}:${lengthSec.toString().padStart(2, "0")}`;
      const genres = albumData.genres?.join(" | ") ?? "";

      setData({
        colors: colors ?? [],
        albumName,
        artistName,
        releaseDate: formattedDate,
        label,
        tracks,
        length: totalLength,
        imgUrl: albumData.images[0].url,
        genres,
      });
    } catch (err) {
      console.error("Failed to generate poster:", err);
      setError("Failed to load album data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  if (status === "unauthenticated") {
    redirect("/");
  }

  if (status === "loading" || !isClient) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <VinylSpinner />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-warm-800 px-6 py-4">
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
        {data && (
          <div className="text-sm text-warm-500">
            <span className="text-warm-400">{data.artistName}</span>
            <span className="mx-2 text-warm-700">/</span>
            <span className="font-display font-semibold text-warm-100">
              {data.albumName}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-6">
          <VinylSpinner />
          <div className="text-center">
            <p className="text-sm font-medium text-warm-300">{loadingStep}</p>
            <p className="mt-1 text-xs text-warm-600">
              This may take a moment
            </p>
          </div>
        </div>
      ) : error ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-5">
          <p className="text-warm-400">{error}</p>
          <button
            onClick={() => params.id && handleCreate(params.id)}
            className="rounded-full border border-warm-700 bg-warm-900 px-6 py-2.5 text-sm font-medium text-warm-200 transition-all hover:border-accent/40 hover:text-accent"
          >
            Retry
          </button>
        </div>
      ) : data ? (
        <div className="flex-1 p-4 sm:p-6">
          <div className="mx-auto h-[calc(100vh-80px)] max-w-4xl">
            <PDFViewer
              width="100%"
              height="100%"
              className="rounded-xl border border-warm-800"
              showToolbar={true}
            >
              <PDF
                imageSrc={data.imgUrl}
                category={data.genres}
                songs={data.tracks}
                colors={data.colors}
                albumName={data.albumName}
                artistName={data.artistName}
                release_date={data.releaseDate}
                label={data.label}
                length={data.length}
              />
            </PDFViewer>
          </div>
        </div>
      ) : null}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

function PosterLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <VinylSpinner />
    </div>
  );
}

export default function RenderPDF() {
  return (
    <Suspense fallback={<PosterLoading />}>
      <PosterContent />
    </Suspense>
  );
}
