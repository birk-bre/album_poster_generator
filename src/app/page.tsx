import { getServerSession } from "next-auth";
import { Login, LogoutButton } from "./buttons";

export default async function Home() {
  const session = await getServerSession();

  return (
    <main className="flex min-h-screen items-center flex-col justify-center p-24">
      {session ? <LogoutButton /> : <Login />}
    </main>
  );
}
