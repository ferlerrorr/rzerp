# API Backend Development Rules (Generic)

This document defines the mandatory standards for building a modern API backend.  
It is framework-agnostic and focuses on:

- API-only architecture  
- JSON-only responses  
- CORS  
- CSRF  
- Simple RBAC  
- Type safety  
- Clean controller/model separation  
- Validation & error formatting  

---

## 1. API-ONLY BACKEND

### No Views or HTML Output
All endpoints MUST return JSON only.

Forbidden:
- HTML responses
- Server-rendered templates
- Redirects

Allowed:
- JSON success responses
- JSON error responses
- JSON health checks

---

## 2. STANDARD JSON RESPONSE FORMAT

### Success
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}

### Error
{
  "success": false,
  "message": "Error description",
  "errors": {
    "field": ["Error message"]
  }
}

### Status Codes
| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Resource created |
| 400 | Bad request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not found |
| 422 | Validation error |
| 500 | Server error |

---

## 3. CORS RULES (Generic)

The backend must explicitly allow the frontend origin and must allow credentials.

### Required Headers
Access-Control-Allow-Origin: <frontend-url>
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: *
Access-Control-Allow-Headers: *

### Notes
- OPTIONS preflight must always return 200.
- CORS middleware must run before auth middleware.
- Cookies will not be sent unless Allow-Credentials: true.

---

## 4. CSRF RULES (Simple)

For session or cookie-based authentication, CSRF must be enforced.

### CSRF Flow
1. Frontend requests token (/csrf-token, /sanctum/csrf-cookie, etc.).
2. Backend sets a CSRF cookie (XSRF-TOKEN or equivalent).
3. Frontend includes token header: X-XSRF-TOKEN: <token>
4. Backend validates token on POST/PUT/PATCH/DELETE.

### Cookie Requirements
- SameSite should be Lax or None
- None requires HTTPS
- Cookie should be HTTP-only

---

## 5. SIMPLE RBAC (Role-Based Access Control)

### Entities

roles
- id
- name

permissions
- id
- name

role_permission
- role_id
- permission_id

user_role
- user_id
- role_id

---

### Permission Naming
Use <resource>.<action> format.

Examples:
- users.view
- users.create
- posts.update
- projects.delete

---

### RBAC Logic (Generic)

if user is not authenticated:
    return 401

if user has role "super-admin":
    allow

required_permission = route.permission

if user.permissions contains required_permission:
    allow
else:
    return 403

---

### Super-Admin Role

The system includes a special "super-admin" role that:
- Bypasses all permission checks
- Has access to all resources and actions
- Should be assigned to system administrators only

**Seeder Setup:**

The system includes seeders to set up RBAC:

1. **PermissionSeeder** - Creates default permissions (e.g., hris.view, hris.create, etc.)
2. **RoleSeeder** - Creates default roles (super-admin, admin, manager, user)
3. **SuperAdminSeeder** - Creates super-admin role and super-admin user

**To seed the database:**

```bash
php artisan db:seed
```

Or seed individually:

```bash
php artisan db:seed --class=PermissionSeeder
php artisan db:seed --class=RoleSeeder
php artisan db:seed --class=SuperAdminSeeder
```

**Super-Admin User:**

The SuperAdminSeeder creates:
- Role: `super-admin`
- User: `rzadmin@socia.com` (if doesn't exist)
- Assigns super-admin role to the user

**Note:** The super-admin user password should be changed after initial setup for security.

---

## 6. CONTROLLER RULES

Controllers must NOT contain business logic.

Allowed:
- Request validation
- Calling model/service logic
- Returning JSON

Forbidden:
- Business calculations
- Database logic
- Data transformations

---

## 7. MODEL / SERVICE RULES

All logic must be in models/services:
- calculations
- state transitions
- validation
- data transformations
- relationship logic
- aggregation functions

Controllers must only delegate.

---

## 8. VALIDATION RULES

### Validation errors return 422

{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": ["Email is required"]
  }
}

Messages must be human-readable.

---

## 9. TYPE SAFETY RULES

Required:
- Explicit input & return types
- No implicit types
- No any or mixed types

---

## 10. DATABASE ACCESS RULES

Allowed:
- ORM access
- Typed query builders

Forbidden:
- Raw SQL strings
- Dynamic unsafe queries

---

## 11. ERROR HANDLING RULES

All errors must return JSON:
- 404
- 500
- validation errors
- auth errors

No HTML error pages.

---

## 12. AUTHENTICATION RULES (Generic)

Supports:
- Cookie/session auth (requires CSRF)
- Token auth (JWT/API keys)

### Token-based header
Authorization: Bearer <token>

---

## 13. HEALTH CHECK ROUTE

GET /health

Response:
{
  "status": "ok"
}

---

## 14. SUMMARY OF REQUIRED RULES

- JSON only
- strict typing
- CORS with credentials
- CSRF validation
- no raw SQL
- logic in model/service
- consistent error format
- simple RBAC
