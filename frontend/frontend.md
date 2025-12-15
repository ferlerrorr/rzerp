# Frontend Context & Rules (RZERP SPA)

> This document describes the **frontend architecture and rules** for the RZERP application - a modern SPA (React + TypeScript) that consumes the backend API described in `api.md`. The focus is **session-based auth**, **CSRF**, **CORS**, **simple RBAC**, **JSON-only APIs**, and **strict typing**.

---

## 1. Project Overview

A modern single-page application built with:

- React + TypeScript
- Vite as build tool and dev server
- TanStack Router for file-based routing
- Zustand for state management
- Axios for HTTP requests
- shadcn/ui (Radix UI) for component primitives
- Tailwind CSS for styling
- Recharts for data visualization
- Sonner for toast notifications

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

---

## 2. Project Structure

```txt
frontend/
├── src/
│   ├── routes/              # TanStack Router file-based routes
│   │   ├── __root.tsx       # Root route with conditional sidebar/navbar
│   │   ├── auth.login.tsx   # Login route
│   │   ├── dashboard.tsx    # Dashboard route
│   │   ├── hris.tsx         # HRIS module route
│   │   ├── finance.tsx      # Finance module route
│   │   ├── inventory.tsx    # Inventory module route
│   │   ├── access-control.tsx
│   │   ├── account-payable.tsx
│   │   ├── account-receivable.tsx
│   │   ├── accounts.tsx
│   │   ├── purchase-order.tsx
│   │   ├── vendors.tsx
│   │   ├── users.tsx
│   │   ├── settings.tsx
│   │   └── index.tsx        # Home/redirect route
│   ├── pages/               # Page components organized by domain
│   │   ├── dashboard.tsx
│   │   ├── accessControl/
│   │   │   ├── access-control.tsx
│   │   │   ├── userManagement.tsx
│   │   │   ├── userActivity.tsx
│   │   │   ├── roles.tsx
│   │   │   ├── permissions.tsx
│   │   │   └── auditLogs.tsx
│   │   ├── finance/
│   │   │   ├── finance.tsx
│   │   │   ├── overview.tsx
│   │   │   ├── budget.tsx
│   │   │   ├── journalEntries.tsx
│   │   │   ├── generalLedger.tsx
│   │   │   ├── financialReports.tsx
│   │   │   └── tasBir.tsx
│   │   ├── hris/
│   │   │   ├── hris.tsx
│   │   │   ├── employees.tsx
│   │   │   ├── attendance.tsx
│   │   │   ├── leave.tsx
│   │   │   ├── payroll.tsx
│   │   │   ├── performance.tsx
│   │   │   └── benefits.tsx
│   │   ├── inventory/
│   │   │   ├── inventory.tsx
│   │   │   ├── product.tsx
│   │   │   ├── warehouse.tsx
│   │   │   ├── stockMovements.tsx
│   │   │   ├── stockAdjustments.tsx
│   │   │   ├── lowStockAlerts.tsx
│   │   │   └── reports.tsx
│   │   ├── accounts/
│   │   │   ├── accounts.tsx
│   │   │   ├── accountPayableTab.tsx
│   │   │   └── accountReceivableTab.tsx
│   │   ├── vendors-page/
│   │   │   ├── vendors.tsx
│   │   │   ├── vendorsTab.tsx
│   │   │   └── purchaseOrderTab.tsx
│   │   ├── account-payable.tsx
│   │   ├── account-receivable.tsx
│   │   ├── purchase-order.tsx
│   │   ├── users.tsx
│   │   └── settings.tsx
│   ├── components/          # Reusable UI components
│   │   ├── semantic/        # Semantic layout components
│   │   │   ├── PageLayout.tsx
│   │   │   ├── MainContent.tsx
│   │   │   ├── Section.tsx
│   │   │   ├── Heading.tsx
│   │   │   ├── Paragraph.tsx
│   │   │   ├── Form.tsx
│   │   │   ├── FormGroup.tsx
│   │   │   ├── FormActions.tsx
│   │   │   └── index.ts
│   │   ├── ui/              # shadcn/ui primitives (Radix UI based)
│   │   │   ├── avatar.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── breadcrumb.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── chart.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── collapsible.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── pagination.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── select.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── sonner.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── textarea.tsx
│   │   │   └── tooltip.tsx
│   │   ├── navbar/          # Navigation components
│   │   │   ├── site-header.tsx
│   │   │   ├── mail-dropdown.tsx
│   │   │   ├── notification-dropdown.tsx
│   │   │   └── index.ts
│   │   ├── breadcrumb/      # Breadcrumb components
│   │   │   └── dynamic-breadcrumb.tsx
│   │   ├── rbac/            # RBAC UI components
│   │   │   ├── AuthGuard.tsx
│   │   │   └── PermissionGuard.tsx
│   │   ├── card/            # Card components
│   │   │   ├── overViewCard.tsx
│   │   │   ├── balanceSheet.tsx
│   │   │   ├── incomeStatement.tsx
│   │   │   ├── benefitCard.tsx
│   │   │   ├── birFormCard.tsx
│   │   │   ├── performanceReviewCard.tsx
│   │   │   ├── permissionCard.tsx
│   │   │   ├── progressCard.tsx
│   │   │   ├── purchaseOrderCard.tsx
│   │   │   ├── reportCard.tsx
│   │   │   ├── roleCard.tsx
│   │   │   ├── simpleCard.tsx
│   │   │   ├── userActivityCard.tsx
│   │   │   ├── vendorCard.tsx
│   │   │   └── warehouseCard.tsx
│   │   ├── charts/          # Chart components
│   │   │   ├── areaChart.tsx
│   │   │   └── barChartMixed.tsx
│   │   ├── activities/     # Activity components
│   │   │   └── activitiesCard.tsx
│   │   ├── layouts/         # Layout components
│   │   │   └── AppLayout.tsx
│   │   ├── table/           # Table components
│   │   │   └── appTable.tsx
│   │   ├── app-sidebar.tsx  # Main sidebar component
│   │   ├── nav-main.tsx     # Main navigation component
│   │   ├── nav-projects.tsx # Projects navigation
│   │   ├── nav-user.tsx     # User navigation
│   │   ├── team-switcher.tsx
│   │   ├── app-Buttons.tsx
│   │   ├── app-Pagination.tsx
│   │   ├── app-Serach.tsx
│   │   ├── app-Tabs.tsx
│   │   ├── add-account-dialog.tsx
│   │   ├── add-invoice-dialog.tsx
│   │   ├── add-product-dialog.tsx
│   │   ├── add-role-dialog.tsx
│   │   ├── add-user-dialog.tsx
│   │   ├── add-vendor-dialog.tsx
│   │   ├── add-warehouse-dialog.tsx
│   │   ├── create-budget-dialog.tsx
│   │   ├── create-invoice-dialog.tsx
│   │   ├── create-po-dialog.tsx
│   │   ├── employee-onboarding-dialog.tsx
│   │   ├── filter-dialog.tsx
│   │   ├── journal-entry-dialog.tsx
│   │   ├── leave-request-dialog.tsx
│   │   ├── payroll-processing-dialog.tsx
│   │   └── record-payment-dialog.tsx
│   ├── lib/                 # API client, helpers, types
│   │   ├── api.ts           # Axios instance with interceptors
│   │   ├── types.ts         # TypeScript types (ApiResponse, User, etc.)
│   │   ├── utils.ts         # Utility functions (cn, getCookie, isAuthEndpoint)
│   │   └── auth-guard.ts    # Legacy auth guard (deprecated, use components/rbac/AuthGuard)
│   ├── stores/              # Zustand stores
│   │   ├── auth.ts          # Authentication store
│   │   ├── rbac.ts          # RBAC store (roles, permissions)
│   │   ├── account.ts       # Account management store
│   │   ├── budget.ts        # Budget store
│   │   ├── employee.ts      # Employee store
│   │   ├── filter.ts        # Filter state store
│   │   ├── invoice.ts       # Invoice store
│   │   ├── journalEntry.ts  # Journal entry store
│   │   ├── leave.ts         # Leave management store
│   │   ├── payroll.ts       # Payroll store
│   │   ├── product.ts       # Product store
│   │   ├── purchaseOrder.ts # Purchase order store
│   │   ├── receivableInvoice.ts
│   │   ├── role.ts          # Role management store
│   │   ├── search.ts        # Search state store
│   │   ├── table.ts         # Table state store
│   │   ├── tabs.ts          # Tab state store
│   │   ├── ui.ts            # UI state store
│   │   ├── userManagement.ts
│   │   ├── vendor.ts        # Vendor store
│   │   └── warehouse.ts     # Warehouse store
│   ├── hooks/               # Custom React hooks
│   │   ├── usePermission.ts # Permission checking hooks
│   │   └── use-mobile.tsx   # Mobile detection hook
│   ├── router.tsx           # Router setup
│   ├── main.tsx             # Application entry point
│   ├── App.tsx              # Legacy App component (not used)
│   ├── App.css
│   ├── index.css            # Global styles
│   └── vite-env.d.ts        # Vite type definitions
├── public/                  # Static assets
│   ├── bg-rz.png
│   ├── pag-ibig.png
│   ├── philhealth.jpg
│   └── sss.jpg
├── components.json          # shadcn/ui configuration
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts          # Vite config with API proxy & cookie handling
├── tailwind.config.js
├── postcss.config.js
└── .eslintrc.cjs
```

