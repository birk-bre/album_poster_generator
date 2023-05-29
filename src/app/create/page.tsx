"use client";
import { useEffect, useRef, useState } from "react";

import skmeans from "skmeans";
import convert from "color-convert";
import { PDFViewer } from "@react-pdf/renderer";
import PDF from "./pdf";
import { getSession, useSession } from "next-auth/react";

type Album = {
  name: string;
  image: string;
  artist: string;
  id: string;
};

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

export default function Create() {
  const session = useSession();
  console.log("ses", session);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [albums, setAlbums] = useState<Album[]>([]);
  const [artist, setArtist] = useState("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  async function processImage(file?: File) {
    if (!file) return;
    return new Promise<{ r: number; g: number; b: number }[]>((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);

      img.onload = function () {
        const canvas = canvasRef.current;
        if (!canvas) return; // add null check
        const ctx = canvas.getContext("2d");
        if (!ctx) return; // add null check
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, img.width, img.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        let pixels = [];
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const lab = convert.rgb.lab([r, g, b]);
          pixels.push(lab);
        }

        const result = skmeans(pixels, 5);

        let dominantColors = result.centroids;
        const colors = dominantColors.map((color) => {
          const [r, g, b] = convert.lab.rgb(color);
          return { r, g, b };
        });

        resolve(colors);
      };
    });
  }

  async function handleSearch() {
    const URL = `https://api.spotify.com/v1/search?q=${artist}&type=album`;
    const res = await fetch(URL, {
      headers: {
        //@ts-ignore
        Authorization: `Bearer ${session.data?.user.accessToken}`,
      },
    });
    const data = await res.json();
    const albums = data.albums.items.map((album: any) => ({
      image: album.images[0].url,
      name: album.name,
      id: album.id,
    }));

    setAlbums(albums);
  }

  const [data, setData] = useState<Data>();
  async function handleCreate(id: string) {
    const token = localStorage.getItem("token");

    const URL = `https://api.spotify.com/v1/albums/${id}`;
    const res = await fetch(URL, {
      headers: {
        //@ts-ignore
        Authorization: `Bearer ${session.data?.user.accessToken}`,
      },
    });
    const data = await res.json();

    const response = await fetch(data.images[0].url);
    const blob = await response.blob();
    const file = new File([blob], "album.png", { type: "image/png" });

    const colors = await processImage(file);
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
    const tracks: string[] = data.tracks.items.map((track: any) => track.name);
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
  }

  return (
    <div className="flex flex-col items-center justify-center text-black">
      <input
        type="text"
        value={artist}
        onChange={(e) => setArtist(e.target.value)}
        placeholder="Artist"
      />

      <button className="text-white p-2" onClick={handleSearch}>
        Search
      </button>

      <div className="grid grid-cols-3 gap-4">
        {albums.map((album) => (
          <div
            key={album.id}
            onClick={() => handleCreate(album.id)}
            className="flex flex-col gap-2 items-center justify-center cursor-pointer hover:opacity-80"
          >
            <img src={album.image} alt="" className="w-32 h-32" />
            <h1 className="text-white">{album.name}</h1>
          </div>
        ))}
      </div>
      <canvas ref={canvasRef} className="hidden"></canvas>

      {isClient ? (
        <PDFViewer className="w-screen h-screen" showToolbar>
          {/* reload this each render */}

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
      ) : null}
    </div>
  );
}
