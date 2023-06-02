"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { Login } from "../buttons";

import Link from "next/link";

type Album = {
  name: string;
  image: string;
  artist: string;
  id: string;
};

export default function Create() {
  const { data: session, status } = useSession();

  const [albums, setAlbums] = useState<Album[]>([]);
  const [artist, setArtist] = useState("");

  async function handleSearch() {
    const URL = `https://api.spotify.com/v1/search?q=${artist}&type=album`;

    const res = await fetch(URL, {
      headers: {
        Authorization: `Bearer ${session?.accessToken}`,
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

  if (status === "unauthenticated") {
    return (
      <div className="h-screen flex items-center justify-center flex-col">
        <span className="text-2xl font-bold text-white p-2">
          Please login to continue
        </span>
        <Login />
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col items-center justify-center text-black p-4 gap-4 ${
        !albums.length ? "h-screen" : ""
      }`}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch();
        }}
      >
        <input
          type="text"
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
          placeholder="Search for an artist..."
          className="p-4 text-black font-bold rounded-md"
        />
      </form>

      <div className="grid lg:grid-cols-5 grid-cols-1 gap-8">
        {albums.map((album) => (
          <Link href={`create/${album.id}`} key={album.id}>
            <div className="flex flex-col gap-2 items-center justify-center cursor-pointer hover:opacity-80">
              <div className="relative group">
                <img
                  src={album.image}
                  alt={album.name}
                  className="w-48 h-48 group-hover:brightness-50"
                />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 group-hover:opacity-100 opacity-0 font-bold text-2xl text-white">
                  {album.name}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
