<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\HrisController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\RoleController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| All API routes return JSON only (no HTML, no views)
|
*/

// Public routes
Route::get('/health', [HealthController::class, 'index']);

// CSRF cookie endpoint (for session-based auth)
Route::get('/csrf-cookie', function () {
    return response()->json(['success' => true, 'message' => 'CSRF cookie set']);
});

// Authentication routes
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
    Route::get('/me', [AuthController::class, 'me'])->middleware('auth:sanctum');
    // Refresh doesn't require auth - it works with session cookie
    Route::post('/refresh', [AuthController::class, 'refresh']);
});

// User endpoint (matches frontend expectation)
Route::get('/user', [AuthController::class, 'me'])->middleware('auth:sanctum');

// Protected routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {
    // HRIS routes with permission checks
    Route::prefix('hris')->group(function () {
        Route::get('/', [HrisController::class, 'index'])->middleware('permission:hris.view');
        Route::get('/employees', [HrisController::class, 'employees'])->middleware('permission:hris.view');
    });

    // Roles endpoint (for user management)
    Route::get('/roles', [RoleController::class, 'index'])->middleware('permission:users.view');

    // User management routes with permission checks
    Route::prefix('users')->group(function () {
        Route::get('/', [UserController::class, 'index'])->middleware('permission:users.view');
        Route::post('/', [UserController::class, 'store'])->middleware('permission:users.create');
        Route::get('/{id}', [UserController::class, 'show'])->middleware('permission:users.view');
        Route::put('/{id}', [UserController::class, 'update'])->middleware('permission:users.update');
        Route::delete('/{id}', [UserController::class, 'destroy'])->middleware('permission:users.delete');
        Route::post('/{id}/roles', [UserController::class, 'assignRoles'])->middleware('permission:users.update');
    });
    
    // Add your other protected routes here
});

