<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    /**
     * List users
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $filters = [
            'search' => $request->query('search'),
            'per_page' => $request->query('per_page', 15),
        ];

        $result = User::getUsers($filters, $request);

        if (isset($result['success']) && !$result['success']) {
            return response()->json($result, 401);
        }

        return response()->json($result);
    }

    /**
     * Get a single user
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $result = User::getUserById($id, $request);

        if (isset($result['success']) && !$result['success']) {
            $statusCode = $result['status'] ?? 404;
            return response()->json($result, $statusCode);
        }

        return response()->json($result);
    }

    /**
     * Create a user
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $data = User::validateStore($request->all());
        } catch (\Illuminate\Http\Exceptions\HttpResponseException $e) {
            return $e->getResponse();
        }

        $result = User::createUser($data, $request);

        if (isset($result['success']) && !$result['success']) {
            return response()->json($result, 422);
        }

        return response()->json($result, 201);
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
        try {
            $data = User::validateUpdate($request->all(), $id);
        } catch (\Illuminate\Http\Exceptions\HttpResponseException $e) {
            return $e->getResponse();
        }

        $result = User::updateUserById($id, $data, $request);

        if (isset($result['success']) && !$result['success']) {
            $statusCode = $result['status'] ?? 400;
            return response()->json($result, $statusCode);
        }

        return response()->json($result);
    }

    /**
     * Delete a user
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $result = User::deleteUserById($id, $request);

        if (isset($result['success']) && !$result['success']) {
            $statusCode = $result['status'] ?? 404;
            return response()->json($result, $statusCode);
        }

        return response()->json($result);
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

        $result = User::assignRolesToUser($id, $request->role_ids, $request);

        if (isset($result['success']) && !$result['success']) {
            return response()->json($result, 404);
        }

        return response()->json($result);
    }

    /**
     * Get roles list
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function roles(Request $request): JsonResponse
    {
        $result = User::getRoles($request);

        if (isset($result['success']) && !$result['success']) {
            return response()->json($result, 401);
        }

        return response()->json($result);
    }

    /**
     * Get current authenticated user
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Not authenticated',
            ], 401);
        }

        // User data comes from RZ Auth service via middleware (anonymous object)
        // No need to check for User model instance since users table doesn't exist
        return response()->json([
            'success' => true,
            'data' => [
                'id' => $user->id ?? 0,
                'name' => $user->name ?? '',
                'email' => $user->email ?? '',
                'roles' => is_array($user->roles ?? null) ? $user->roles : [],
                'permissions' => is_array($user->permissions ?? null) ? $user->permissions : [],
            ],
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
        try {
            $credentials = User::validateLogin($request->all());
        } catch (\Illuminate\Http\Exceptions\HttpResponseException $e) {
            return $e->getResponse();
        }

        $result = User::login($credentials, $request);
        $statusCode = $result['status'] ?? ($result['success'] ? 200 : 401);
        $response = response()->json($result['data'], $statusCode);

        // Forward cookies from RZ Auth response
        if (isset($result['cookies']) && is_array($result['cookies'])) {
            foreach ($result['cookies'] as $cookie) {
                $cookieParts = explode(';', $cookie);
                if (!empty($cookieParts)) {
                    $nameValue = explode('=', trim($cookieParts[0]), 2);
                    if (count($nameValue) === 2) {
                        $cookieName = trim($nameValue[0]);
                        $cookieValue = trim($nameValue[1]);
                        
                        $domain = null;
                        $path = '/';
                        $secure = false;
                        $httpOnly = true;
                        $sameSite = 'lax';
                        $maxAge = null;

                        foreach (array_slice($cookieParts, 1) as $part) {
                            $part = trim(strtolower($part));
                            if (str_starts_with($part, 'domain=')) {
                                $domain = trim(substr($part, 7));
                            } elseif (str_starts_with($part, 'path=')) {
                                $path = trim(substr($part, 5));
                            } elseif ($part === 'secure') {
                                $secure = true;
                            } elseif ($part === 'httponly') {
                                $httpOnly = true;
                            } elseif (str_starts_with($part, 'samesite=')) {
                                $sameSite = trim(substr($part, 9));
                            } elseif (str_starts_with($part, 'max-age=')) {
                                $maxAge = (int) trim(substr($part, 8));
                            }
                        }

                        $response->cookie(
                            $cookieName,
                            $cookieValue,
                            $maxAge ? $maxAge / 60 : 120,
                            $path,
                            $domain,
                            $secure,
                            $httpOnly,
                            false,
                            $sameSite
                        );
                    }
                }
            }
        }

        return $response;
    }

    /**
     * Register user
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function register(Request $request): JsonResponse
    {
        try {
            $data = User::validateRegister($request->all());
        } catch (\Illuminate\Http\Exceptions\HttpResponseException $e) {
            return $e->getResponse();
        }

        $result = User::register($data, $request);
        $statusCode = $result['status'] ?? ($result['success'] ? 201 : 422);
        $response = response()->json($result['data'], $statusCode);

        // Forward cookies from RZ Auth response
        if (isset($result['cookies']) && is_array($result['cookies'])) {
            foreach ($result['cookies'] as $cookie) {
                $cookieParts = explode(';', $cookie);
                if (!empty($cookieParts)) {
                    $nameValue = explode('=', trim($cookieParts[0]), 2);
                    if (count($nameValue) === 2) {
                        $cookieName = trim($nameValue[0]);
                        $cookieValue = trim($nameValue[1]);
                        
                        $domain = null;
                        $path = '/';
                        $secure = false;
                        $httpOnly = true;
                        $sameSite = 'lax';
                        $maxAge = null;

                        foreach (array_slice($cookieParts, 1) as $part) {
                            $part = trim(strtolower($part));
                            if (str_starts_with($part, 'domain=')) {
                                $domain = trim(substr($part, 7));
                            } elseif (str_starts_with($part, 'path=')) {
                                $path = trim(substr($part, 5));
                            } elseif ($part === 'secure') {
                                $secure = true;
                            } elseif ($part === 'httponly') {
                                $httpOnly = true;
                            } elseif (str_starts_with($part, 'samesite=')) {
                                $sameSite = trim(substr($part, 9));
                            } elseif (str_starts_with($part, 'max-age=')) {
                                $maxAge = (int) trim(substr($part, 8));
                            }
                        }

                        $response->cookie(
                            $cookieName,
                            $cookieValue,
                            $maxAge ? $maxAge / 60 : 120,
                            $path,
                            $domain,
                            $secure,
                            $httpOnly,
                            false,
                            $sameSite
                        );
                    }
                }
            }
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
        $result = User::logout($request);
        $statusCode = $result['status'] ?? ($result['success'] ? 200 : 401);
        $response = response()->json($result, $statusCode);

        // Expire session cookies
        $cookieName = config('session.cookie', 'laravel_session');
        $path = config('session.path', '/');
        $domain = config('session.domain') ?: null;

        if ($domain) {
            $response->cookie($cookieName, '', -2628000, $path, $domain, false, true, false, 'lax');
        }
        $response->cookie($cookieName, '', -2628000, $path, null, false, true, false, 'lax');

        return $response;
    }

    /**
     * Refresh session
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function refresh(Request $request): JsonResponse
    {
        $result = User::refreshSession($request);

        if (!$result['success']) {
            return response()->json($result, 401);
        }

        return response()->json($result);
    }

    /**
     * Verify email
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function verifyEmail(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'hash' => 'required|string',
            'signature' => 'required|string',
        ]);

        // Verify the signed URL
        if (!$request->hasValidSignature()) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid verification link',
            ], 400);
        }

        $hash = $request->query('hash');
        $result = User::verifyEmail($id, $hash);

        if (!$result['success']) {
            return response()->json($result, 400);
        }

        return response()->json($result);
    }

    /**
     * Resend verification email
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function resendVerificationEmail(Request $request): JsonResponse
    {
        $sessionCookie = User::getSessionCookie($request);
        $xsrfToken = User::getXsrfToken($request);

        if (!$sessionCookie) {
            return response()->json([
                'success' => false,
                'message' => 'Not authenticated',
            ], 401);
        }

        $result = User::forwardRzAuthRequest(
            'POST',
            '/api/resend-verification-email',
            [],
            [],
            $sessionCookie,
            $xsrfToken ?? ''
        );

        $statusCode = $result['status'] ?? ($result['success'] ? 200 : 401);
        return response()->json($result['data'], $statusCode);
    }

    /**
     * Forgot password
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        try {
            $data = User::validateForgotPassword($request->all());
        } catch (\Illuminate\Http\Exceptions\HttpResponseException $e) {
            return $e->getResponse();
        }

        $result = User::sendPasswordResetEmail($data['email']);

        return response()->json($result);
    }

    /**
     * Reset password
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function resetPassword(Request $request): JsonResponse
    {
        try {
            $data = User::validateResetPassword($request->all());
        } catch (\Illuminate\Http\Exceptions\HttpResponseException $e) {
            return $e->getResponse();
        }

        $result = User::resetPassword(
            $data['email'],
            $data['token'],
            $data['password']
        );

        if (!$result['success']) {
            return response()->json($result, 400);
        }

        return response()->json($result);
    }

    /**
     * Change password
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function changePassword(Request $request): JsonResponse
    {
        try {
            $data = User::validateChangePassword($request->all());
        } catch (\Illuminate\Http\Exceptions\HttpResponseException $e) {
            return $e->getResponse();
        }

        $result = User::changePassword(
            $request,
            $data['current_password'],
            $data['password']
        );

        if (isset($result['success']) && !$result['success']) {
            return response()->json($result, 400);
        }

        return response()->json($result);
    }
}
