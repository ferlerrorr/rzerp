import { createFileRoute } from "@tanstack/react-router";
import { InventoryPage } from "@/pages/inventory/inventory";
import { requireAuth } from "@/lib/auth-guard";

export const Route = createFileRoute("/inventory")({
  beforeLoad: async () => {
    await requireAuth();
  },
  component: InventoryPage,
});
