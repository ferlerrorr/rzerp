import { createFileRoute } from "@tanstack/react-router";
import { AuthGuard } from "../components/rbac/AuthGuard";
import { AppLayout } from "../components/layouts/AppLayout";
import { Heading, Paragraph } from "../components/semantic/index";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";

function SettingsPage() {
  return (
    <div>
      <Heading level={1} className="mb-2">Settings</Heading>
      <Paragraph className="text-muted-foreground mb-6">Application settings and configuration</Paragraph>

      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>Configure general application settings</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Settings page coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}

export const Route = createFileRoute("/settings")({
  component: () => (
    <AuthGuard>
      <AppLayout>
        <SettingsPage />
      </AppLayout>
    </AuthGuard>
  ),
});

