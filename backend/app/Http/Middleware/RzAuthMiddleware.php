<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RzAuthMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param Request $request
     * @param Closure $next
     * @return Response
     */
    public function handle(Request $request, Closure $next): Response
    {
        $sessionCookie = User::getSessionCookie($request);
        $xsrfToken = User::getXsrfToken($request);
        
        // If no session cookie, user is not authenticated
        if (!$sessionCookie) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 401);
        }

        // Validate session with RZ Auth
        $result = User::getCurrentUser($request);

        if (!isset($result['success']) || !$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'] ?? 'Unauthorized',
            ], 401);
        }

        // Attach user data to request
        if (isset($result['data'])) {
            $user = $result['data'];
            
            // Create a user object that can be accessed via $request->user()
            $userObject = new class($user) {
                public int $id;
                public string $name;
                public string $email;
                public array $roles;
                public array $permissions;

                public function __construct(array $user)
                {
                    $this->id = $user['id'] ?? 0;
                    $this->name = $user['name'] ?? '';
                    $this->email = $user['email'] ?? '';
                    $this->roles = $user['roles'] ?? [];
                    $this->permissions = $user['permissions'] ?? [];
                }

                public function hasRole(string $role): bool
                {
                    return in_array($role, $this->roles);
                }

                public function hasPermission(string $permission): bool
                {
                    // Handle nested permissions structure
                    if (empty($this->permissions)) {
                        return false;
                    }
                    
                    // Check if permissions is nested structure
                    if (isset($this->permissions['user_management']) || isset($this->permissions['hris'])) {
                        // It's nested, extract flat list
                        $flatPermissions = \App\Models\User::extractFlatPermissions($this->permissions);
                        return in_array($permission, $flatPermissions);
                    }
                    
                    // It's a flat array
                    return in_array($permission, $this->permissions);
                }
            };

            // Attach to request
            $request->setUserResolver(function () use ($userObject) {
                return $userObject;
            });
        }

        return $next($request);
    }
}
