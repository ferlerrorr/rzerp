# User Management Page - Frontend Documentation

## Overview

The User Management system in the frontend provides a comprehensive interface for managing users, their roles, and permissions. The implementation follows a component-based architecture with state management, API integration, and permission-based access control.

## Architecture

### File Structure

```
frontend/src/
├── pages/
│   ├── users.tsx                          # Basic users page (legacy)
│   ├── users-with-permission.tsx          # Permission-wrapped users page
│   └── accessControl/
│       └── userManagement.tsx             # Main user management component
├── routes/
│   └── users.tsx                          # Route definition with auth guard
├── stores/
│   └── userManagement.ts                  # Zustand store for form state
├── components/
│   ├── dialogs/
│   │   └── add-user-dialog.tsx            # User creation/editing dialog
│   ├── table/
│   │   └── appTable.tsx                   # Reusable table component
│   ├── card/
│   │   └── simpleCard.tsx                # Statistics card component
│   └── rbac/
│       └── PermissionGuard.tsx           # Permission-based access control
└── lib/
    ├── api.ts                             # Axios instance and API functions
    └── types.ts                           # TypeScript type definitions
```

## Components

### 1. User Management Tab (`userManagement.tsx`)

**Location:** `frontend/src/pages/accessControl/userManagement.tsx`

**Purpose:** Main component that displays and manages users with a table interface, statistics cards, and CRUD operations.

#### Key Features:
- **Statistics Dashboard**: Displays 4 key metrics:
  - Total Users
  - Active Users (email verified)
  - Inactive Users
  - Roles Defined
- **Search Functionality**: Real-time search using `useSearchStore`
- **Data Table**: Displays users with columns:
  - Name
  - Email
  - Roles (comma-separated)
  - Status (Active/Inactive badge)
  - Created Date
- **Actions**: View, Edit, Delete operations per user
- **Add User Button**: Opens dialog for creating new users

#### State Management:
```typescript
const [users, setUsers] = useState<User[]>([]);
const [roles, setRoles] = useState<RoleOption[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [isAddUserOpen, setIsAddUserOpen] = useState(false);
```

#### API Integration:

**Fetch Users:**
```typescript
const fetchUsers = useCallback(async () => {
  const params = searchQuery ? { search: searchQuery } : {};
  const response = await api.get<ApiResponse<UsersData>>("/api/users", {
    params,
  });
  // Response structure: { success: boolean, data: { users: User[], pagination: {...} } }
}, [searchQuery]);
```

**Fetch Roles:**
```typescript
const fetchRoles = useCallback(async () => {
  const response = await api.get<ApiResponse<RoleOption[]>>("/api/roles");
  // Response structure: { success: boolean, data: RoleOption[] }
}, []);
```

**Create User:**
```typescript
const handleUserSubmit = async (data: UserFormData) => {
  // Step 1: Create user
  const response = await api.post<ApiResponse<User>>("/api/users", {
    name: data.name,
    email: data.email,
    password: data.password,
    password_confirmation: data.password_confirmation,
  });
  
  // Step 2: Assign roles if selected
  if (data.role_ids.length > 0) {
    await api.post(`/api/users/${newUser.id}/roles`, {
      roles: data.role_ids,
    });
  }
};
```

**Delete User:**
```typescript
const handleDelete = async (userId: number) => {
  const response = await api.delete<ApiResponse<void>>(`/api/users/${userId}`);
};
```

### 2. Add User Dialog (`add-user-dialog.tsx`)

**Location:** `frontend/src/components/dialogs/add-user-dialog.tsx`

**Purpose:** Modal dialog for creating new users with form validation.

#### Form Fields:
- **Name** (required)
- **Email** (required, validated format)
- **Password** (required, min 8 characters)
- **Password Confirmation** (required, must match password)
- **Roles** (optional, multi-select checkboxes)

#### Validation:
- Client-side validation via `useUserManagementStore.validateForm()`
- Email format validation
- Password match validation
- Password length validation (minimum 8 characters)
- Server-side validation errors displayed on form fields

