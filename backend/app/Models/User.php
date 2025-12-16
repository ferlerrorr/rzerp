<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Session as SessionFacade;
use Illuminate\Http\Request;
use App\Models\Session;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Get the roles for the user.
     */
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'user_role');
    }

    /**
     * Get all permissions for the user (through roles).
     * This uses a direct query to get permissions through the role_permission pivot.
     */
    public function getPermissionsAttribute()
    {
        if (!$this->relationLoaded('roles')) {
            $this->load('roles');
        }

        $roleIds = $this->roles->pluck('id')->toArray();

        if (empty($roleIds)) {
            return collect([]);
        }

        return \App\Models\Permission::whereHas('roles', function ($query) use ($roleIds) {
            $query->whereIn('roles.id', $roleIds);
        })->get();
    }

    /**
     * Check if user has a specific role.
     */
    public function hasRole(string $roleName): bool
    {
        return $this->roles()->where('name', $roleName)->exists();
    }

    /**
     * Check if user has a specific permission.
     */
    public function hasPermission(string $permissionName): bool
    {
        // Super admin has all permissions
        if ($this->hasRole('super-admin')) {
            return true;
        }

        $roleIds = $this->roles()->pluck('id')->toArray();

        if (empty($roleIds)) {
            return false;
        }

        return \App\Models\Permission::where('name', $permissionName)
            ->whereHas('roles', function ($query) use ($roleIds) {
                $query->whereIn('roles.id', $roleIds);
            })
            ->exists();
    }

    /**
     * Check if user has any of the given permissions.
     */
    public function hasAnyPermission(array $permissionNames): bool
    {
        // Super admin has all permissions
        if ($this->hasRole('super-admin')) {
            return true;
        }

        return $this->permissions()->whereIn('name', $permissionNames)->exists();
    }

    /**
     * Get formatted user data with roles and permissions.
     *
     * @return array<string, mixed>
     */
    public function toAuthArray(): array
    {
        $this->load('roles');
        $roleIds = $this->roles->pluck('id')->toArray();
        $permissions = empty($roleIds) ? [] : \App\Models\Permission::whereHas('roles', function ($query) use ($roleIds) {
            $query->whereIn('roles.id', $roleIds);
        })->pluck('name')->toArray();

        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'roles' => $this->roles->pluck('name')->toArray(),
            'permissions' => $permissions,
        ];
    }

    /**
     * Login user
     *
     * @param array<string, mixed> $credentials
     * @param Request $request
     * @return array<string, mixed>
     */
    public static function login(array $credentials, Request $request): array
    {
        $user = self::where('email', $credentials['email'])->first();

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            return [
                'success' => false,
                'message' => 'Invalid credentials',
            ];
        }

        Auth::login($user);

        // Handle session setup
        self::handleLoginSession($request, $user->id);

        return [
            'success' => true,
            'user' => $user->toAuthArray(),
        ];
    }

    /**
     * Register new user
     *
     * @param array<string, mixed> $data
     * @param Request $request
     * @return array<string, mixed>
     */
    public static function register(array $data, Request $request): array
    {
        $user = self::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
        ]);

        Auth::login($user);

        // Handle session setup
        self::handleRegisterSession($request, $user->id);

        return [
            'success' => true,
            'user' => $user->toAuthArray(),
        ];
    }

    /**
     * Logout user
     *
     * @param User $user
     * @return void
     */
    public static function logout(User $user): void
    {
        Auth::logout();
    }

    /**
     * Handle session setup after login
     *
     * @param Request $request
     * @param int $userId
     * @return void
     */
    public static function handleLoginSession(Request $request, int $userId): void
    {
        // Ensure session is started
        if (!$request->hasSession()) {
            $request->session()->start();
        }

        // Regenerate session ID for security (prevents session fixation)
        $request->session()->regenerate();
        
        // Force session to be saved by marking it as dirty
        $request->session()->put('_last_activity', time());
        
        // Get session ID before saving
        $sessionId = $request->session()->getId();
        
        // Explicitly save the session to ensure it's persisted to the database
        SessionFacade::save();
        
        // Directly ensure session is written to database with user_id
        if (config('session.driver') === 'database') {
            try {
                // Wait a moment for the session middleware to write the payload
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
    }

    /**
     * Handle session setup after registration
     *
     * @param Request $request
     * @param int $userId
     * @return void
     */
    public static function handleRegisterSession(Request $request, int $userId): void
    {
        // Ensure session is started
        if (!$request->hasSession()) {
            $request->session()->start();
        }

        // Regenerate session ID for security
        $request->session()->regenerate();
        
        // Force session to be saved
        $request->session()->put('_last_activity', time());
        
        // Explicitly save the session
        SessionFacade::save();
        
        // Directly ensure session is written to database with user_id
        if (config('session.driver') === 'database') {
            try {
                $sessionId = $request->session()->getId();
                
                // Update or insert session with user_id
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
    }

    /**
     * Validate session exists in database
     *
     * @param Request $request
     * @return array<string, mixed> Returns ['valid' => bool, 'session_id' => string|null]
     */
    public static function validateSession(Request $request): array
    {
        $sessionId = null;
        if ($request->hasSession()) {
            $sessionId = $request->session()->getId();
        }
        
        // Verify session exists in database if using database driver
        if (config('session.driver') === 'database' && $sessionId) {
            $sessionExists = Session::where('id', $sessionId)->exists();
            
            if (!$sessionExists) {
                // Session cookie exists but no session in DB - invalidate
                if ($request->hasSession()) {
                    try {
                        $request->session()->invalidate();
                    } catch (\Exception $e) {
                        // Ignore errors
                    }
                }
                
                return [
                    'valid' => false,
                    'session_id' => $sessionId,
                    'message' => 'Session not found in database',
                ];
            }
        }
        
        return [
            'valid' => true,
            'session_id' => $sessionId,
        ];
    }

    /**
     * Handle logout session deletion
     *
     * @param Request $request
     * @param int|null $userId
     * @return void
     */
    public static function handleLogoutSession(Request $request, ?int $userId = null): void
    {
        $sessionId = null;
        
        try {
            // Get session ID before any operations
            if ($request->hasSession()) {
                $sessionId = $request->session()->getId();
            }
            
            if ($userId) {
                // Delete all sessions for this user
                if (config('session.driver') === 'database') {
                    try {
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
    }

    /**
     * Refresh session
     *
     * @param Request $request
     * @return array<string, mixed> Returns ['success' => bool, 'message' => string]
     */
    public static function refreshSession(Request $request): array
    {
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
                    // Session cookie exists but no session in DB - invalidate
                    if ($request->hasSession()) {
                        try {
                            $request->session()->invalidate();
                        } catch (\Exception $e) {
                            // Ignore errors
                        }
                    }
                    
                    return [
                        'success' => false,
                        'message' => 'Session not found in database',
                    ];
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

        return [
            'success' => true,
            'message' => 'Session refreshed',
        ];
    }
}
