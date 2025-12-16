<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Get list of users
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $result = User::getUsers($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Users retrieved successfully',
            'data' => $result,
        ]);
    }

    /**
     * Get a single user
     *
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        $result = User::getUserById($id);

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'User retrieved successfully',
            'data' => $result['user'],
        ]);
    }

    /**
     * Create a new user
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        $validated = User::validateStore($request->all());
        $result = User::createUser($validated);

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
                'errors' => $result['errors'] ?? [],
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => 'User created successfully',
            'data' => $result['user'],
        ], 201);
    }

    /**
     * Update a user
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $validated = User::validateUpdate($request->all(), $id);
        $result = User::updateUserById($id, $validated);

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
                'errors' => $result['errors'] ?? [],
            ], $result['status'] ?? 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'User updated successfully',
            'data' => $result['user'],
        ]);
    }

    /**
     * Delete a user
     *
     * @param int $id
     * @return JsonResponse
     */
    public function destroy(int $id): JsonResponse
    {
        $result = User::deleteUserById($id);

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
            ], $result['status'] ?? 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'User deleted successfully',
        ]);
    }

    /**
     * Assign roles to a user
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function assignRoles(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'role_ids' => 'required|array',
            'role_ids.*' => 'exists:roles,id',
        ]);

        $result = User::assignRolesToUser($id, $request->role_ids);

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Roles assigned successfully',
            'data' => $result['user'],
        ]);
    }

    /**
     * Get list of all roles
     *
     * @return JsonResponse
     */
    public function roles(): JsonResponse
    {
        $roles = User::roleQuery()->get();

        return response()->json([
            'success' => true,
            'message' => 'Roles retrieved successfully',
            'data' => $roles->map(function ($role) {
                // Get permissions for this role
                $roleId = $role->id;
                $permissions = User::permissionQuery()
                    ->join('role_permission', 'permissions.id', '=', 'role_permission.permission_id')
                    ->where('role_permission.role_id', $roleId)
                    ->pluck('permissions.name')
                    ->toArray();

                return [
                    'id' => $role->id,
                    'name' => $role->name,
                    'permissions' => $permissions,
                ];
            }),
        ]);
    }

    /**
     * Login user
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function login(Request $request): JsonResponse
    {
        $validated = User::validateLogin($request->all());
        $result = User::login($validated, $request);

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
                'errors' => $result['errors'] ?? [],
            ], 401);
        }

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'data' => $result['user'],
        ]);
    }

    /**
     * Register user
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function register(Request $request): JsonResponse
    {
        $validated = User::validateRegister($request->all());
        $result = User::register($validated, $request);

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
                'errors' => $result['errors'] ?? [],
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => 'Registration successful',
            'data' => $result['user'],
        ], 201);
    }

    /**
     * Get current authenticated user
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function me(Request $request): JsonResponse
    {
        // Validate session
        $sessionValidation = User::validateSession($request);
        
        if (!$sessionValidation['valid']) {
            $response = response()->json([
                'success' => false,
                'message' => $sessionValidation['message'] ?? 'Session not found in database',
            ], 401);
            
            return $this->expireSessionCookie($response);
        }
        
        $user = $request->user();
        
        // If no user is authenticated, return 401
        if (!$user) {
            // If we have a session but no user, destroy it to prevent reuse
            if ($request->hasSession()) {
                try {
                    $request->session()->invalidate();
                } catch (\Exception $e) {
                    // Ignore errors
                }
            }
            
            $response = response()->json([
                'success' => false,
                'message' => 'Not authenticated',
            ], 401);
            
            return $this->expireSessionCookie($response);
        }

        return response()->json([
            'success' => true,
            'data' => $user->toAuthArray(),
        ]);
    }

    /**
     * Logout user
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();
        $userId = $user ? $user->id : null;
        
        if ($user) {
            User::logout($user);
        }
        
        // Handle session deletion
        User::handleLogoutSession($request, $userId);

        // Create response and expire session cookie
        $response = response()->json([
            'success' => true,
            'message' => 'Logout successful',
        ]);
        
        // Add headers to prevent caching
        $response->headers->set('Cache-Control', 'no-cache, no-store, must-revalidate');
        $response->headers->set('Pragma', 'no-cache');
        $response->headers->set('Expires', '0');
        
        return $this->expireSessionCookie($response);
    }

    /**
     * Refresh session
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function refresh(Request $request): JsonResponse
    {
        // Check if user is authenticated first - return 401 if not
        $user = $request->user();
        
        if (!$user) {
            $response = response()->json([
                'success' => false,
                'message' => 'Not authenticated',
            ], 401);
            
            return $this->expireSessionCookie($response);
        }

        $result = User::refreshSession($request);

        if (!$result['success']) {
            $response = response()->json([
                'success' => false,
                'message' => $result['message'],
            ], 401);
            
            return $this->expireSessionCookie($response);
        }

        return response()->json([
            'success' => true,
            'message' => $result['message'],
        ]);
    }

    /**
     * Expire session cookie helper
     *
     * @param JsonResponse $response
     * @return JsonResponse
     */
    private function expireSessionCookie(JsonResponse $response): JsonResponse
    {
        try {
            $cookieName = config('session.cookie', 'laravel_session');
            $path = config('session.path', '/');
            $domain = config('session.domain') ?: null;
            
            // Expire cookie for configured domain
            if ($domain) {
                $cookie = cookie(
                    $cookieName,
                    '',
                    -2628000,
                    $path,
                    $domain,
                    (bool) config('session.secure'),
                    (bool) config('session.http_only', true),
                    false,
                    config('session.same_site', 'lax') ?: 'lax'
                );
                $response = $response->withCookie($cookie);
            }
            
            // Also expire for null domain (localhost)
            $cookieNull = cookie(
                $cookieName,
                '',
                -2628000,
                $path,
                null,
                false,
                (bool) config('session.http_only', true),
                false,
                config('session.same_site', 'lax') ?: 'lax'
            );
            $response = $response->withCookie($cookieNull);
        } catch (\Exception $e) {
            // Continue even if cookie expiration fails
        }
        
        return $response;
    }
}
