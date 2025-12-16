<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{

    /**
     * Login user
     *
     * @param LoginRequest $request
     * @return JsonResponse
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $result = User::login($request->validated(), $request);

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
     * @param RegisterRequest $request
     * @return JsonResponse
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $result = User::register($request->validated(), $request);

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
}

