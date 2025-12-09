import { createFileRoute } from "@tanstack/react-router";
import { SettingsPage } from "@/pages/settings";
import { requireAuth } from "@/lib/auth-guard";

export const Route = createFileRoute("/settings")({
  beforeLoad: async () => {
    await requireAuth();
  },
  component: SettingsPage,
});
