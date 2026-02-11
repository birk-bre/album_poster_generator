import "./globals.css";
import { NextAuthProvider } from "./providers";
import { auth } from "@/auth";
import { LogoutButton } from "./buttons";

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
    <html lang="en">
      <body>
        <NextAuthProvider>
          {session && (
            <nav className="fixed top-0 right-0 z-50 p-4">
              <LogoutButton />
            </nav>
          )}
          {children}
        </NextAuthProvider>
      </body>
    </html>
  );
}
