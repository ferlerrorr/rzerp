import { createFileRoute } from "@tanstack/react-router";
import { PurchaseOrderPage } from "@/pages/purchase-order";
import { requireAuth } from "@/lib/auth-guard";

export const Route = createFileRoute("/purchase-order")({
  beforeLoad: async () => {
    await requireAuth();
  },
  component: PurchaseOrderPage,
});

