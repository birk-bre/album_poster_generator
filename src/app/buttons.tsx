"use client";

import { signIn, signOut } from "next-auth/react";

export const Login = () => {
  console.log(
    "NODE  ENV",
    process.env.NODE_ENV === "production"
      ? process.env.NEXTAUTH_URL
      : "http://localhost:3000/create"
  );

  const callback =
    process.env.NODE_ENV === "production"
      ? process.env.NEXTAUTH_URL
      : "http://localhost:3000/create";

  return (
    <button
      className="py-4 px-8 bg-green-500 text-white rounded-lg"
      onClick={() =>
        signIn("spotify", {
          callbackUrl: callback,
        })
      }
    >
      Sign in with spotify
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
