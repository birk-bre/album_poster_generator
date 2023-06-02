"use client";

import { signIn, signOut } from "next-auth/react";

export const Login = () => {
  const callback =
    process.env.NODE_ENV === "production"
      ? process.env.NEXTAUTH_URL
      : "http://localhost:3000/create";

  return (
    <button
      className="relative group hover:scale-105 transition-transform"
      onClick={() =>
        signIn("spotify", {
          callbackUrl: callback,
        })
      }
    >
      <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-green-800 rounded-lg blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
      <div className="relative px-7 py-6 bg-green-500 ring-1 ring-gray-900/5 rounded-lg leading-none flex items-top justify-start space-x-6">
        <span className="text-2xl font-bold text-white">

        Sign in with Spotify
        </span>
      </div>
    </button>
  );
};

export const LogoutButton = () => {
  return (
    <button style={{ marginRight: 10 }} onClick={() => signOut()}>
      Sign Out
    </button>
  );
};
