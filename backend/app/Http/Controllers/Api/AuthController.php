<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\Session;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Session as SessionFacade;

class AuthController extends Controller
{
    public function __construct(
        private readonly AuthService $authService
    ) {
    }

    /**
     * Login user
     *
     * @param LoginRequest $request
     * @return JsonResponse
     */
    public function login(LoginRequest $request): JsonResponse
    {
        // Ensure session is started before login
        if (!$request->hasSession()) {
            $request->session()->start();
        }

        $result = $this->authService->login($request->validated());

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
                'errors' => $result['errors'] ?? [],
            ], 401);
        }

        // Regenerate session ID for security (prevents session fixation)
        // This ensures the session is saved to the database with the authenticated user
        $request->session()->regenerate();
        
        // Force session to be saved by marking it as dirty
        // This ensures the session with user_id is written to the database
        $request->session()->put('_last_activity', time());
        
        // Get session ID and user ID before saving
        $sessionId = $request->session()->getId();
        $userId = $result['user']['id'];
        
        // Explicitly save the session to ensure it's persisted to the database
        SessionFacade::save();
        
        // Directly ensure session is written to database with user_id
        // The session middleware saves the payload, but we need to ensure user_id is set
        if (config('session.driver') === 'database') {
            try {
                // Wait a moment for the session middleware to write the payload
                // Then update the session with user_id
                usleep(100000); // 100ms delay to ensure middleware has written
                
                // Check if session exists in database (written by middleware)
                $existingSession = Session::find($sessionId);
                
                if ($existingSession) {
                    // Session exists - update with user_id and metadata
                    $existingSession->update([
                        'user_id' => $userId,
                        'ip_address' => $request->ip(),
                        'user_agent' => $request->userAgent() ?? '',
                        'last_activity' => time(),
                    ]);
                    Log::info("Updated session in database for user {$userId}", [
                        'session_id' => $sessionId,
                    ]);
                } else {
                    // Session doesn't exist yet - create it with all data
                    // Get session data and encode payload properly
                    $sessionData = $request->session()->all();
                    $payload = base64_encode(serialize($sessionData));
                    
                    Session::create([
                        'id' => $sessionId,
                        'user_id' => $userId,
                        'ip_address' => $request->ip(),
                        'user_agent' => $request->userAgent() ?? '',
                        'payload' => $payload,
                        'last_activity' => time(),
                    ]);
                    Log::info("Created session in database for user {$userId}", [
                        'session_id' => $sessionId,
                    ]);
                }
                
                // Verify the session was created/updated
                $verifiedSession = Session::where('id', $sessionId)->where('user_id', $userId)->first();
                if ($verifiedSession) {
                    Log::info("Session verified in database", [
                        'session_id' => $sessionId,
                        'user_id' => $userId,
                        'has_payload' => !empty($verifiedSession->payload),
                    ]);
                } else {
                    Log::warning("Session verification failed - session not found after creation/update", [
                        'session_id' => $sessionId,
                        'user_id' => $userId,
                    ]);
                }
            } catch (\Exception $e) {
                Log::error('Failed to write session to database: ' . $e->getMessage(), [
                    'exception' => $e,
                    'trace' => $e->getTraceAsString(),
                    'session_id' => $sessionId ?? 'unknown',
                    'user_id' => $userId ?? 'unknown',
                ]);
            }
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
        // Ensure session is started before login
        if (!$request->hasSession()) {
            $request->session()->start();
        }

        $result = $this->authService->register($request->validated());

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
                'errors' => $result['errors'] ?? [],
            ], 422);
        }

        // Regenerate session ID for security (prevents session fixation)
        // This ensures the session is saved to the database with the authenticated user
        $request->session()->regenerate();
        
        // Force session to be saved by marking it as dirty
        // This ensures the session with user_id is written to the database
        $request->session()->put('_last_activity', time());
        
        // Explicitly save the session to ensure it's persisted to the database
        SessionFacade::save();
        
        // Directly ensure session is written to database with user_id
        // The session middleware saves the payload, but we need to ensure user_id is set
        if (config('session.driver') === 'database') {
            try {
                $sessionId = $request->session()->getId();
                $userId = $result['user']['id'];
                
                // Update or insert session with user_id using Eloquent
                // The session payload will be saved by the middleware, but we ensure user_id is set
                Session::updateOrCreate(
                    ['id' => $sessionId],
                    [
                        'user_id' => $userId,
                        'ip_address' => $request->ip(),
                        'user_agent' => $request->userAgent() ?? '',
                        'last_activity' => time(),
                    ]
                );
            } catch (\Exception $e) {
                Log::error('Failed to write session to database: ' . $e->getMessage(), [
                    'exception' => $e,
                ]);
            }
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
        // First check if session exists in database
        $sessionId = null;
        if ($request->hasSession()) {
            $sessionId = $request->session()->getId();
        }
        
        // Verify session exists in database if using database driver
        if (config('session.driver') === 'database' && $sessionId) {
            $sessionExists = Session::where('id', $sessionId)->exists();
            
            if (!$sessionExists) {
                // Session cookie exists but no session in DB - invalidate and return 401
                if ($request->hasSession()) {
                    try {
                        $request->session()->invalidate();
                    } catch (\Exception $e) {
                        // Ignore errors
                    }
                }
                
                $response = response()->json([
                    'success' => false,
                    'message' => 'Session not found in database',
                ], 401);
                
                // Expire session cookie
                $this->expireSessionCookie($response);
                
                return $response;
            }
        }
        
        $user = $request->user();
        
        // If no user is authenticated, return 401
        // Also check if session exists and is valid
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
            
            // Expire session cookie
            $this->expireSessionCookie($response);
            
            return $response;
        }
        
        $user->load('roles');

        // Get permissions through roles
        $roleIds = $user->roles->pluck('id')->toArray();
        $permissions = empty($roleIds) ? [] : \App\Models\Permission::whereHas('roles', function ($query) use ($roleIds) {
            $query->whereIn('roles.id', $roleIds);
        })->pluck('name')->toArray();

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->roles->pluck('name')->toArray(),
                'permissions' => $permissions,
            ],
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
        $sessionId = null;
        $userId = null;
        
        try {
            // Get session ID before any operations
            if ($request->hasSession()) {
                $sessionId = $request->session()->getId();
            }
            
            $user = $request->user();
            
            if ($user) {
                $userId = $user->id;
                
                // Logout the user (this invalidates the session)
                $this->authService->logout($user);
                
                // Delete sessions from database synchronously
                if (config('session.driver') === 'database') {
                    try {
                        // Delete all sessions for this user
                        $deleted = Session::where('user_id', $userId)->delete();
                        
                        Log::info("Deleted {$deleted} session(s) for user {$userId} during logout");
                        
                        // Also delete by specific session ID if provided (extra safety)
                        if ($sessionId) {
                            Session::where('id', $sessionId)->delete();
                        }
                    } catch (\Exception $e) {
                        Log::error('Failed to delete sessions during logout: ' . $e->getMessage(), [
                            'user_id' => $userId,
                            'session_id' => $sessionId,
                            'exception' => $e,
                        ]);
                    }
                }
            } else {
                // No authenticated user, but still try to delete session if session ID exists
                if ($sessionId && config('session.driver') === 'database') {
                    try {
                        Session::where('id', $sessionId)->delete();
                        Log::info("Deleted session {$sessionId} during logout (no authenticated user)");
                    } catch (\Exception $e) {
                        // Ignore errors for unauthenticated logout
                    }
                }
            }
        } catch (\Exception $e) {
            // Log error but continue to return success response and expire cookie
            Log::error('Logout error: ' . $e->getMessage(), [
                'exception' => $e,
                'trace' => $e->getTraceAsString()
            ]);
        }

        // Always invalidate session if it exists
        if ($request->hasSession()) {
            try {
                $request->session()->invalidate();
            } catch (\Exception $e) {
                // Ignore errors
            }
        }

        // Create response and expire session cookie
        // Always expire cookie even if user wasn't authenticated
        $response = response()->json([
            'success' => true,
            'message' => 'Logout successful',
        ]);
        
        // Add headers to prevent caching
        $response->headers->set('Cache-Control', 'no-cache, no-store, must-revalidate');
        $response->headers->set('Pragma', 'no-cache');
        $response->headers->set('Expires', '0');
        
        // Always expire the session cookie to remove it from browser
        // This works even if the user wasn't authenticated
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
            
            // Expire session cookie if it exists
            return $this->expireSessionCookie($response);
        }

        // Ensure session is started
        if (!$request->hasSession()) {
            $request->session()->start();
        }

        // Verify session exists in database (for database driver)
        if (config('session.driver') === 'database') {
            $sessionId = null;
            if ($request->hasSession()) {
                $sessionId = $request->session()->getId();
            }
            
            // Check if session exists in database
            if ($sessionId) {
                $session = Session::where('id', $sessionId)->first();
                
                if (!$session) {
                    // Session cookie exists but no session in DB - invalidate and return 401
                    if ($request->hasSession()) {
                        try {
                            $request->session()->invalidate();
                        } catch (\Exception $e) {
                            // Ignore errors
                        }
                    }
                    
                    $response = response()->json([
                        'success' => false,
                        'message' => 'Session not found in database',
                    ], 401);
                    
                    // Expire session cookie
                    return $this->expireSessionCookie($response);
                }
                
                // Update session activity
                $session->update([
                    'last_activity' => time(),
                ]);
            }
        }

        // Regenerate session ID for security (prevents session fixation)
        // Only regenerate if we have a valid session
        if ($request->hasSession()) {
            $request->session()->regenerate();
        }

        // For session-based auth, we just return success
        // The session cookie is automatically refreshed
        return response()->json([
            'success' => true,
            'message' => 'Session refreshed',
        ]);
    }
}

