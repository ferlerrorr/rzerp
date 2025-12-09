import { createFileRoute } from "@tanstack/react-router";
import { FinancePage } from "@/pages/finance";
import { requireAuth } from "@/lib/auth-guard";

export const Route = createFileRoute("/finance")({
  beforeLoad: async () => {
    await requireAuth();
  },
  component: FinancePage,
});
