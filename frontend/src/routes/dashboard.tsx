import { createFileRoute } from "@tanstack/react-router";
import { DashboardPage } from "@/pages/dashboard";
import { requireAuth } from "@/lib/auth-guard";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: async () => {
    await requireAuth();
  },
  component: DashboardPage,
});
