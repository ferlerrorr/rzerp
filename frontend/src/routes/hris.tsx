import { createFileRoute } from "@tanstack/react-router";
import { AuthGuard } from "../components/rbac/AuthGuard";
import { PermissionGuard } from "../components/rbac/PermissionGuard";
import { AppLayout } from "../components/layouts/AppLayout";
import { Heading, Paragraph } from "../components/semantic/index";
import { useState, useEffect } from "react";
import { api } from "../lib/api";
import { ApiResponse } from "../lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";

interface HrisData {
  total_employees: number;
  active_employees: number;
  departments: string[];
}

function HrisPage() {
  const [data, setData] = useState<HrisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.get<ApiResponse<HrisData>>("/api/hris");
        if (response.data.success && response.data.data) {
          setData(response.data.data);
        } else {
          setError(response.data.message || "Failed to load HRIS data");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load HRIS data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <Heading level={1} className="mb-2">HRIS Dashboard</Heading>
      <Paragraph className="text-muted-foreground mb-6">Human Resources Information System</Paragraph>

      {loading && <p>Loading...</p>}
      {error && (
        <div className="bg-destructive/15 text-destructive border border-destructive/50 rounded-md p-4 mb-4">
          {error}
        </div>
      )}
      
      {data && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Total Employees</CardTitle>
              <CardDescription>All employees in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.total_employees}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Active Employees</CardTitle>
              <CardDescription>Currently active employees</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.active_employees}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Departments</CardTitle>
              <CardDescription>Number of departments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.departments.length}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Permission Info</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This page requires the <code className="bg-muted px-1 rounded">hris.view</code> permission.
            Super-admin users can access this page without explicit permissions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export const Route = createFileRoute("/hris")({
  component: () => (
    <AuthGuard>
      <AppLayout>
        <PermissionGuard permission="hris.view" fallback={
          <div>
            <Heading level={1}>Access Denied</Heading>
            <Paragraph>You do not have permission to view HRIS. You need the "hris.view" permission.</Paragraph>
          </div>
        }>
          <HrisPage />
        </PermissionGuard>
      </AppLayout>
    </AuthGuard>
  ),
});

