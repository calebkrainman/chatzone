"use client";

import { Dashboard } from "@/components/dashboard/dashboard";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Server } from "../../../generated/prisma";

export function MainPage({ servers }: { servers: Server[] }) {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <Dashboard servers={servers} />
    </QueryClientProvider>
  );
}
