# Frontend Context & Rules (Generic SPA)

> This document describes the **generic frontend architecture and rules** for a modern SPA (React + TypeScript) that consumes the backend API described in `api.md`. The focus is **session-based auth**, **CSRF**, **CORS**, **simple RBAC**, **JSON-only APIs**, and **strict typing**.fileciteturn2file1

---

## 1. Project Overview (Generic)

A modern single-page application built with:

- React + TypeScript  
- Vite as build tool and dev server  
- TanStack Router for routing  
- Zustand for state management  
- Axios for HTTP requests  

The app consumes a **JSON-only backend API** that follows these rules (from `api.md`):

- All endpoints return JSON (no HTML, no views)  
- Standard response format:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

- Errors follow:

```json
{
  "success": false,
  "message": "Error description",
  "errors": {
    "field": ["Error message"]
  }
}
```

- Status codes: 200/201/400/401/403/404/422/500

The frontend is **fully generic**: it assumes a set of **domain modules** (e.g. users, billing, inventory, reporting, etc.) but does not depend on any ERP-specific terminology.

---

## 2. Project Structure (Generic)

```txt
frontend/
├── src/
│   ├── routes/          # TanStack Router pages (auth, dashboard, feature modules, etc.)
│   ├── pages/           # Page components
│   ├── components/      # Reusable UI components
│   │   ├── semantic/    # Semantic layout components (PageLayout, Section, etc.)
│   │   ├── ui/          # UI primitives (inputs, buttons, dialogs, etc.)
│   │   ├── navbar/      # Navigation components
│   │   ├── sidebar/     # Sidebar components
│   │   ├── rbac/        # RBAC UI (role management, permission editor, user-role assignment)
│   │   ├── cards/       # Card components
│   │   ├── charts/      # Chart components
│   │   ├── modals/      # Modal components
│   │   ├── tables/      # Table components
│   │   └── container/   # Layout/container components
│   ├── lib/             # API client, helpers, guards
│   ├── stores/          # Zustand stores (auth, rbac, ui, domain stores)
│   └── hooks/           # Custom React hooks
├── package.json
└── vite.config.ts       # Vite config with API proxy & cookie handling
```

---

## 3. Technology Stack

| Technology       | Purpose                       |
| ---------------- | ----------------------------- |
| React            | UI framework                  |
| Vite             | Dev server & build tool       |
| TypeScript       | Type safety                   |
| TanStack Router  | Routing                       |
| Tailwind CSS     | Styling (utility-first)       |
| UI Library       | Component primitives          |
| Zustand          | State management              |
| Axios            | HTTP client                   |
| Zod              | Runtime validation (optional) |

---

## 4. Frontend–Backend Contract (In Sync With `api.md`)

### 4.1 JSON Contract

The frontend **MUST** assume and enforce the same JSON structure as the backend:

```ts
// Generic API response type
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}
```

Rules:

- Never assume `data` exists when `success === false`.
- Validation errors must be read from `errors` field (422).
- User-facing messages come from `message` when available.

### 4.2 Status Code Handling

- `200 / 201` → Normal success handling  
- `400` → Show generic "Bad request" message + details if present  
- `401` → Treat as not authenticated; run **session refresh** or redirect to login  
- `403` → Permission denied; show “You do not have access to this action.”  
- `404` → Handle as “Not found” page / resource-level error  
- `422` → Show field-level validation errors from `errors`  
- `500` → Show generic server error; never expose stack traces  

---

## 5. Authentication & Session Rules (Frontend)

The frontend uses **session-based authentication with cookies**, aligned with backend CSRF + CORS rules.

### 5.1 High-Level Flow

1. Frontend loads auth pages (e.g., login/register).
2. Frontend **fetches CSRF cookie** from the backend.
3. User submits credentials to login endpoint.
4. Backend validates login + CSRF → issues **session cookie**.
5. Browser automatically sends the session cookie with further requests.
6. Protected routes use an **auth guard** to check if the user is logged in.
7. On 401 or 419, frontend triggers **recovery flows** (refresh session, refetch CSRF, retry).

### 5.2 Required Endpoints (Example)

The exact paths can vary, but the frontend assumes something like:

- `GET /csrf-cookie` or `/sanctum/csrf-cookie` – fetch CSRF token cookie  
- `POST /api/auth/login` – login  
- `POST /api/auth/logout` – logout  
- `GET /api/user` or `GET /api/auth/me` – get current user  
- `POST /api/auth/refresh` – refresh session (optional but recommended)  

Names are **configurable**, but the flow **MUST** match this pattern.

---

## 6. CSRF & CORS Rules (Frontend Side)

### 6.1 CSRF Handling

Frontend must:

1. **Fetch CSRF cookie** before any login or state-changing request that requires it.
2. Read CSRF cookie (e.g. `XSRF-TOKEN`) from `document.cookie`.
3. Send token as `X-XSRF-TOKEN` header on **all** state-changing requests (POST/PUT/PATCH/DELETE).

Example helper:

```ts
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return decodeURIComponent(parts.pop()!.split(";").shift() || "");
  }
  return null;
}
```

In axios request interceptor:

```ts
api.interceptors.request.use((config) => {
  const token = getCookie("XSRF-TOKEN");
  if (token && !config.headers["X-XSRF-TOKEN"]) {
    config.headers["X-XSRF-TOKEN"] = token;
  }
  return config;
});
```

### 6.2 CORS & Cookies

The axios instance **MUST** be created with `withCredentials: true`:

```ts
import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.DEV ? "" : import.meta.env.VITE_API_HOST,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});
```

Development:

- Vite proxy forwards `/api` and `/csrf-cookie` (or `/sanctum/csrf-cookie`) to backend.
- Proxy strips `Domain=` attribute from cookies so they work on `localhost`.

Production:

- API host is controlled by `VITE_API_HOST`.
- Frontend and backend domains must match backend CORS config.

---

## 7. Axios Interceptors & Error Handling

### 7.1 Request Interceptor Rules

- Always attach `X-XSRF-TOKEN` if cookie exists.
- Never hardcode tokens; always read from cookies.
- Keep content type and accept headers consistent.

### 7.2 Response Interceptor Rules

Pseudocode:

```ts
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // CSRF token mismatch (example: 419)
    if (error.response?.status === 419 && !originalRequest._retry) {
      originalRequest._retry = true;
      await fetchCsrfCookie();
      return api(originalRequest);
    }

    // Unauthorized (401) – try refresh once
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthEndpoint(originalRequest.url)
    ) {
      originalRequest._retry = true;
      try {
        await api.post("/api/auth/refresh");
        return api(originalRequest);
      } catch {
        useAuthStore.getState().logout();
      }
    }

    return Promise.reject(error);
  }
);
```

Rules:

- Do **not** retry login/register on 401 (avoid infinite loops).
- Only retry once per request (`_retry` flag).
- On failed refresh, clear auth state and redirect to login.

---

## 8. Auth Store & Route Guards

### 8.1 Auth Store (Zustand)

Minimum fields:

```ts
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  setUser: (user: User | null) => void;
  fetchUser: () => Promise<void>;
  logout: () => Promise<void>;
}
```

Rules:

- `isAuthenticated` = `true` only when `user` is non-null and session validated.
- `fetchUser` calls `/api/user` (or equivalent) and updates store.
- `logout` calls backend logout and clears store.

### 8.2 Route Guard

Protected routes must use a guard that:

- Checks `isAuthenticated` from store.
- Triggers `fetchUser()` if state is unknown.
- Redirects to login if unauthenticated.

Example:

```tsx
import { useAuthStore } from "@/stores/auth";
import { Navigate } from "@tanstack/router";

export function AuthGuard({ children }: { children: JSX.Element }) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/auth/login" />;
  }

  return children;
}
```

---

## 9. RBAC Rules (Frontend)

Frontend RBAC must stay in sync with backend RBAC as described in `api.md`:

- Backend roles + permissions are authoritative.
- Permission strings follow `resource.action` convention (e.g., `users.view`, `users.create`).

### 9.1 RBAC Store

```ts
interface RbacState {
  roles: string[];
  permissions: string[];
  setPermissions: (perms: string[]) => void;
  hasPermission: (perm: string) => boolean;
  hasAnyPermission: (perms: string[]) => boolean;
}

export const useRbacStore = create<RbacState>((set, get) => ({
  roles: [],
  permissions: [],
  setPermissions: (perms) => set({ permissions: perms }),
  hasPermission: (perm) => get().permissions.includes(perm),
  hasAnyPermission: (perms) => perms.some((p) => get().permissions.includes(p)),
}));
```