#### State Management:
Uses `useUserManagementStore` for form state:
```typescript
const {
  formData,
  errors,
  updateField,
  updateRoleIds,
  validateForm,
  resetForm,
} = useUserManagementStore();
```

### 3. User Management Store (`userManagement.ts`)

**Location:** `frontend/src/stores/userManagement.ts`

**Purpose:** Zustand store managing form state, validation, and errors for user creation/editing.

#### State Structure:
```typescript
interface UserFormData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role_ids: number[];
}

interface UserManagementState {
  formData: UserFormData;
  errors: Partial<Record<keyof UserFormData, string>>;
  isOpen: boolean;
  // ... methods
}
```

#### Key Methods:
- `setFormData(data)`: Set entire form data
- `updateField(field, value)`: Update single field and clear its error
- `updateRoleIds(roleIds)`: Update selected role IDs
- `validateForm()`: Validate all fields and return boolean
- `resetForm()`: Reset form to initial state
- `setError(field, error)`: Set error for specific field
- `clearErrors()`: Clear all errors

### 4. Permission Guard (`PermissionGuard.tsx`)

**Location:** `frontend/src/components/rbac/PermissionGuard.tsx`

**Purpose:** Wraps components to enforce permission-based access control.

#### Usage in Users Page:
```typescript
<PermissionGuard
  permission="users.view"
  fallback={<AccessDenied />}
>
  <UsersPage />
</PermissionGuard>
```

The guard checks if the current user has the `users.view` permission using the `usePermission` hook.

### 5. App Table Component (`appTable.tsx`)

**Location:** `frontend/src/components/table/appTable.tsx`

**Purpose:** Reusable table component with pagination, actions, and customizable columns.

#### Features:
- Pagination (managed by `useTableStore`)
- Action dropdown menu per row
- Badge support for status columns
- Customizable column definitions
- Responsive design

#### Column Definition:
```typescript
const userColumns: ColumnDef<UserTableRow>[] = [
  {
    header: "Name",
    accessor: "name",
    className: "font-medium",
  },
  {
    header: "Status",
    accessor: "status",
    useBadge: true,
    badgeVariantMap: {
      Active: "success",
      Inactive: "default",
    },
  },
  // ... more columns
];
```

### 6. Simple Card Component (`simpleCard.tsx`)

**Location:** `frontend/src/components/card/simpleCard.tsx`

**Purpose:** Displays statistics with icon, count, and title.

#### Usage:
```typescript
<SimpleCard
  title="Total Users"
  count={userCounts.totalUsers}
  countColor="black"
  icon={Users}
  iconBgColor="blue"
/>
```

## API Integration

### API Client Setup

**Location:** `frontend/src/lib/api.ts`

The API client is configured with:
- Base URL from environment variables
- Credentials (cookies) enabled for session management
- CSRF token handling
- Automatic session refresh on 401 errors
- Request/response interceptors

### API Endpoints Used

#### 1. Get Users List
```
GET /api/users?search={query}
```
**Response:**
```typescript
{
  success: boolean;
  data: {
    users: User[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
}
```

#### 2. Get Single User
```
GET /api/users/{id}
```
**Response:**
```typescript
{
  success: boolean;
  data: User;
}
```

#### 3. Create User
```
POST /api/users
Body: {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}
```
**Response:**
```typescript
{
  success: boolean;
  data: User;
  message?: string;
  errors?: Record<string, string[]>;
}
```

#### 4. Update User
```
PUT /api/users/{id}
Body: {
  name: string;
  email: string;
  password?: string; // Optional for updates
}
```
**Response:**
```typescript
{
  success: boolean;
  data: User;
}
```

#### 5. Delete User
```
DELETE /api/users/{id}
```
**Response:**
```typescript
{
  success: boolean;
  message?: string;
}
```

#### 6. Assign Roles to User
```
POST /api/users/{id}/roles
Body: {
  roles: number[]; // Array of role IDs
}
```

#### 7. Get Roles List
```
GET /api/roles
```
**Response:**
```typescript
{
  success: boolean;
  data: Role[];
}
```

### Error Handling

The API client includes comprehensive error handling:

