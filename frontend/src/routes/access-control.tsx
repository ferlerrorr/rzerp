import { createFileRoute } from "@tanstack/react-router";
import { AccessControlPage } from "@/pages/access-control";
import { requireAuth } from "@/lib/auth-guard";

export const Route = createFileRoute("/access-control")({
  beforeLoad: async () => {
    await requireAuth();
  },
  component: AccessControlPage,
});

