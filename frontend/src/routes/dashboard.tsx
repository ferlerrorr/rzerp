import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "../components/layouts/AppLayout";
import { AuthGuard } from "../components/rbac/AuthGuard";
import { Heading } from "../components/semantic/index";

function DashboardPage() {
  return (
    <div>
      <Heading level={1} className="mb-4">
        Dashboard
      </Heading>
      <p className="text-muted-foreground mb-6">Welcome to your dashboard!</p>
    </div>
  );
}

export const Route = createFileRoute("/dashboard")({
  component: () => (
    <AuthGuard>
      <AppLayout>
        <DashboardPage />
      </AppLayout>
    </AuthGuard>
  ),
});
