"use client";
import { PDFViewer } from "@react-pdf/renderer";
import { useEffect, useMemo, useRef, useState } from "react";
import PDF from "../pdf";
import { processImage } from "@/util/processImage";
import { useSession } from "next-auth/react";
import { redirect, useSearchParams } from "next/navigation";
import Link from "next/link";

type Data = {
  colors: {
    r: number;
    g: number;
    b: number;
  }[];
  albumName: string;
  artistName: string;
  relaseDate: string;
  label: string;
  tracks: string[];
  length: string;
  imgUrl: string;
  genres: string;
};

export default function RenderPDF({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const [data, setData] = useState<Data>();
  const [isClient, setIsClient] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const query = useSearchParams();

  const handleCreate = useMemo(
    () =>
      async function handleCreate(id: string) {
        const URL = `https://api.spotify.com/v1/albums/${id}`;
        const res = await fetch(URL, {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        });
        const data = await res.json();

        const response = await fetch(data.images[0].url);
        const blob = await response.blob();
        const file = new File([blob], "album.png", { type: "image/png" });

        const colors = await processImage(canvasRef, file);
        const albumName: string = data.name;
        const artistName: string = data.artists[0].name;
        const relaseDate: string = data.release_date;

        const formattedRelease = new Date(relaseDate);
        const formattedDate = formattedRelease.toLocaleDateString("en-NO", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        //remove commas from formatted date
        const formattedDateNoComma = formattedDate.replace(/,/g, "");

        const label: string = data.label;
        const tracks: string[] = data.tracks.items.map(
          (track: any) => track.name
        );
        const length_ms: number = data.tracks.items
          .map((track: any) => track.duration_ms)
          .reduce((a: number, b: number) => a + b, 0);
        const length_min: number = Math.floor(length_ms / 60000);
        const length_sec: number = Math.floor((length_ms % 60000) / 1000);
        const totalLength = `${length_min}:${length_sec}`;

        const genres = data.genres.join(" | ");

        setData({
          colors: colors ?? [],
          albumName,
          artistName,
          relaseDate: formattedDateNoComma,
          label,
          tracks,
          length: totalLength,
          imgUrl: data.images[0].url,
          genres,
        });
      },
    [session?.accessToken]
  );

  useEffect(() => {
    setIsClient(true);

    if (session) {
      handleCreate(params.id);
    }
  }, [handleCreate, params.id, session]);

  if (status === "unauthenticated") {
    redirect("/");
  }

  return (
    <>
      {isClient && !!data ? (
        <div className="w-screen h-screen">
          <Link
            href={{
              pathname: "/create",
              query: { search: query.get("search") },
            }}
            className="flex items-center justify-start p-2"
          >
            <span className="text-white">Back to create</span>
          </Link>
          <div className="pb-20 pt-12 rounded-md flex h-full w-full">
            <PDFViewer height="100%" width="100%">
              <PDF
                imageSrc={data?.imgUrl ?? ""}
                category={data?.genres ?? ""}
                songs={data?.tracks ?? []}
                colors={data?.colors ?? []}
                albumName={data?.albumName ?? ""}
                artistName={data?.artistName ?? ""}
                release_date={data?.relaseDate ?? ""}
                label={data?.label ?? ""}
                length={data?.length ?? ""}
              />
            </PDFViewer>
          </div>
        </div>
      ) : null}
      <canvas ref={canvasRef} className="hidden"></canvas>
    </>
  );
}
