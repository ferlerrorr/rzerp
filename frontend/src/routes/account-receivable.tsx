import { createFileRoute } from "@tanstack/react-router";
import { AccountReceivablePage } from "@/pages/account-receivable";
import { requireAuth } from "@/lib/auth-guard";

export const Route = createFileRoute("/account-receivable")({
  beforeLoad: async () => {
    await requireAuth();
  },
  component: AccountReceivablePage,
});

