import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuthStore } from "../stores/auth";
import {
  MainContent,
  Section,
  PageLayout,
  Heading,
  Form,
  FormGroup,
  FormActions,
} from "../components/semantic/index";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

function LoginPage() {
  const navigate = useNavigate();
  const { login, loading } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await login(email, password);
      navigate({ to: "/dashboard" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  };

  return (
    <MainContent className="min-h-screen flex items-center justify-center">
      <Section>
        <PageLayout>
          <Heading level={1}>Login</Heading>
          <Form onSubmit={handleSubmit}>
            {error && <div className="error-message">{error}</div>}
            <FormGroup>
              <label
                htmlFor="login-email"
                className="block text-sm font-medium mb-2"
              >
                Email
              </label>
              <Input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </FormGroup>
            <FormGroup>
              <label
                htmlFor="login-password"
                className="block text-sm font-medium mb-2"
              >
                Password
              </label>
              <Input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </FormGroup>
            <FormActions>
              <Button type="submit" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </Button>
            </FormActions>
          </Form>
        </PageLayout>
      </Section>
    </MainContent>
  );
}

export const Route = createFileRoute("/auth/login")({
  component: LoginPage,
});
