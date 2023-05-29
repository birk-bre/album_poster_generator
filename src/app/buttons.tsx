"use client";

import { signIn, signOut } from "next-auth/react";

export const Login = () => {
  return (
    <button
      className="py-4 px-8 bg-green-500 text-white rounded-lg"
      onClick={() =>
        signIn("spotify", { callbackUrl: "http://localhost:3000/create" })
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