1. **CSRF Token Mismatch (419)**: Automatically fetches new CSRF cookie and retries
2. **Unauthorized (401)**: Attempts session refresh, then retries request
3. **Validation Errors**: Displays field-specific errors from `errors` object in response
4. **Network Errors**: Shows user-friendly error messages via toast notifications

### Request Flow

```
User Action
    ↓
Component Handler
    ↓
API Call (api.get/post/put/delete)
    ↓
Request Interceptor (adds CSRF token)
    ↓
Backend API
    ↓
Response Interceptor (handles errors)
    ↓
Component State Update
    ↓
UI Update
```

## Data Flow

### User Creation Flow

```
1. User clicks "Add User" button
   ↓
2. AddUserDialog opens
   ↓
3. User fills form (managed by useUserManagementStore)
   ↓
4. Form validation (client-side)
   ↓
5. Submit → POST /api/users
   ↓
6. If roles selected → POST /api/users/{id}/roles
   ↓
7. Success → Toast notification + Refresh user list
   ↓
8. Error → Display validation errors in form
```

### User List Display Flow

```
1. Component mounts
   ↓
2. fetchUsers() called
   ↓
3. GET /api/users (with search params if applicable)
   ↓
4. Response parsed → setUsers()
   ↓
5. Users transformed for table display
   ↓
6. Statistics calculated (total, active, inactive, roles)
   ↓
7. Table rendered with pagination
```

### Search Flow

```
1. User types in search input
   ↓
2. useSearchStore updates query
   ↓
3. fetchUsers() re-runs (useCallback dependency)
   ↓
4. GET /api/users?search={query}
   ↓
5. Filtered results displayed
```

## Type Definitions

### User Interface
```typescript
interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
  roles: Role[];
}
```

### Role Interface
```typescript
interface Role {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  pivot: {
    user_id: number;
    role_id: number;
  };
  permissions: Permission[];
}
```

### API Response Interface
```typescript
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}
```

## State Management

### Global Stores Used

1. **useUserManagementStore**: Form state for user creation/editing
2. **useSearchStore**: Global search query state
3. **useTableStore**: Table pagination state
4. **useAuthStore**: Authentication state (for permission checks)
5. **useRbacStore**: Roles and permissions state

### Local Component State

- `users`: Array of user objects
- `roles`: Array of available roles
- `loading`: Loading state for API calls
- `error`: Error message state
- `isAddUserOpen`: Dialog open/close state

## UI/UX Features

### Statistics Cards
- Real-time calculation from user data
- Color-coded counts (green for active, etc.)
- Icon-based visual indicators
- Responsive grid layout

### Search
- Real-time search as user types
- Debounced API calls (via useCallback)
- Search across name and email fields

### Table Features
- Pagination (configurable items per page)
- Action dropdown per row
- Badge indicators for status
- Responsive design
- Loading states

### Notifications
- Success toasts for create/delete operations
- Error toasts for failed operations
- Warning toasts for partial failures (e.g., roles not assigned)

## Security & Permissions

### Permission Checks

1. **Route Level**: `users.tsx` route requires authentication via `requireAuth()`
2. **Component Level**: `UsersPageWithPermission` wraps content with `PermissionGuard`
3. **Permission Required**: `users.view` permission needed to access the page

### Session Management

- Session cookies sent with all requests (`withCredentials: true`)
- CSRF tokens automatically attached to requests
- Automatic session refresh on 401 errors
- Session validation on page load

## Best Practices

1. **Error Handling**: All API calls wrapped in try-catch with user-friendly error messages
2. **Loading States**: Loading indicators shown during API calls
3. **Form Validation**: Both client-side and server-side validation
4. **Type Safety**: Full TypeScript coverage for all data structures
5. **Reusability**: Components designed for reuse across the application
6. **State Management**: Centralized state management with Zustand
7. **Performance**: useCallback and useMemo for expensive operations
8. **Accessibility**: Semantic HTML and ARIA labels where appropriate

## Future Enhancements

Potential improvements:
- Edit user functionality (currently only View/Delete implemented)
- Bulk operations (bulk delete, bulk role assignment)
- Advanced filtering (by role, status, date range)
- Export functionality (CSV, Excel)
- User activity logs
- Password reset functionality
- Email verification status management