---

## 3. Technology Stack

| Technology      | Purpose                 | Version/Notes    |
| --------------- | ----------------------- | ---------------- |
| React           | UI framework            | ^18.2.0          |
| TypeScript      | Type safety             | ^5.2.2           |
| Vite            | Dev server & build tool | ^7.2.7           |
| TanStack Router | File-based routing      | ^1.0.0           |
| Tailwind CSS    | Utility-first styling   | ^3.4.0           |
| shadcn/ui       | Component primitives    | Radix UI based   |
| Radix UI        | Headless UI components  | Various packages |
| Zustand         | State management        | ^4.4.7           |
| Axios           | HTTP client             | ^1.6.2           |
| Zod             | Runtime validation      | ^3.22.4          |
| Recharts        | Data visualization      | ^2.15.4          |
| Sonner          | Toast notifications     | ^2.0.7           |
| Lucide React    | Icon library            | ^0.556.0         |
| Hugeicons React | Additional icons        | ^0.3.0           |

---

## 4. Frontend–Backend Contract (In Sync With `api.md`)

### 4.1 JSON Contract

The frontend **MUST** assume and enforce the same JSON structure as the backend:

```ts
// Generic API response type (from lib/types.ts)
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
- `403` → Permission denied; show "You do not have access to this action."
- `404` → Handle as "Not found" page / resource-level error
- `422` → Show field-level validation errors from `errors`
- `419` → CSRF token mismatch; refetch CSRF cookie and retry
- `500` → Show generic server error; never expose stack traces

---

## 5. Authentication & Session Rules (Frontend)

The frontend uses **session-based authentication with cookies**, aligned with backend CSRF + CORS rules.

### 5.1 High-Level Flow

1. Frontend loads auth pages (e.g., login/register).
2. Frontend **fetches CSRF cookie** from the backend (`/csrf-cookie` or `/sanctum/csrf-cookie`).
3. User submits credentials to login endpoint (`/api/auth/login`).
4. Backend validates login + CSRF → issues **session cookie**.
5. Browser automatically sends the session cookie with further requests.
6. Protected routes use an **AuthGuard** component to check if the user is logged in.
7. On 401 or 419, frontend triggers **recovery flows** (refresh session, refetch CSRF, retry).

### 5.2 Required Endpoints

The frontend uses these endpoints:

- `GET /csrf-cookie` or `/sanctum/csrf-cookie` – fetch CSRF token cookie
- `POST /api/auth/login` – login
- `POST /api/auth/logout` – logout
- `GET /api/user` – get current user
- `POST /api/auth/refresh` – refresh session (with concurrent request prevention)

### 5.3 Auth Store (Zustand)

Located in `stores/auth.ts`:

```ts
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  fetchUser: () => Promise<void>;
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}
```

Rules:

- `isAuthenticated` = `true` only when `user` is non-null and session validated.
- `fetchUser` calls `/api/user` and updates store, syncing permissions/roles to RBAC store.
- `login` fetches CSRF cookie first, then calls login endpoint.
- `logout` calls backend logout and clears both auth and RBAC stores.

---

## 6. CSRF & CORS Rules (Frontend Side)

### 6.1 CSRF Handling

Frontend implementation in `lib/api.ts`:

1. **Fetch CSRF cookie** before any login or state-changing request that requires it.
2. Read CSRF cookie (`XSRF-TOKEN`) from `document.cookie` using `getCookie()` utility.
3. Send token as `X-XSRF-TOKEN` header on **all** state-changing requests (POST/PUT/PATCH/DELETE).

Request interceptor automatically attaches CSRF token:

```ts
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getCookie("XSRF-TOKEN");
  if (token && !config.headers["X-XSRF-TOKEN"]) {
    config.headers["X-XSRF-TOKEN"] = token;
  }
  return config;
});
```

### 6.2 CORS & Cookies

The axios instance is created with `withCredentials: true`:

```ts
export const api = axios.create({
  baseURL: import.meta.env.DEV
    ? API_CONFIG[ENVIRONMENT]?.baseURL || ""
    : import.meta.env.VITE_API_HOST || "",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});
