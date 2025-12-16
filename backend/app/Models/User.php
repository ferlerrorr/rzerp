<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Session as SessionFacade;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

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
     * Get a model instance for the roles table using Eloquent.
     *
     * @return Model
     */
    protected static function roleModel(): Model
    {
        $model = new class extends Model {
            protected $table = 'roles';
            protected $fillable = ['name'];
        };
        
        return $model;
    }

    /**
     * Get a query builder for the roles table using Eloquent.
     *
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public static function roleQuery(): \Illuminate\Database\Eloquent\Builder
    {
        return self::roleModel()->newQuery();
    }

    /**
     * Get a model instance for the permissions table using Eloquent.
     *
     * @return Model
     */
    protected static function permissionModel(): Model
    {
        $model = new class extends Model {
            protected $table = 'permissions';
            protected $fillable = ['name'];
        };
        
        return $model;
    }

    /**
     * Get a query builder for the permissions table using Eloquent.
     *
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public static function permissionQuery(): \Illuminate\Database\Eloquent\Builder
    {
        return self::permissionModel()->newQuery();
    }

    /**
     * Get the roles for the user.
     */
    public function roles(): BelongsToMany
    {
        // Use the role model class for the relationship
        $roleModelClass = get_class(self::roleModel());
        return $this->belongsToMany($roleModelClass, 'user_role', 'user_id', 'role_id');
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

        return self::permissionQuery()
            ->join('role_permission', 'permissions.id', '=', 'role_permission.permission_id')
            ->whereIn('role_permission.role_id', $roleIds)
            ->select('permissions.*')
            ->distinct()
            ->get();
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

        return self::permissionQuery()
            ->where('permissions.name', $permissionName)
            ->join('role_permission', 'permissions.id', '=', 'role_permission.permission_id')
            ->whereIn('role_permission.role_id', $roleIds)
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
        $permissions = empty($roleIds) ? [] : self::permissionQuery()
            ->join('role_permission', 'permissions.id', '=', 'role_permission.permission_id')
            ->whereIn('role_permission.role_id', $roleIds)
            ->distinct()
            ->pluck('permissions.name')
            ->toArray();

        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'roles' => $this->roles->pluck('name')->toArray(),
            'permissions' => $permissions,
        ];
    }

    /**
     * Validate login request data.
     *
     * @param array<string, mixed> $data
     * @return array<string, mixed>
     * @throws HttpResponseException
     */
    public static function validateLogin(array $data): array
    {
        $validator = Validator::make($data, [
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        if ($validator->fails()) {
            throw new HttpResponseException(
                response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()->toArray(),
                ], 422)
            );
        }

        return $validator->validated();
    }

    /**
     * Validate register request data.
     *
     * @param array<string, mixed> $data
     * @return array<string, mixed>
     * @throws HttpResponseException
     */
    public static function validateRegister(array $data): array
    {
        $validator = Validator::make($data, [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        if ($validator->fails()) {
            throw new HttpResponseException(
                response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()->toArray(),
                ], 422)
            );
        }

        return $validator->validated();
    }

    /**
     * Validate store user request data.
     *
     * @param array<string, mixed> $data
     * @return array<string, mixed>
     * @throws HttpResponseException
     */
    public static function validateStore(array $data): array
    {
        $validator = Validator::make($data, [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'min:8'],
            'role_ids' => ['sometimes', 'array'],
            'role_ids.*' => ['exists:roles,id'],
        ]);

        if ($validator->fails()) {
            throw new HttpResponseException(
                response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()->toArray(),
                ], 422)
            );
        }

        return $validator->validated();
    }

    /**
     * Validate update user request data.
     *
     * @param array<string, mixed> $data
     * @param int|null $userId
     * @return array<string, mixed>
     * @throws HttpResponseException
     */
    public static function validateUpdate(array $data, ?int $userId = null): array
    {
        $rules = [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255'],
            'password' => ['sometimes', 'nullable', 'string', 'min:8'],
            'role_ids' => ['sometimes', 'array'],
            'role_ids.*' => ['exists:roles,id'],
        ];

        if ($userId) {
            $rules['email'][] = Rule::unique('users')->ignore($userId);
        } else {
            $rules['email'][] = 'unique:users';
        }

        $validator = Validator::make($data, $rules);

        if ($validator->fails()) {
            throw new HttpResponseException(
                response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()->toArray(),
                ], 422)
            );
        }

        return $validator->validated();
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
     * Get a model instance for the sessions table using Eloquent.
     *
     * @return Model
     */
    protected static function sessionModel(): Model
    {
        $sessionTable = config('session.table', 'sessions');
        $connection = config('session.connection');
        
        $model = new class extends Model {
            protected $table;
            protected $primaryKey = 'id';
            public $incrementing = false;
            protected $keyType = 'string';
            public $timestamps = false;
            protected $fillable = [
                'id',
                'user_id',
                'ip_address',
                'user_agent',
                'payload',
                'last_activity',
            ];
        };
        
        $model->setTable($sessionTable);
        if ($connection) {
            $model->setConnection($connection);
        }
        
        return $model;
    }

    /**
     * Get a query builder for the sessions table using Eloquent.
     *
     * @return \Illuminate\Database\Eloquent\Builder
     */
    protected static function sessionQuery(): \Illuminate\Database\Eloquent\Builder
    {
        return self::sessionModel()->newQuery();
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
                $existingSession = self::sessionQuery()->where('id', $sessionId)->first();
                
                if ($existingSession) {
                    // Session exists - update with user_id and metadata
                    self::sessionQuery()->where('id', $sessionId)->update([
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
                    
                    self::sessionModel()->create([
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
                $verifiedSession = self::sessionQuery()
                    ->where('id', $sessionId)
                    ->where('user_id', $userId)
                    ->first();
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
                $existing = self::sessionQuery()->where('id', $sessionId)->first();
                if ($existing) {
                    self::sessionQuery()->where('id', $sessionId)->update([
                        'user_id' => $userId,
                        'ip_address' => $request->ip(),
                        'user_agent' => $request->userAgent() ?? '',
                        'last_activity' => time(),
                    ]);
                } else {
                    self::sessionModel()->create([
                        'id' => $sessionId,
                        'user_id' => $userId,
                        'ip_address' => $request->ip(),
                        'user_agent' => $request->userAgent() ?? '',
                        'last_activity' => time(),
                        'payload' => '',
                    ]);
                }
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
            $sessionExists = self::sessionQuery()->where('id', $sessionId)->exists();
            
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
                        $deleted = self::sessionQuery()->where('user_id', $userId)->delete();
                        Log::info("Deleted {$deleted} session(s) for user {$userId} during logout");
                        
                        // Also delete by specific session ID if provided (extra safety)
                        if ($sessionId) {
                            self::sessionQuery()->where('id', $sessionId)->delete();
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
                        self::sessionQuery()->where('id', $sessionId)->delete();
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
                $session = self::sessionQuery()->where('id', $sessionId)->first();
                
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
                self::sessionQuery()->where('id', $sessionId)->update([
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

    /**
     * Get list of users with pagination
     *
     * @param array<string, mixed> $filters
     * @return array<string, mixed>
     */
    public static function getUsers(array $filters = []): array
    {
        $query = self::with('roles');

        // Apply filters
        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $perPage = $filters['per_page'] ?? 15;
        $users = $query->paginate($perPage);

        return [
            'users' => $users->items(),
            'pagination' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
            ],
        ];
    }

    /**
     * Get a single user with roles and permissions
     *
     * @param int $id
     * @return array<string, mixed>
     */
    public static function getUserById(int $id): array
    {
        $user = self::with('roles')->find($id);

        if (!$user) {
            return [
                'success' => false,
                'message' => 'User not found',
            ];
        }

        // Get all permissions through roles
        $roleIds = $user->roles->pluck('id')->toArray();
        $permissions = empty($roleIds) ? [] : self::permissionQuery()
            ->join('role_permission', 'permissions.id', '=', 'role_permission.permission_id')
            ->whereIn('role_permission.role_id', $roleIds)
            ->distinct()
            ->pluck('permissions.name')
            ->toArray();

        return [
            'success' => true,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'email_verified_at' => $user->email_verified_at,
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
                'roles' => $user->roles->pluck('name')->toArray(),
                'permissions' => $permissions,
            ],
        ];
    }

    /**
     * Create a new user
     *
     * @param array<string, mixed> $data
     * @return array<string, mixed>
     */
    public static function createUser(array $data): array
    {
        try {
            return self::getConnection()->transaction(function () use ($data) {
                $user = self::create([
                    'name' => $data['name'],
                    'email' => $data['email'],
                    'password' => Hash::make($data['password']),
                ]);

                // Assign roles if provided
                if (isset($data['role_ids']) && is_array($data['role_ids'])) {
                    $user->roles()->sync($data['role_ids']);
                }

                $user->load('roles');
                $roleIds = $user->roles->pluck('id')->toArray();
                $permissions = empty($roleIds) ? [] : self::permissionQuery()
                    ->join('role_permission', 'permissions.id', '=', 'role_permission.permission_id')
                    ->whereIn('role_permission.role_id', $roleIds)
                    ->distinct()
                    ->pluck('permissions.name')
                    ->toArray();

                return [
                    'success' => true,
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'roles' => $user->roles->pluck('name')->toArray(),
                        'permissions' => $permissions,
                    ],
                ];
            });
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to create user: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Update a user
     *
     * @param int $id
     * @param array<string, mixed> $data
     * @return array<string, mixed>
     */
    public static function updateUserById(int $id, array $data): array
    {
        $user = self::find($id);

        if (!$user) {
            return [
                'success' => false,
                'message' => 'User not found',
                'status' => 404,
            ];
        }

        try {
            return $user->getConnection()->transaction(function () use ($user, $data) {
                $updateData = [
                    'name' => $data['name'],
                    'email' => $data['email'],
                ];

                if (isset($data['password']) && !empty($data['password'])) {
                    $updateData['password'] = Hash::make($data['password']);
                }

                $user->update($updateData);

                // Update roles if provided
                if (isset($data['role_ids']) && is_array($data['role_ids'])) {
                    $user->roles()->sync($data['role_ids']);
                }

                $user->load('roles');
                $roleIds = $user->roles->pluck('id')->toArray();
                $permissions = empty($roleIds) ? [] : self::permissionQuery()
                    ->join('role_permission', 'permissions.id', '=', 'role_permission.permission_id')
                    ->whereIn('role_permission.role_id', $roleIds)
                    ->distinct()
                    ->pluck('permissions.name')
                    ->toArray();

                return [
                    'success' => true,
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'roles' => $user->roles->pluck('name')->toArray(),
                        'permissions' => $permissions,
                    ],
                ];
            });
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to update user: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Delete a user
     *
     * @param int $id
     * @return array<string, mixed>
     */
    public static function deleteUserById(int $id): array
    {
        $user = self::find($id);

        if (!$user) {
            return [
                'success' => false,
                'message' => 'User not found',
                'status' => 404,
            ];
        }

        // Prevent deleting super-admin
        if ($user->hasRole('super-admin')) {
            return [
                'success' => false,
                'message' => 'Cannot delete super-admin user',
                'status' => 403,
            ];
        }

        $user->delete();

        return [
            'success' => true,
        ];
    }

    /**
     * Assign roles to a user
     *
     * @param int $userId
     * @param array<int> $roleIds
     * @return array<string, mixed>
     */
    public static function assignRolesToUser(int $userId, array $roleIds): array
    {
        $user = self::find($userId);

        if (!$user) {
            return [
                'success' => false,
                'message' => 'User not found',
            ];
        }

        $user->roles()->sync($roleIds);
        $user->load('roles');

        $roleIds = $user->roles->pluck('id')->toArray();
        $permissions = empty($roleIds) ? [] : self::permissionQuery()
            ->join('role_permission', 'permissions.id', '=', 'role_permission.permission_id')
            ->whereIn('role_permission.role_id', $roleIds)
            ->distinct()
            ->pluck('permissions.name')
            ->toArray();

        return [
            'success' => true,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->roles->pluck('name')->toArray(),
                'permissions' => $permissions,
            ],
        ];
    }

    /**
     * Get a model instance for the password reset tokens table using Eloquent.
     *
     * @return Model
     */
    protected static function passwordResetTokenModel(): Model
    {
        $model = new class extends Model {
            protected $table = 'password_reset_tokens';
            protected $primaryKey = 'email';
            protected $keyType = 'string';
            public $incrementing = false;
            public $timestamps = false;
            protected $fillable = ['email', 'token', 'created_at'];
        };
        
        return $model;
    }

    /**
     * Get a query builder for the password reset tokens table using Eloquent.
     *
     * @return \Illuminate\Database\Eloquent\Builder
     */
    protected static function passwordResetTokenQuery(): \Illuminate\Database\Eloquent\Builder
    {
        return self::passwordResetTokenModel()->newQuery();
    }

    /**
     * Validate email verification request data.
     *
     * @param array<string, mixed> $data
     * @return array<string, mixed>
     * @throws HttpResponseException
     */
    public static function validateEmailVerification(array $data): array
    {
        $validator = Validator::make($data, [
            'token' => ['required', 'string'],
        ]);

        if ($validator->fails()) {
            throw new HttpResponseException(
                response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()->toArray(),
                ], 422)
            );
        }

        return $validator->validated();
    }

    /**
     * Validate forgot password request data.
     *
     * @param array<string, mixed> $data
     * @return array<string, mixed>
     * @throws HttpResponseException
     */
    public static function validateForgotPassword(array $data): array
    {
        $validator = Validator::make($data, [
            'email' => ['required', 'email', 'exists:users,email'],
        ]);

        if ($validator->fails()) {
            throw new HttpResponseException(
                response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()->toArray(),
                ], 422)
            );
        }

        return $validator->validated();
    }

    /**
     * Validate reset password request data.
     *
     * @param array<string, mixed> $data
     * @return array<string, mixed>
     * @throws HttpResponseException
     */
    public static function validateResetPassword(array $data): array
    {
        $validator = Validator::make($data, [
            'email' => ['required', 'email'],
            'token' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        if ($validator->fails()) {
            throw new HttpResponseException(
                response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()->toArray(),
                ], 422)
            );
        }

        return $validator->validated();
    }

    /**
     * Validate change password request data.
     *
     * @param array<string, mixed> $data
     * @return array<string, mixed>
     * @throws HttpResponseException
     */
    public static function validateChangePassword(array $data): array
    {
        $validator = Validator::make($data, [
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        if ($validator->fails()) {
            throw new HttpResponseException(
                response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()->toArray(),
                ], 422)
            );
        }

        return $validator->validated();
    }

    /**
     * Send email verification notification.
     *
     * @param User $user
     * @return array<string, mixed>
     */
    public static function sendEmailVerification(User $user): array
    {
        if ($user->email_verified_at) {
            return [
                'success' => false,
                'message' => 'Email already verified',
            ];
        }

        try {
            // Create a signed URL that expires in 24 hours
            $verificationUrl = URL::temporarySignedRoute(
                'verification.verify',
                now()->addHours(24),
                ['id' => $user->id, 'hash' => sha1($user->email)]
            );

            // Send email using Mail facade
            Mail::raw("Please verify your email by clicking this link: {$verificationUrl}", function ($message) use ($user) {
                $message->to($user->email)
                        ->subject('Verify Your Email Address');
            });

            Log::info("Email verification sent to user {$user->id}");

            return [
                'success' => true,
                'message' => 'Verification email sent successfully',
            ];
        } catch (\Exception $e) {
            Log::error('Failed to send verification email: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Failed to send verification email',
            ];
        }
    }

    /**
     * Verify user email.
     *
     * @param int $userId
     * @param string $hash
     * @return array<string, mixed>
     */
    public static function verifyEmail(int $userId, string $hash): array
    {
        $user = self::find($userId);

        if (!$user) {
            return [
                'success' => false,
                'message' => 'User not found',
            ];
        }

        if ($user->email_verified_at) {
            return [
                'success' => false,
                'message' => 'Email already verified',
            ];
        }

        // Verify hash matches email
        if (sha1($user->email) !== $hash) {
            return [
                'success' => false,
                'message' => 'Invalid verification link',
            ];
        }

        $user->email_verified_at = now();
        $user->save();

        Log::info("Email verified for user {$user->id}");

        return [
            'success' => true,
            'message' => 'Email verified successfully',
        ];
    }

    /**
     * Send password reset notification.
     *
     * @param string $email
     * @return array<string, mixed>
     */
    public static function sendPasswordResetEmail(string $email): array
    {
        $user = self::where('email', $email)->first();

        if (!$user) {
            // Don't reveal if email exists for security
            return [
                'success' => true,
                'message' => 'If the email exists, a password reset link has been sent',
            ];
        }

        try {
            $token = Str::random(64);
            $resetUrl = config('app.url') . '/api/auth/reset-password?token=' . $token . '&email=' . urlencode($email);

            // Store reset token in password_reset_tokens table
            self::passwordResetTokenModel()->updateOrCreate(
                ['email' => $email],
                [
                    'token' => Hash::make($token),
                    'created_at' => now(),
                ]
            );

            // Send email
            Mail::raw("Click this link to reset your password: {$resetUrl}", function ($message) use ($user) {
                $message->to($user->email)
                        ->subject('Reset Your Password');
            });

            Log::info("Password reset email sent to user {$user->id}");

            return [
                'success' => true,
                'message' => 'If the email exists, a password reset link has been sent',
            ];
        } catch (\Exception $e) {
            Log::error('Failed to send password reset email: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Failed to send password reset email',
            ];
        }
    }

    /**
     * Reset user password.
     *
     * @param string $email
     * @param string $token
     * @param string $password
     * @return array<string, mixed>
     */
    public static function resetPassword(string $email, string $token, string $password): array
    {
        $user = self::where('email', $email)->first();

        if (!$user) {
            return [
                'success' => false,
                'message' => 'Invalid reset token',
            ];
        }

        // Get reset token record
        $resetRecord = self::passwordResetTokenQuery()->where('email', $email)->first();

        if (!$resetRecord) {
            return [
                'success' => false,
                'message' => 'Invalid or expired reset token',
            ];
        }

        // Check if token is valid (within 60 minutes)
        $tokenAge = now()->diffInMinutes($resetRecord->created_at);
        if ($tokenAge > 60) {
            $resetRecord->delete();
            return [
                'success' => false,
                'message' => 'Reset token has expired',
            ];
        }

        // Verify token
        if (!Hash::check($token, $resetRecord->token)) {
            return [
                'success' => false,
                'message' => 'Invalid reset token',
            ];
        }

        // Update password
        $user->password = Hash::make($password);
        $user->save();

        // Delete reset token
        $resetRecord->delete();

        Log::info("Password reset successful for user {$user->id}");

        return [
            'success' => true,
            'message' => 'Password reset successfully',
        ];
    }

    /**
     * Change user password.
     *
     * @param User $user
     * @param string $currentPassword
     * @param string $newPassword
     * @return array<string, mixed>
     */
    public static function changePassword(User $user, string $currentPassword, string $newPassword): array
    {
        // Verify current password
        if (!Hash::check($currentPassword, $user->password)) {
            return [
                'success' => false,
                'message' => 'Current password is incorrect',
            ];
        }

        // Update password
        $user->password = Hash::make($newPassword);
        $user->save();

        Log::info("Password changed for user {$user->id}");

        return [
            'success' => true,
            'message' => 'Password changed successfully',
        ];
    }
}