### 9.2 Permission Hooks

```ts
export function usePermission(permission: string): boolean {
  return useRbacStore((state) => state.hasPermission(permission));
}

export function useAnyPermission(permissions: string[]): boolean {
  return useRbacStore((state) => state.hasAnyPermission(permissions));
}
```

### 9.3 Usage Rules

- Never hardcode “admin” checks in components.
- Check **permissions**, not roles, in UI.
- Super admin behavior is handled **backend-side** (e.g., backend returns all permissions).

Examples:

```tsx
const canViewUsers = usePermission("users.view");
const canCreateUser = usePermission("users.create");

return (
  <>
    {canViewUsers && <UsersTable />}
    {canCreateUser && <CreateUserButton />}
  </>
);
```

Route example:

```tsx
<PermissionGuard permission="users.view">
  <UsersPage />
</PermissionGuard>
```

---

## 10. Type Safety Rules (Frontend)

TypeScript rules aligned with `api.md`:

- **No `any` allowed**.
- All API calls must be typed using `ApiResponse<T>`.
- All components must have typed props.

### 10.1 Forbidden

```ts
// Do not do this
const data: any = await api.get("/api/users");
```

### 10.2 Required

```ts
interface User {
  id: number;
  name: string;
  email: string;
}

async function fetchUsers(): Promise<ApiResponse<User[]>> {
  const response = await api.get<ApiResponse<User[]>>("/api/users");
  return response.data;
}
```

---

## 11. Semantic Components & Layout Rules

The UI must use **semantic wrapper components** instead of raw `<div>` soup.

Examples of required semantic components:

- `PageLayout`
- `MainContent`
- `Section`
- `Header`
- `Navigation`
- `Form`, `FormGroup`, `FormActions`
- `Heading`, `Paragraph`

Example:

```tsx
function LoginPage() {
  return (
    <MainContent className="min-h-screen flex items-center justify-center">
      <Section>
        <PageLayout>
          <Heading level={1}>Login</Heading>
          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required />
            </FormGroup>
            <FormActions>
              <Button type="submit">Login</Button>
            </FormActions>
          </Form>
        </PageLayout>
      </Section>
    </MainContent>
  );
}
```

Rules:

- Prefer semantic wrappers instead of bare `<div>`/`<span>` for structure.
- Use proper heading levels (`h1`–`h6`) for page hierarchy.
- Use form semantics (`form`, `label`, etc.) for accessibility.

---

## 12. Vite & Environment Rules

### 12.1 Vite Config (Dev Proxy)

- Dev server must proxy API paths to backend and strip `Domain=` from cookies.
- Example keys:
  - `LARAVEL_TARGET` or generic `API_TARGET`
  - `VITE_API_HOST` for production

### 12.2 Env Vars

Example `.env`:

```env
VITE_API_HOST=http://localhost:8000
APP_TARGET=http://localhost:8000
VITE_APP_NAME=My App
```

Rule: All frontend env vars MUST be prefixed with `VITE_`.

---

## 13. Development Workflow

### 13.1 Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "type-check": "tsc --noEmit",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --max-warnings 0"
  }
}
```

### 13.2 Expectations

- `npm run build` must succeed without errors.
- `npm run type-check` must pass (no type errors).
- `npm run lint` must pass (no unused `any`, etc.).

---

## 14. Frontend–Backend Sync Checklist

To keep frontend and backend in sync:

- [ ] Backend returns JSON in the format defined in `api.md`.
- [ ] Frontend uses `ApiResponse<T>` everywhere.
- [ ] CSRF cookie endpoint is configured and used in frontend.
- [ ] Axios has `withCredentials: true`.
- [ ] CORS on backend allows frontend origin + credentials.
- [ ] RBAC permission names match between backend and frontend.
- [ ] No `any` in TypeScript code.
- [ ] Route guards and permission guards are applied to all protected pages.

This file, together with `api.md`, defines the **full contract** between the backend API and the frontend SPA.