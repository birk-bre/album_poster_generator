import "./globals.css";
import { Inter } from "next/font/google";
import { NextAuthProvider } from "./providers";
import { getServerSession } from "next-auth";
import { LogoutButton } from "./buttons";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Album Genereator",
  description: "Create a poster from your favorite albums",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-900`}>
        <NextAuthProvider>{children}</NextAuthProvider>
        {session ? (
          <div className="absolute top-4 right-4 text-white">
            <LogoutButton />
          </div>
        ) : null}
      </body>
    </html>
  );
}
