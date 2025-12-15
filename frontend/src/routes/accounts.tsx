import { requireAuth } from "@/lib/auth-guard";
import { AccountsPage } from "@/pages/accounts/accounts";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/accounts")({
  beforeLoad: async () => {
    await requireAuth();
  },
  component: AccountsPage,
});
