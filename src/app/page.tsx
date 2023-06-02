import { getServerSession } from "next-auth";
import { Login, LogoutButton } from "./buttons";
import Link from "next/link";
export default async function Home() {
  const session = await getServerSession();

  return (
    <main className="flex min-h-screen items-center flex-col justify-center p-24 bg-slate-900">
      <h1 className="text-4xl p-4 text-white font-bold underline">
        Create a poster from your favorite albums
      </h1>
      {!session ? <Login /> : null}
      {session ? (
        <Link href="/create" className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-800 rounded-lg blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative px-7 py-6 bg-white ring-1 ring-gray-900/5 rounded-lg leading-none flex items-top justify-start space-x-6">
            <span className="text-2xl font-bold ">Create now</span>
          </div>
        </Link>
      ) : null}
    </main>
  );
}