```

Development:

- Vite proxy forwards `/api`, `/csrf-cookie`, and `/sanctum/csrf-cookie` to backend.
- Proxy strips `Domain=` attribute from cookies so they work on `localhost`.
- Environment switching via `VITE_ENVIRONMENT` env var or `USE_LOCAL` flag in `vite.config.ts`.

Production:

- API host is controlled by `VITE_API_HOST` environment variable.
- Frontend and backend domains must match backend CORS config.

---

## 7. Axios Interceptors & Error Handling

### 7.1 Request Interceptor Rules

- Always attach `X-XSRF-TOKEN` if cookie exists.
- Never hardcode tokens; always read from cookies.
- Keep content type and accept headers consistent.

### 7.2 Response Interceptor Rules

Implementation in `lib/api.ts`:

```ts
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // CSRF token mismatch (419)
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
        await attemptRefresh(); // Uses shared promise to prevent concurrent refreshes
        return api(originalRequest);
      } catch {
        // Refresh failed, logout already handled in attemptRefresh
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);
```

Key features:

- **Concurrent refresh prevention**: Uses a shared promise to prevent multiple simultaneous refresh requests.
- Do **not** retry login/register on 401 (avoid infinite loops via `isAuthEndpoint` check).
- Only retry once per request (`_retry` flag).
- On failed refresh, clear auth state and redirect to login.

---

## 8. Route Guards

### 8.1 Auth Guard

Located in `components/rbac/AuthGuard.tsx`:

```tsx
export function AuthGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, user, fetchUser, loading } = useAuthStore();

  useEffect(() => {
    if (!user && !loading) {
      fetchUser();
    }
  }, [user, loading, fetchUser]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/auth/login" />;
  }

  return <>{children}</>;
}
```

Usage in routes:

```tsx
import { AuthGuard } from "@/components/rbac/AuthGuard";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: () => (
    <AuthGuard>
      <DashboardPage />
    </AuthGuard>
  ),
});
```

### 8.2 Permission Guard

Located in `components/rbac/PermissionGuard.tsx`:

```tsx
export function PermissionGuard({
  permission,
  children,
  fallback = null,
}: {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const hasPermission = usePermission(permission);

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
```

---

## 9. RBAC Rules (Frontend)

Frontend RBAC must stay in sync with backend RBAC as described in `api.md`:

- Backend roles + permissions are authoritative.
- Permission strings follow `resource.action` convention (e.g., `users.view`, `users.create`).

### 9.1 RBAC Store

Located in `stores/rbac.ts`:

```ts
interface RbacState {
  roles: string[];
  permissions: string[];
  setRoles: (roles: string[]) => void;
  setPermissions: (perms: string[]) => void;
  hasPermission: (perm: string) => boolean;
  hasAnyPermission: (perms: string[]) => boolean;
  hasAllPermissions: (perms: string[]) => boolean;
  isSuperAdmin: () => boolean;
}
```

Key features:

- **Super-admin support**: `isSuperAdmin()` checks for `"super-admin"` role.
- Super-admin automatically has all permissions (checked in `hasPermission`, `hasAnyPermission`, `hasAllPermissions`).
- Permissions and roles are synced from auth store when user is fetched/logged in.

### 9.2 Permission Hooks

Located in `hooks/usePermission.ts`:

```ts
export function usePermission(permission: string): boolean {
  return useRbacStore((state) => state.hasPermission(permission));
}

export function useAnyPermission(permissions: string[]): boolean {
  return useRbacStore((state) => state.hasAnyPermission(permissions));
}

export function useAllPermissions(permissions: string[]): boolean {
  return useRbacStore((state) => state.hasAllPermissions(permissions));
}
```

### 9.3 Usage Rules

- Never hardcode "admin" checks in components.
- Check **permissions**, not roles, in UI.
- Super admin behavior is handled **frontend-side** (super-admin role grants all permissions).

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

- **No `any` allowed** (enforced by ESLint).
- All API calls must be typed using `ApiResponse<T>`.
- All components must have typed props.
- Strict mode enabled in `tsconfig.json`.

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
  roles?: string[];
  permissions?: string[];
}

async function fetchUsers(): Promise<ApiResponse<User[]>> {
  const response = await api.get<ApiResponse<User[]>>("/api/users");
  return response.data;
}
```

---

## 11. Semantic Components & Layout Rules

The UI uses **semantic wrapper components** instead of raw `<div>` soup.

Semantic components (in `components/semantic/`):

- `PageLayout` - Page container
- `MainContent` - Main content wrapper
- `Section` - Section container
- `Heading` - Semantic heading (levels 1-6)
- `Paragraph` - Paragraph text
- `Form` - Form wrapper
- `FormGroup` - Form field group
- `FormActions` - Form action buttons container

Example:

```tsx
import {
  MainContent,
  Section,
  PageLayout,
  Heading,
  Form,
  FormGroup,
  FormActions,
} from "@/components/semantic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

## 12. Routing & Layout

### 12.1 TanStack Router

The app uses **file-based routing** with TanStack Router:

- Routes are defined in `src/routes/` directory.
- Route files export a `Route` object created with `createRoute()`.
- Route tree is auto-generated via `@tanstack/router-cli` (run `npm run tsr`).
- Generated route tree is in `src/routeTree.gen.ts`.

### 12.2 Root Route Layout

The root route (`routes/__root.tsx`) conditionally renders sidebar and navbar:

- **Routes with sidebar/navbar**: `/dashboard`, `/hris`, `/finance`, `/account-payable`, `/account-receivable`, `/accounts`, `/inventory`, `/purchase-order`, `/vendors`, `/access-control`, `/settings`, `/users`
- **Public routes** (no sidebar/navbar): `/`, `/auth/login`, `/auth/register`

The root route also:

- Handles scroll-to-top on route changes.
- Provides page title and description based on current route.
- Shows a pending screen while routes are loading.

### 12.3 Route Structure

Routes are organized by domain:

- `auth.login.tsx` - Login page
- `dashboard.tsx` - Dashboard
- `hris.tsx` - HRIS module (with nested pages)
- `finance.tsx` - Finance module (with nested pages)
- `inventory.tsx` - Inventory module (with nested pages)
- `access-control.tsx` - Access control module
- `account-payable.tsx` - Accounts payable
- `account-receivable.tsx` - Accounts receivable
- `accounts.tsx` - Combined accounts view
- `purchase-order.tsx` - Purchase orders
- `vendors.tsx` - Vendors
- `users.tsx` - User management
- `settings.tsx` - Settings

---

## 13. Vite & Environment Rules

### 13.1 Vite Config

Located in `vite.config.ts`:

- Dev server proxies API paths (`/api`, `/csrf-cookie`, `/sanctum/csrf-cookie`) to backend.
- Proxy strips `Domain=` from cookies for localhost compatibility.
- Environment switching via `USE_LOCAL` flag (or `VITE_ENVIRONMENT` env var):
  - `USE_LOCAL = true`: `http://localhost:8000`
  - `USE_LOCAL = false`: `https://rzerp-api.socia-dev.com`
- Path alias `@` maps to `./src`.

### 13.2 Env Vars

Example `.env`:

```env
VITE_ENVIRONMENT=local
VITE_API_HOST=https://rzerp-api.socia-dev.com
VITE_APP_NAME=RZERP
```

Rule: All frontend env vars MUST be prefixed with `VITE_`.

---

## 14. State Management (Zustand)

The app uses Zustand for state management with domain-specific stores:

### 14.1 Core Stores

- `stores/auth.ts` - Authentication state
- `stores/rbac.ts` - RBAC state (roles, permissions)

### 14.2 Domain Stores

- `stores/account.ts` - Account management
- `stores/budget.ts` - Budget management
- `stores/employee.ts` - Employee data
- `stores/invoice.ts` - Invoice management
- `stores/journalEntry.ts` - Journal entries
- `stores/leave.ts` - Leave management
- `stores/payroll.ts` - Payroll data
- `stores/product.ts` - Product data
- `stores/purchaseOrder.ts` - Purchase orders
- `stores/receivableInvoice.ts` - Receivable invoices
- `stores/role.ts` - Role management
- `stores/userManagement.ts` - User management
- `stores/vendor.ts` - Vendor data
- `stores/warehouse.ts` - Warehouse data

### 14.3 UI Stores

- `stores/ui.ts` - UI state (modals, dialogs, etc.)
- `stores/filter.ts` - Filter state
- `stores/search.ts` - Search state
- `stores/table.ts` - Table state (pagination, sorting, etc.)
- `stores/tabs.ts` - Tab state

---

## 15. Component Library (shadcn/ui)

The app uses **shadcn/ui** components built on Radix UI:

- Components are in `components/ui/` directory.
- Configuration in `components.json`.
- Components are copy-paste (not installed via npm), allowing full customization.
- All components are TypeScript and fully typed.

Key UI components:

- `button`, `input`, `label`, `textarea` - Form controls
- `card`, `dialog`, `sheet` - Containers
- `table`, `pagination` - Data display
- `tabs`, `dropdown-menu`, `select` - Navigation/selection
- `avatar`, `badge`, `progress` - Display elements
- `sidebar`, `breadcrumb` - Layout
- `sonner` - Toast notifications
- `chart` - Chart wrapper for Recharts

---

## 16. Development Workflow

### 16.1 Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "type-check": "tsc --noEmit",
    "preview": "vite preview",
    "serve": "vite preview --host 0.0.0.0 --port 55007",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "tsr": "npx @tanstack/router-cli generate"
  }
}
```

### 16.2 Expectations

- `npm run build` must succeed without errors.
- `npm run type-check` must pass (no type errors).
- `npm run lint` must pass (no unused `any`, etc.).
- `npm run tsr` must be run after adding/modifying routes to regenerate route tree.

### 16.3 Route Generation

After creating or modifying routes, run:

```bash
npm run tsr
```

This generates `src/routeTree.gen.ts` which is required for the router to work.

---

## 17. Frontend–Backend Sync Checklist

To keep frontend and backend in sync:

- [ ] Backend returns JSON in the format defined in `api.md`.
- [ ] Frontend uses `ApiResponse<T>` everywhere.
- [ ] CSRF cookie endpoint is configured and used in frontend (`/csrf-cookie` or `/sanctum/csrf-cookie`).
- [ ] Axios has `withCredentials: true`.
- [ ] CORS on backend allows frontend origin + credentials.
- [ ] RBAC permission names match between backend and frontend.
- [ ] No `any` in TypeScript code (enforced by ESLint).
- [ ] Route guards and permission guards are applied to all protected pages.
- [ ] Session refresh endpoint (`/api/auth/refresh`) is implemented and working.
- [ ] Environment variables are properly configured for local and staging.

This file, together with `api.md`, defines the **full contract** between the backend API and the frontend SPA.
