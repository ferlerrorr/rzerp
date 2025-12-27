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

        // Super admin bypass
        $roles = is_array($user->roles) ? $user->roles : [];
        if (in_array('super-admin', $roles)) {
            return $next($request);
        }

        // Check permission
        $permissions = is_array($user->permissions) ? $user->permissions : [];
        if (!in_array($permission, $permissions)) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have access to this action.',
            ], 403);
        }

        return $next($request);
    }
}

