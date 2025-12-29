import { createFileRoute } from "@tanstack/react-router";
import { HrisPage } from "@/pages/hris/hris";
import { requirePermission } from "@/lib/auth-guard";

export const Route = createFileRoute("/hris")({
  beforeLoad: async () => {
    await requirePermission("hris.view");
  },
  component: HrisPage,
});
