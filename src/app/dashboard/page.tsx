import { MainPage } from "@/components/main/main";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

/**
 *
 * @returns A React component representing the dashboard page
 * This page checks for user authentication and redirects to the login page if not authenticated
 * If authenticated, it renders the Dashboard component
 * The function is asynchronous to accommodate the session retrieval process
 */
export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const servers = await prisma.server.findMany();

  return <MainPage servers={servers} />;
}
