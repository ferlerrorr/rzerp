<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission
{
    /**
     * Handle an incoming request.
     *
     * @param Request $request
     * @param Closure $next
     * @param string $permission
     * @return Response
     */
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 401);
        }

        // Super admin and admin bypass
        $roles = is_array($user->roles) ? $user->roles : [];
        if (in_array('super-admin', $roles) || in_array('admin', $roles)) {
            return $next($request);
        }

        // Check permission
        $permissions = is_array($user->permissions) ? $user->permissions : [];
        
        // Handle nested permissions structure
        $flatPermissions = $permissions;
        if (!empty($permissions) && (isset($permissions['user_management']) || isset($permissions['hris']))) {
            // It's nested, extract flat list
            $flatPermissions = \App\Models\User::extractFlatPermissions($permissions);
        }
        
        if (!in_array($permission, $flatPermissions)) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have access to this action.',
            ], 403);
        }

        return $next($request);
    }
}

