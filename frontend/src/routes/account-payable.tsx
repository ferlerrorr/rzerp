import { createFileRoute } from "@tanstack/react-router";
import { AccountPayablePage } from "@/pages/account-payable";
import { requireAuth } from "@/lib/auth-guard";

export const Route = createFileRoute("/account-payable")({
  beforeLoad: async () => {
    await requireAuth();
  },
  component: AccountPayablePage,
});

