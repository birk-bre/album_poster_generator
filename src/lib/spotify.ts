import { cache } from "react";

const TOKEN_URL = "https://accounts.spotify.com/api/token";

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

export async function getSpotifyToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID ?? process.env.AUTH_SPOTIFY_ID ?? "";
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET ?? process.env.AUTH_SPOTIFY_SECRET ?? "";
  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    throw new Error(`Failed to get Spotify token: ${res.status}`);
  }

  const data = await res.json();
  cachedToken = data.access_token;
  tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;

  return cachedToken!;
}

export type AlbumResult = {
  name: string;
  image: string;
  artist: string;
  id: string;
  year: string;
};

export const searchAlbums = cache(async (q: string): Promise<AlbumResult[]> => {
  const token = await getSpotifyToken();
  const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=album&limit=20`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) return [];
  const data = await res.json();

  if (!data.albums?.items) return [];
  return data.albums.items
    .filter((album: any) => album.images?.length > 0)
    .map((album: any) => ({
      image: album.images[0].url,
      name: album.name,
      artist: album.artists[0]?.name ?? "",
      id: album.id,
      year: album.release_date?.split("-")[0] ?? "",
    }));
});

export type AlbumDetail = {
  albumName: string;
  artistName: string;
  releaseDate: string;
  label: string;
  tracks: string[];
  length: string;
  imgUrl: string;
  genres: string;
};

export const fetchAlbum = cache(async (id: string): Promise<AlbumDetail> => {
  const token = await getSpotifyToken();
  const res = await fetch(`https://api.spotify.com/v1/albums/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error("Failed to fetch album data");
  const albumData = await res.json();

  const releaseDate = albumData.release_date;
  const formattedDate = new Date(releaseDate)
    .toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    .replace(/,/g, "");

  const tracks: string[] = albumData.tracks.items.map(
    (track: any) => track.name
  );
  const lengthMs: number = albumData.tracks.items
    .map((track: any) => track.duration_ms)
    .reduce((a: number, b: number) => a + b, 0);
  const lengthMin = Math.floor(lengthMs / 60000);
  const lengthSec = Math.floor((lengthMs % 60000) / 1000);

  return {
    albumName: albumData.name,
    artistName: albumData.artists[0].name,
    releaseDate: formattedDate,
    label: albumData.label,
    tracks,
    length: `${lengthMin}:${lengthSec.toString().padStart(2, "0")}`,
    imgUrl: albumData.images[0].url,
    genres: albumData.genres?.join(" | ") ?? "",
  };
});
