import "./globals.css";
import { NextAuthProvider } from "./providers";
import { auth } from "@/auth";
import { LogoutButton } from "./buttons";
import { Syne, DM_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata = {
  title: "Album Poster Generator",
  description: "Create stunning printable posters from your favorite albums",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable}`}>
      <body className="grain">
        <NextAuthProvider>
          {session && (
            <nav className="fixed top-0 right-0 z-50 p-5">
              <LogoutButton />
            </nav>
          )}
          {children}
        </NextAuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
