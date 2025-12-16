import { Badge } from "@/components/ui/badge";

import { Button } from "@/components/ui/button";

import { Card, CardContent, CardTitle } from "@/components/ui/card";

import { Checkbox } from "@/components/ui/checkbox";

import { Input } from "@/components/ui/input";

import { useAuthStore } from "@/stores/auth";

import { createFileRoute, useNavigate } from "@tanstack/react-router";

import type { ChangeEvent, FormEventHandler } from "react";

import { useCallback, useEffect, useMemo, useState } from "react";

type CheckedState = boolean | "indeterminate";

/** LocalStorage helpers (safe in try/catch) - memoized for performance */

const ls = {
  get(key: string): string | null {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key: string, value: string) {
    try {
      window.localStorage.setItem(key, value);
    } catch {}
  },
  remove(key: string) {
    try {
      window.localStorage.removeItem(key);
    } catch {}
  },
};

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [remember, setRemember] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);

  // Memoized form/input attributes based on "remember" to prevent unnecessary re-renders
  const formAttributes = useMemo(
    () => ({
      formAutoComplete: remember ? "on" : "off",
      userAutoComplete: remember ? "username" : "off",
      passAutoComplete: remember ? "current-password" : "new-password",
      userNameAttr: remember ? "username" : "not-username",
      passNameAttr: remember ? "password" : "not-password",
    }),
    [remember]
  );

  // On mount: restore "Remember me" toggle and username (if opted-in)
  useEffect(() => {
    const savedCheck = ls.get("rememberedCheck");
    const isChecked = savedCheck === "true";
    setRemember(isChecked);

    if (isChecked) {
      setUsername(ls.get("rememberedUsername") ?? "");
    } else {
      setUsername("");
    }

    // Never prefill password
    setPassword("");

    // Clear any error messages on mount (e.g., from token validation failures)
    clearError();
  }, [clearError]);

  // Memoized event handlers to prevent unnecessary re-renders
  const handleUsernameChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setUsername(e.currentTarget.value);
    },
    []
  );

  const handlePasswordChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setPassword(e.currentTarget.value);
    },
    []
  );

  const handleRememberChange = useCallback((v: CheckedState) => {
    const checked = v === true;
    setRemember(checked);
    ls.set("rememberedCheck", checked ? "true" : "false");

    if (!checked) {
      // If user turns it off, clear stored username immediately
      ls.remove("rememberedUsername");
      setUsername("");
    }
  }, []);

  const handleSubmit: FormEventHandler<HTMLFormElement> = useCallback(
    async (e) => {
      e.preventDefault();
      if (isLoading) return;

      clearError();
      setMessage(null);

      try {
        await login(username, password, remember);

        // Persist remember state + username only if opted-in
        if (remember) {
          ls.set("rememberedUsername", username);
          ls.set("rememberedCheck", "true");
        } else {
          ls.remove("rememberedUsername");
          ls.set("rememberedCheck", "false");
        }

        setMessage("Login successful");

        // Tiny delay so store settles before navigation
        setTimeout(() => {
          navigate({ to: "/dashboard" });
        }, 100);
      } catch (err) {
        // Error is handled by the store
      }
    },
    [username, password, remember, isLoading, navigate, login, clearError]
  );

  return (
    <div
      className="min-h-screen flex items-center justify-center p-2 sm:p-4 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: "url('/bg-rz.png')",
      }}
    >
      <Card className="w-full flex flex-col lg:flex-row justify-between items-stretch max-w-7xl mx-auto !bg-[#20262c]/95 !border-[#363c41] backdrop-blur-sm p-3 sm:p-4 md:p-6 lg:p-10 py-4 sm:py-6 md:py-8 lg:py-10 rounded-lg sm:rounded-xl gap-4 sm:gap-6 md:gap-8 lg:gap-14 max-h-[100dvh] overflow-y-auto lg:max-h-none lg:overflow-visible overscroll-contain">
        {/* Left Side - Branding */}
        <div className="flex flex-col justify-between w-full lg:max-w-lg gap-4 sm:gap-6 mb-4 sm:mb-6 lg:mb-0 px-1 sm:px-2 lg:px-0 order-2 lg:order-1">
          <div className="text-center lg:text-left">
            <Badge
              variant="outline"
              className="!rounded-4xl !px-3 sm:!px-4 !py-1.5 sm:!py-2 !border-[#454d56] !text-[#b0b3b7] text-xs sm:text-sm"
            >
              All in one platform.
            </Badge>
            <h1 className="text-base text-[#FFFFFF] sm:text-lg font-bold mt-2">
              Track. Convert. Grow.
            </h1>
          </div>
          <div className="hidden sm:block">
            <div className="flex flex-col gap-2 sm:gap-3">
              <div className="flex justify-center lg:justify-start">
                <svg
                  width="60"
                  height="28"
                  viewBox="0 0 75 36"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="sm:w-[75px] sm:h-[36px]"
                >
                  <path
                    d="M32.2389 35.8926H55.7133C49.7107 34.7816 50.4253 30.1598 51.533 27.9877L74.3643 4.57764e-05H35.4546L42.3147 7.90495L47.031 2.24333C47.8885 1.28192 50.4611 -0.854539 53.7839 0.961447C56.766 2.59116 56.1421 6.19578 55.0702 7.90495L32.2389 35.8926Z"
                    fill="white"
                  />
                  <path
                    d="M25.5041 36H38.0418L25.5041 19.7244L33.7554 9.05367C36.0058 5.71232 32.148 0.107483 29.7905 0.107483H18.4315C24.261 1.14222 23.8967 5.92789 22.2893 7.86803L0 36H18.0029L14.2523 33.9521L18.8602 27.7005L25.5041 36Z"
                    fill="white"
                  />
                </svg>
              </div>
              <h1 className="text-sm text-[#FFFFFF] sm:text-lg font-semibold text-center lg:text-left">
                Enterprise
                <span className="block">
                  <h1>Resource Planning</h1>
                </span>
              </h1>
              <p className="text-[#71777D] text-xs sm:text-sm text-center lg:text-left">
                Empower your team with smart lead management, sales tracking,
                and fulfillment automation.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <CardContent className="w-full lg:max-w-lg bg-white p-4 sm:p-6 md:p-8 lg:p-10 rounded-md order-1 lg:order-2">
          <div className="flex flex-col gap-1 pt-2 sm:pt-3 md:pt-5 pb-2 sm:pb-3 mb-6 sm:mb-8 md:mb-10">
            <CardTitle className="text-base sm:text-lg text-[#29333D] font-bold">
              Let's get you back to business.
            </CardTitle>
            <p className="text-xs sm:text-sm text-[#71777D]">
              Empower your team with smart lead management, sales tracking, and
              fulfillment automation.
            </p>
          </div>

          <form
            id="login-form"
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 sm:gap-6 md:gap-4"
            autoComplete={formAttributes.formAutoComplete}
          >
            {/* Hidden traps to absorb aggressive autofill when not remembering */}
            {!remember && (
              <div aria-hidden className="hidden">
                <input type="text" autoComplete="username" />
                <input type="password" autoComplete="current-password" />
              </div>
            )}
            <div className="grid gap-1 sm:gap-1">
              <label
                htmlFor="Email"
                className="text-[#454D56] font-semibold text-sm sm:text-base"
              >
                Email
              </label>
              <Input
                id="email"
                name={formAttributes.userNameAttr}
                type="text"
                placeholder="enter your email"
                className="h-[32px] sm:h-[35px] w-full !rounded-lg sm:!rounded-xl !border-[#f4f4f5] text-sm sm:text-base"
                required
                value={username}
                onChange={handleUsernameChange}
                autoComplete={formAttributes.userAutoComplete}
                disabled={isLoading}
              />
            </div>

            <div className="grid gap-1.5 sm:gap-2">
              <label
                htmlFor="password"
                className="text-[#454D56] font-semibold text-sm sm:text-base"
              >
                Password
              </label>
              <Input
                id="password"
                name={formAttributes.passNameAttr}
                type="password"
                placeholder="enter your password"
                className="h-[32px] sm:h-[35px] w-full !rounded-lg sm:!rounded-xl !border-[#f4f4f5] text-sm sm:text-base"
                required
                value={password}
                onChange={handlePasswordChange}
                autoComplete={formAttributes.passAutoComplete}
                disabled={isLoading}
              />

              <div className="flex items-center gap-2 pt-1">
                <Checkbox
                  className="!border-[#b0b3b7]"
                  id="remember"
                  checked={remember}
                  onCheckedChange={handleRememberChange}
                  disabled={isLoading}
                />
                <label
                  htmlFor="remember"
                  className="text-[#71777D] text-xs sm:text-sm"
                >
                  Remember me
                </label>

                <a
                  href="#"
                  className="ml-auto inline-block text-xs sm:text-sm underline-offset-4 hover:underline text-[#71777D]"
                >
                  Forgot your password?
                </a>
              </div>
            </div>

            {error && (
              <div className="text-xs sm:text-sm text-red-600">{error}</div>
            )}
            {message && (
              <div className="text-xs sm:text-sm text-green-700">{message}</div>
            )}

            <div className="flex flex-col gap-2 pt-6 sm:pt-8 md:pt-10 pb-2 sm:pb-4 px-0">
              <Button
                type="submit"
                className="w-full h-[32px] sm:h-[35px] !rounded-lg sm:!rounded-xl !border-[#f4f4f5] !bg-[#29333d] hover:!bg-[#29333d]/80 !text-white text-sm sm:text-base"
                disabled={isLoading}
              >
                {isLoading ? "Logging in…" : "Login to dashboard"}
              </Button>
              <p className="text-xs sm:text-sm text-[#71777D] text-center">
                Don't have an account?{" "}
                <a href="#" className="text-primary hover:underline">
                  Sign up
                </a>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export const Route = createFileRoute("/auth/login")({
  component: LoginPage,
});
