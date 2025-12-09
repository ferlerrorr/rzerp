import { createFileRoute } from "@tanstack/react-router";
import { UsersPageWithPermission } from "@/pages/users-with-permission";
import { requireAuth } from "@/lib/auth-guard";

export const Route = createFileRoute("/users")({
  beforeLoad: async () => {
    await requireAuth();
  },
  component: UsersPageWithPermission,
});
