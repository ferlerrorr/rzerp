import { createFileRoute } from "@tanstack/react-router";
import { HrisPageWithPermission } from "@/pages/hris-with-permission";
import { requireAuth } from "@/lib/auth-guard";

export const Route = createFileRoute("/hris")({
  beforeLoad: async () => {
    await requireAuth();
  },
  component: HrisPageWithPermission,
});
