import { createFileRoute } from "@tanstack/react-router";
import { VendorsPage } from "@/pages/vendors";
import { requireAuth } from "@/lib/auth-guard";

export const Route = createFileRoute("/vendors")({
  beforeLoad: async () => {
    await requireAuth();
  },
  component: VendorsPage,
});

