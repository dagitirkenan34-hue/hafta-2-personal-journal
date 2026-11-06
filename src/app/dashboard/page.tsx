import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import JournalManager from "@/components/JournalManager";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <JournalManager
      name={session.user.name || session.user.email || "Kullanıcı"}
    />
  );
}
