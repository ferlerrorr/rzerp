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
use GuzzleHttp\Client;
use GuzzleHttp\Cookie\CookieJar;
use GuzzleHttp\Exception\GuzzleException;

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
     * Get RZ Auth service HTTP client
     *
     * @return Client
     */
    protected static function rzAuthClient(): Client
    {
        $baseUrl = config('services.rz_auth.url', 'http://localhost:8888');
        
        return new Client([
            'base_uri' => $baseUrl,
            'cookies' => true,
            'headers' => [
                'Accept' => 'application/json',
                'Content-Type' => 'application/json',
            ],
            'timeout' => 30,
            'http_errors' => false,
        ]);
    }

    /**
     * Initialize CSRF token with RZ Auth
     *
     * @return bool
     */
    protected static function initializeRzAuthCSRF(): bool
    {
        try {
            $client = self::rzAuthClient();
            $response = $client->get('/csrf-cookie');
            return $response->getStatusCode() === 200;
        } catch (GuzzleException $e) {
            Log::error('RZ Auth CSRF initialization failed: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Forward request to RZ Auth service
     *
     * @param string $method
     * @param string $endpoint
     * @param array<string, mixed> $data
     * @param array<string, string> $headers
     * @param string|null $sessionCookie
     * @param string|null $xsrfToken
     * @return array<string, mixed>
     */
    public static function forwardRzAuthRequest(
        string $method,
        string $endpoint,
        array $data = [],
        array $headers = [],
        ?string $sessionCookie = null,
        ?string $xsrfToken = null
    ): array {
        try {
            $baseUrl = config('services.rz_auth.url', 'http://localhost:8888');
            $sessionCookieName = config('services.rz_auth.session_cookie', 'rzauth-session');
            
            $cookieJar = new CookieJar();
            if ($sessionCookie) {
                $domain = parse_url($baseUrl, PHP_URL_HOST);
                $cookieJar->setCookie(new \GuzzleHttp\Cookie\SetCookie([
                    'Name' => $sessionCookieName,
                    'Value' => $sessionCookie,
                    'Domain' => $domain,
                    'Path' => '/',
                ]));
            }

            if ($xsrfToken) {
                $headers['X-XSRF-TOKEN'] = $xsrfToken;
            }

            $client = new Client([
                'base_uri' => $baseUrl,
                'cookies' => $cookieJar,
                'headers' => array_merge([
                    'Accept' => 'application/json',
                    'Content-Type' => 'application/json',
                ], $headers),
                'timeout' => 30,
                'http_errors' => false,
            ]);

            $options = [
                'headers' => array_merge([
                    'Accept' => 'application/json',
                    'Content-Type' => 'application/json',
                ], $headers),
            ];

            if (!empty($data)) {
                if (strtoupper($method) === 'GET') {
                    $options['query'] = $data;
                } else {
                    $options['json'] = $data;
                }
            }

            $response = $client->request($method, $endpoint, $options);
            
            $statusCode = $response->getStatusCode();
            $body = json_decode($response->getBody()->getContents(), true);

            // Forward cookies from response
            $cookies = [];
            if ($response->hasHeader('Set-Cookie')) {
                foreach ($response->getHeader('Set-Cookie') as $cookie) {
                    $cookies[] = $cookie;
                }
            }

            return [
                'success' => $statusCode >= 200 && $statusCode < 300,
                'status' => $statusCode,
                'data' => $body ?? [],
                'cookies' => $cookies,
            ];
        } catch (GuzzleException $e) {
            Log::error('RZ Auth request failed: ' . $e->getMessage());
            return [
                'success' => false,
                'status' => 500,
                'data' => [
                    'success' => false,
                    'message' => 'Service unavailable',
                ],
                'cookies' => [],
            ];
        }
    }

    /**
     * Get session cookie from request
     *
     * @param Request $request
     * @return string|null
     */
    public static function getSessionCookie(Request $request): ?string
    {
        $sessionCookieName = config('services.rz_auth.session_cookie', 'rzauth-session');
        return $request->cookie($sessionCookieName)
            ?? $request->cookie('laravel_session')
            ?? $request->cookie('laravel-session');
    }

    /**
     * Get XSRF token from request
     *
     * @param Request $request
     * @return string|null
     */
    public static function getXsrfToken(Request $request): ?string
    {
        return $request->cookie('XSRF-TOKEN') ?? $request->header('X-XSRF-TOKEN');
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
     * Format flat permissions array into nested structure
     *
     * @param array<string> $permissions
     * @return array<string, mixed>
     */
    public static function formatPermissions(array $permissions): array
    {
        $formatted = [
            'user_management' => [
                'roles' => [],
                'users' => [],
            ],
            'hris' => [
                'leaves' => [],
                'payroll' => [],
                'reports' => [],
                'holidays' => [],
                'employees' => [],
                'attendance' => [],
                'reference_data' => [],
                'reimbursements' => [],
            ],
            'settings' => [
                'system' => [],
            ],
        ];

        foreach ($permissions as $permission) {
            // User management - roles
            if (str_starts_with($permission, 'roles.')) {
                $formatted['user_management']['roles'][] = $permission;
            }
            // User management - users
            elseif (str_starts_with($permission, 'users.')) {
                $formatted['user_management']['users'][] = $permission;
            }
            // HRIS - leaves
            elseif (str_starts_with($permission, 'leaves.') || str_starts_with($permission, 'leave-types.')) {
                $formatted['hris']['leaves'][] = $permission;
            }
            // HRIS - payroll
            elseif (str_starts_with($permission, 'payroll.') || 
                    str_starts_with($permission, 'payroll-periods.') ||
                    str_starts_with($permission, 'salary-components.') ||
                    str_starts_with($permission, 'deductions.')) {
                $formatted['hris']['payroll'][] = $permission;
            }
            // HRIS - reports
            elseif (str_starts_with($permission, 'reports.')) {
                $formatted['hris']['reports'][] = $permission;
            }
            // HRIS - holidays
            elseif (str_starts_with($permission, 'holidays.')) {
                $formatted['hris']['holidays'][] = $permission;
            }
            // HRIS - employees
            elseif (str_starts_with($permission, 'employees.')) {
                $formatted['hris']['employees'][] = $permission;
            }
            // HRIS - attendance
            elseif (str_starts_with($permission, 'attendance.')) {
                $formatted['hris']['attendance'][] = $permission;
            }
            // HRIS - reference_data
            elseif (str_starts_with($permission, 'departments.') ||
                    str_starts_with($permission, 'positions.') ||
                    str_starts_with($permission, 'employment-types.')) {
                $formatted['hris']['reference_data'][] = $permission;
            }
            // HRIS - reimbursements
            elseif (str_starts_with($permission, 'reimbursements.')) {
                $formatted['hris']['reimbursements'][] = $permission;
            }
            // Settings
            elseif (str_starts_with($permission, 'settings.')) {
                $formatted['settings']['system'][] = $permission;
            }
        }

        // Remove empty arrays
        foreach ($formatted as $module => $submodules) {
            foreach ($submodules as $submodule => $perms) {
                if (empty($perms)) {
                    unset($formatted[$module][$submodule]);
                }
            }
            if (empty($formatted[$module])) {
                unset($formatted[$module]);
            }
        }

        return $formatted;
    }

    /**
     * Extract flat permissions list from nested structure
     *
     * @param array<string, mixed> $nestedPermissions
     * @return array<string>
     */
    public static function extractFlatPermissions(array $nestedPermissions): array
    {
        $flat = [];
        
        foreach ($nestedPermissions as $module => $submodules) {
            if (is_array($submodules)) {
                foreach ($submodules as $submodule => $permissions) {
                    if (is_array($permissions)) {
                        foreach ($permissions as $permission) {
                            if (is_string($permission)) {
                                $flat[] = $permission;
                            }
                        }
                    }
                }
            }
        }
        
        return array_unique($flat);
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
            'permissions' => self::formatPermissions($permissions),
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
            'email' => ['required', 'string', 'email', 'max:255'], // Email uniqueness validated by RZ Auth
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
            'email' => ['required', 'string', 'email', 'max:255'], // Email uniqueness validated by RZ Auth
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

        // Email uniqueness validated by RZ Auth, not needed locally

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
     * Login user (proxies to RZ Auth)
     *
     * @param array<string, mixed> $credentials
     * @param Request $request
     * @return array<string, mixed>
     */
    public static function login(array $credentials, Request $request): array
    {
        self::initializeRzAuthCSRF();

        $result = self::forwardRzAuthRequest('POST', '/api/auth/login', [
            'email' => $credentials['email'],
            'password' => $credentials['password'],
        ]);

        return [
            'success' => $result['success'],
            'status' => $result['status'] ?? ($result['success'] ? 200 : 401),
            'data' => $result['data'],
            'cookies' => $result['cookies'] ?? [],
        ];
    }

    /**
     * Register new user (proxies to RZ Auth)
     *
     * @param array<string, mixed> $data
     * @param Request $request
     * @return array<string, mixed>
     */
    public static function register(array $data, Request $request): array
    {
        self::initializeRzAuthCSRF();

        $result = self::forwardRzAuthRequest('POST', '/api/auth/register', $data);

        return [
            'success' => $result['success'],
            'status' => $result['status'] ?? ($result['success'] ? 201 : 422),
            'data' => $result['data'],
            'cookies' => $result['cookies'] ?? [],
        ];
    }

    /**
     * Logout user (proxies to RZ Auth)
     *
     * @param Request $request
     * @return array<string, mixed>
     */
    public static function logout(Request $request): array
    {
        $sessionCookie = self::getSessionCookie($request);
        $xsrfToken = self::getXsrfToken($request);

        $result = self::forwardRzAuthRequest(
            'POST',
            '/api/auth/logout',
            [],
            [],
            $sessionCookie ?? '',
            $xsrfToken ?? ''
        );

        return $result['data'] ?? ['success' => false, 'message' => 'Failed to logout'];
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
        $sessionCookie = self::getSessionCookie($request);
        $xsrfToken = self::getXsrfToken($request);
        
        // If no session cookie, can't refresh
        if (!$sessionCookie) {
            return [
                'success' => false,
                'message' => 'No session cookie found',
            ];
        }

        // Validate session with RZ Auth (same as getCurrentUser)
        $userResult = self::getCurrentUser($request);
        
        // If RZ Auth says session is invalid, refresh fails
        if (!isset($userResult['success']) || !$userResult['success']) {
            return [
                'success' => false,
                'message' => $userResult['message'] ?? 'Session invalid',
            ];
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
     * Get list of users with pagination (proxies to RZ Auth)
     *
     * @param array<string, mixed> $filters
     * @param Request $request
     * @return array<string, mixed>
     */
    public static function getUsers(array $filters = [], Request $request): array
    {
        $sessionCookie = self::getSessionCookie($request);
        $xsrfToken = self::getXsrfToken($request);

        if (!$sessionCookie) {
            return [
                'success' => false,
                'message' => 'Not authenticated',
            ];
        }

        $result = self::forwardRzAuthRequest(
            'GET',
            '/api/users',
            $filters,
            [],
            $sessionCookie,
            $xsrfToken
        );

        return $result['data'] ?? [];
    }

    /**
     * Get a single user with roles and permissions (proxies to RZ Auth)
     *
     * @param int $id
     * @param Request $request
     * @return array<string, mixed>
     */
    public static function getUserById(int $id, Request $request): array
    {
        $sessionCookie = self::getSessionCookie($request);
        $xsrfToken = self::getXsrfToken($request);

        if (!$sessionCookie) {
            return [
                'success' => false,
                'message' => 'Not authenticated',
            ];
        }

        $result = self::forwardRzAuthRequest(
            'GET',
            "/api/users/{$id}",
            [],
            [],
            $sessionCookie,
            $xsrfToken
        );

        return $result['data'] ?? ['success' => false, 'message' => 'User not found'];
    }

    /**
     * Create a new user (proxies to RZ Auth)
     *
     * @param array<string, mixed> $data
     * @param Request $request
     * @return array<string, mixed>
     */
    public static function createUser(array $data, Request $request): array
    {
        $sessionCookie = self::getSessionCookie($request);
        $xsrfToken = self::getXsrfToken($request);

        if (!$sessionCookie) {
            return [
                'success' => false,
                'message' => 'Not authenticated',
            ];
        }

        $result = self::forwardRzAuthRequest(
            'POST',
            '/api/users',
            $data,
            [],
            $sessionCookie,
            $xsrfToken
        );

        return $result['data'] ?? ['success' => false, 'message' => 'Failed to create user'];
    }

    /**
     * Update a user (proxies to RZ Auth)
     *
     * @param int $id
     * @param array<string, mixed> $data
     * @param Request $request
     * @return array<string, mixed>
     */
    public static function updateUserById(int $id, array $data, Request $request): array
    {
        $sessionCookie = self::getSessionCookie($request);
        $xsrfToken = self::getXsrfToken($request);

        if (!$sessionCookie) {
            return [
                'success' => false,
                'message' => 'Not authenticated',
            ];
        }

        $result = self::forwardRzAuthRequest(
            'PUT',
            "/api/users/{$id}",
            $data,
            [],
            $sessionCookie,
            $xsrfToken
        );

        return $result['data'] ?? ['success' => false, 'message' => 'Failed to update user'];
    }

    /**
     * Delete a user (proxies to RZ Auth)
     *
     * @param int $id
     * @param Request $request
     * @return array<string, mixed>
     */
    public static function deleteUserById(int $id, Request $request): array
    {
        $sessionCookie = self::getSessionCookie($request);
        $xsrfToken = self::getXsrfToken($request);

        if (!$sessionCookie) {
            return [
                'success' => false,
                'message' => 'Not authenticated',
            ];
        }

        $result = self::forwardRzAuthRequest(
            'DELETE',
            "/api/users/{$id}",
            [],
            [],
            $sessionCookie,
            $xsrfToken
        );

        return $result['data'] ?? ['success' => false, 'message' => 'Failed to delete user'];
    }

    /**
     * Assign roles to a user (proxies to RZ Auth)
     *
     * @param int $userId
     * @param array<int> $roleIds
     * @param Request $request
     * @return array<string, mixed>
     */
    public static function assignRolesToUser(int $userId, array $roleIds, Request $request): array
    {
        $sessionCookie = self::getSessionCookie($request);
        $xsrfToken = self::getXsrfToken($request);

        if (!$sessionCookie) {
            return [
                'success' => false,
                'message' => 'Not authenticated',
            ];
        }

        $result = self::forwardRzAuthRequest(
            'POST',
            "/api/users/{$userId}/roles",
            ['role_ids' => $roleIds],
            [],
            $sessionCookie,
            $xsrfToken
        );

        return $result['data'] ?? ['success' => false, 'message' => 'Failed to assign roles'];
    }

    /**
     * Get roles list (proxies to RZ Auth)
     *
     * @param Request $request
     * @return array<string, mixed>
     */
    public static function getRoles(Request $request): array
    {
        $sessionCookie = self::getSessionCookie($request);
        $xsrfToken = self::getXsrfToken($request);

        if (!$sessionCookie) {
            return [
                'success' => false,
                'message' => 'Not authenticated',
            ];
        }

        $result = self::forwardRzAuthRequest(
            'GET',
            '/api/roles',
            [],
            [],
            $sessionCookie,
            $xsrfToken
        );

        return $result['data'] ?? ['success' => false, 'data' => []];
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
            'email' => ['required', 'email'], // Email existence validated by RZ Auth
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
        // Forward email verification to RZ Auth service
        $result = self::forwardRzAuthRequest('GET', "/api/auth/verify-email/{$userId}/{$hash}");

        return [
            'success' => $result['success'] ?? false,
            'message' => $result['message'] ?? ($result['success'] ? 'Email verified successfully' : 'Failed to verify email'),
            'status' => $result['status'] ?? ($result['success'] ? 200 : 400),
        ];
    }

    /**
     * Send password reset notification (proxies to RZ Auth)
     *
     * @param string $email
     * @return array<string, mixed>
     */
    public static function sendPasswordResetEmail(string $email): array
    {
        $result = self::forwardRzAuthRequest('POST', '/api/auth/forgot-password', [
            'email' => $email,
        ]);

        return $result['data'] ?? ['success' => false, 'message' => 'Failed to send password reset email'];
    }

    /**
     * Reset user password (proxies to RZ Auth)
     *
     * @param string $email
     * @param string $token
     * @param string $password
     * @return array<string, mixed>
     */
    public static function resetPassword(string $email, string $token, string $password): array
    {
        $result = self::forwardRzAuthRequest('POST', '/api/auth/reset-password', [
            'email' => $email,
            'token' => $token,
            'password' => $password,
        ]);

        return $result['data'] ?? ['success' => false, 'message' => 'Failed to reset password'];
    }

    /**
     * Change user password (proxies to RZ Auth)
     *
     * @param Request $request
     * @param string $currentPassword
     * @param string $newPassword
     * @return array<string, mixed>
     */
    public static function changePassword(Request $request, string $currentPassword, string $newPassword): array
    {
        $sessionCookie = self::getSessionCookie($request);
        $xsrfToken = self::getXsrfToken($request);

        if (!$sessionCookie) {
            return [
                'success' => false,
                'message' => 'Not authenticated',
            ];
        }

        $result = self::forwardRzAuthRequest(
            'POST',
            '/api/change-password',
            [
                'current_password' => $currentPassword,
                'password' => $newPassword,
            ],
            [],
            $sessionCookie,
            $xsrfToken ?? ''
        );

        return $result['data'] ?? ['success' => false, 'message' => 'Failed to change password'];
    }

    /**
     * Get current authenticated user (proxies to RZ Auth)
     *
     * @param Request $request
     * @return array<string, mixed>
     */
    public static function getCurrentUser(Request $request): array
    {
        $sessionCookie = self::getSessionCookie($request);
        $xsrfToken = self::getXsrfToken($request);

        if (!$sessionCookie) {
            return [
                'success' => false,
                'message' => 'Not authenticated',
            ];
        }

        $result = self::forwardRzAuthRequest(
            'GET',
            '/api/user',
            [],
            [],
            $sessionCookie,
            $xsrfToken ?? ''
        );

        return $result['data'] ?? ['success' => false, 'message' => 'Not authenticated'];
    }
}

