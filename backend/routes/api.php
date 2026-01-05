<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\HrisController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\EmployeeController;
use App\Http\Controllers\Api\DepartmentController;
use App\Http\Controllers\Api\PositionController;
use App\Http\Controllers\Api\AccountController;
use App\Http\Controllers\Api\JournalEntryController;
use App\Http\Controllers\Api\BudgetController;
use App\Http\Controllers\Api\InvoiceController;
use App\Http\Controllers\Api\VendorController;
use App\Http\Controllers\Api\ReceivableInvoiceController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\PurchaseOrderController;
use App\Http\Controllers\Api\EmploymentTypeController;
use App\Http\Controllers\Api\HolidayController;
use App\Http\Controllers\Api\LeaveTypeController;
use App\Http\Controllers\Api\LeaveRequestController;
use App\Http\Controllers\Api\LeaveBalanceController;
use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\PayrollPeriodController;
use App\Http\Controllers\Api\PayrollRunController;
use App\Http\Controllers\Api\PayrollEntryController;
use App\Http\Controllers\Api\SalaryComponentController;
use App\Http\Controllers\Api\DeductionController;
use App\Http\Controllers\Api\SettingController;
use App\Http\Controllers\Api\NotificationController;
use App\Models\User;
use Illuminate\Http\Request;
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

// CSRF cookie endpoint (proxies to RZ Auth)
Route::get('/csrf-cookie', function (Request $request) {
    $result = User::forwardRzAuthRequest('GET', '/csrf-cookie');
    
    $statusCode = $result['status'] ?? ($result['success'] ? 200 : 500);
    $response = response()->json($result['data'] ?? ['success' => $result['success']], $statusCode);
    
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
                    $maxAge = 120; // Default 2 hours

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
                            $maxAge = (int) trim(substr($part, 8)) / 60; // Convert to minutes
                        }
                    }

                    $response->cookie(
                        $cookieName,
                        $cookieValue,
                        $maxAge,
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
});

// Authentication routes
Route::prefix('auth')->group(function () {
    Route::post('/login', [UserController::class, 'login']);
    Route::post('/register', [UserController::class, 'register']);
    // Logout doesn't require auth - it should work even if session is invalid
    // This allows cleanup of stale cookies
    Route::post('/logout', [UserController::class, 'logout']);
    // Refresh doesn't require auth - it works with session cookie
    Route::post('/refresh', [UserController::class, 'refresh']);
    // Email verification routes
    Route::get('/verify-email/{id}', [UserController::class, 'verifyEmail'])->name('verification.verify');
    Route::post('/forgot-password', [UserController::class, 'forgotPassword']);
    Route::post('/reset-password', [UserController::class, 'resetPassword']);
});

// User endpoint (matches frontend expectation)

// Protected routes (require authentication)
Route::middleware('rz.auth')->group(function () {
    Route::get('/user', [UserController::class, 'me']);
    Route::get('/users', [UserController::class, 'index'])->middleware('permission:users.view');
    Route::post('/users', [UserController::class, 'store'])->middleware('permission:users.create');
    Route::get('/users/{id}', [UserController::class, 'show'])->middleware('permission:users.view');
    Route::put('/users/{id}', [UserController::class, 'update'])->middleware('permission:users.update');
    Route::delete('/users/{id}', [UserController::class, 'destroy'])->middleware('permission:users.delete');
    Route::post('/users/{id}/roles', [UserController::class, 'assignRoles'])->middleware('permission:users.update');
    Route::get('/roles', [UserController::class, 'roles'])->middleware('permission:users.view');
    
    // Email verification and password management
    Route::post('/resend-verification-email', [UserController::class, 'resendVerificationEmail']);
    Route::post('/change-password', [UserController::class, 'changePassword']);
    
    // HRIS routes with permission checks
    Route::prefix('hris')->group(function () {
        Route::get('/', [HrisController::class, 'index'])->middleware('permission:hris.view');
        Route::get('/employees', [HrisController::class, 'employees'])->middleware('permission:hris.view');
    });

    // Employee management routes with permission checks
    Route::prefix('employees')->group(function () {
        Route::get('/', [EmployeeController::class, 'index'])->middleware('permission:hris.view');
        Route::post('/', [EmployeeController::class, 'store'])->middleware('permission:hris.create');
        Route::get('/{id}', [EmployeeController::class, 'show'])->middleware('permission:hris.view');
        Route::put('/{id}', [EmployeeController::class, 'update'])->middleware('permission:hris.update');
        Route::delete('/{id}', [EmployeeController::class, 'destroy'])->middleware('permission:hris.delete');
    });

    // Department management routes with permission checks
    Route::prefix('departments')->group(function () {
        Route::get('/', [DepartmentController::class, 'index'])->middleware('permission:hris.view');
        Route::post('/', [DepartmentController::class, 'store'])->middleware('permission:hris.create');
        Route::get('/{id}', [DepartmentController::class, 'show'])->middleware('permission:hris.view');
        Route::put('/{id}', [DepartmentController::class, 'update'])->middleware('permission:hris.update');
        Route::delete('/{id}', [DepartmentController::class, 'destroy'])->middleware('permission:hris.delete');
    });

    // Position management routes with permission checks
    Route::prefix('positions')->group(function () {
        Route::get('/', [PositionController::class, 'index'])->middleware('permission:hris.view');
        Route::post('/', [PositionController::class, 'store'])->middleware('permission:hris.create');
        Route::get('/{id}', [PositionController::class, 'show'])->middleware('permission:hris.view');
        Route::put('/{id}', [PositionController::class, 'update'])->middleware('permission:hris.update');
        Route::delete('/{id}', [PositionController::class, 'destroy'])->middleware('permission:hris.delete');
    });

    // Employment Type management routes
    Route::prefix('employment-types')->group(function () {
        Route::get('/', [EmploymentTypeController::class, 'index'])->middleware('permission:hris.view');
        Route::post('/', [EmploymentTypeController::class, 'store'])->middleware('permission:hris.create');
        Route::get('/{id}', [EmploymentTypeController::class, 'show'])->middleware('permission:hris.view');
        Route::put('/{id}', [EmploymentTypeController::class, 'update'])->middleware('permission:hris.update');
        Route::delete('/{id}', [EmploymentTypeController::class, 'destroy'])->middleware('permission:hris.delete');
    });

    // Holiday management routes
    Route::prefix('holidays')->group(function () {
        Route::get('/', [HolidayController::class, 'index'])->middleware('permission:hris.view');
        Route::post('/', [HolidayController::class, 'store'])->middleware('permission:hris.create');
        Route::get('/{id}', [HolidayController::class, 'show'])->middleware('permission:hris.view');
        Route::put('/{id}', [HolidayController::class, 'update'])->middleware('permission:hris.update');
        Route::delete('/{id}', [HolidayController::class, 'destroy'])->middleware('permission:hris.delete');
    });

    // Leave Type management routes
    Route::prefix('leave-types')->group(function () {
        Route::get('/', [LeaveTypeController::class, 'index'])->middleware('permission:hris.view');
        Route::post('/', [LeaveTypeController::class, 'store'])->middleware('permission:hris.create');
        Route::get('/{id}', [LeaveTypeController::class, 'show'])->middleware('permission:hris.view');
        Route::put('/{id}', [LeaveTypeController::class, 'update'])->middleware('permission:hris.update');
        Route::delete('/{id}', [LeaveTypeController::class, 'destroy'])->middleware('permission:hris.delete');
    });

    // Leave Request management routes
    Route::prefix('leave-requests')->group(function () {
        Route::get('/', [LeaveRequestController::class, 'index'])->middleware('permission:hris.view');
        Route::post('/', [LeaveRequestController::class, 'store'])->middleware('permission:hris.create');
        Route::post('/{id}/approve', [LeaveRequestController::class, 'approve'])->middleware('permission:hris.approve');
        Route::post('/{id}/reject', [LeaveRequestController::class, 'reject'])->middleware('permission:hris.reject');
    });

    // Leave Balance routes
    Route::prefix('leave-balances')->group(function () {
        Route::get('/', [LeaveBalanceController::class, 'index'])->middleware('permission:hris.view');
    });

    // Attendance management routes
    Route::prefix('attendances')->group(function () {
        Route::get('/', [AttendanceController::class, 'index'])->middleware('permission:hris.view');
        Route::post('/time-in', [AttendanceController::class, 'timeIn'])->middleware('permission:hris.create');
        Route::post('/{id}/time-out', [AttendanceController::class, 'timeOut'])->middleware('permission:hris.update');
    });

    // Payroll Period management routes
    Route::prefix('payroll-periods')->group(function () {
        Route::get('/', [PayrollPeriodController::class, 'index'])->middleware('permission:payroll.view');
        Route::post('/', [PayrollPeriodController::class, 'store'])->middleware('permission:payroll.create');
    });

    // Payroll Run management routes
    Route::prefix('payroll-runs')->group(function () {
        Route::get('/', [PayrollRunController::class, 'index'])->middleware('permission:payroll.view');
        Route::post('/', [PayrollRunController::class, 'store'])->middleware('permission:payroll.create');
        Route::post('/{id}/process', [PayrollRunController::class, 'process'])->middleware('permission:payroll.process');
        Route::post('/{id}/approve', [PayrollRunController::class, 'approve'])->middleware('permission:payroll.approve');
        Route::get('/{id}/entries', [PayrollRunController::class, 'entries'])->middleware('permission:payroll.view');
    });

    // Payroll Entry routes
    Route::prefix('payroll-entries')->group(function () {
        Route::get('/', [PayrollEntryController::class, 'index'])->middleware('permission:payroll.view');
    });

    // Salary Component management routes
    Route::prefix('salary-components')->group(function () {
        Route::get('/', [SalaryComponentController::class, 'index'])->middleware('permission:payroll.view');
        Route::post('/', [SalaryComponentController::class, 'store'])->middleware('permission:payroll.create');
        Route::put('/{id}', [SalaryComponentController::class, 'update'])->middleware('permission:payroll.update');
        Route::delete('/{id}', [SalaryComponentController::class, 'destroy'])->middleware('permission:payroll.delete');
    });

    // Deduction management routes
    Route::prefix('deductions')->group(function () {
        Route::get('/', [DeductionController::class, 'index'])->middleware('permission:payroll.view');
        Route::post('/', [DeductionController::class, 'store'])->middleware('permission:payroll.create');
        Route::put('/{id}', [DeductionController::class, 'update'])->middleware('permission:payroll.update');
        Route::delete('/{id}', [DeductionController::class, 'destroy'])->middleware('permission:payroll.delete');
    });

    // Settings management routes
    Route::prefix('settings')->group(function () {
        Route::get('/', [SettingController::class, 'index'])->middleware('permission:settings.view');
        Route::get('/{key}', [SettingController::class, 'show'])->middleware('permission:settings.view');
        Route::post('/', [SettingController::class, 'store'])->middleware('permission:settings.update');
        Route::put('/{key}', [SettingController::class, 'update'])->middleware('permission:settings.update');
        Route::delete('/{key}', [SettingController::class, 'destroy'])->middleware('permission:settings.update');
    });

    // Notification routes
    Route::prefix('notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'index'])->middleware('permission:notifications.view');
        Route::get('/unread-count', [NotificationController::class, 'unreadCount'])->middleware('permission:notifications.view');
        Route::post('/{id}/mark-as-read', [NotificationController::class, 'markAsRead'])->middleware('permission:notifications.update');
        Route::post('/mark-all-as-read', [NotificationController::class, 'markAllAsRead'])->middleware('permission:notifications.update');
        Route::delete('/{id}', [NotificationController::class, 'destroy'])->middleware('permission:notifications.delete');
    });

    // Account management routes with permission checks
    Route::prefix('accounts')->group(function () {
        Route::get('/', [AccountController::class, 'index'])->middleware('permission:finance.view');
        Route::post('/', [AccountController::class, 'store'])->middleware('permission:finance.create');
        Route::get('/{id}', [AccountController::class, 'show'])->middleware('permission:finance.view');
        Route::put('/{id}', [AccountController::class, 'update'])->middleware('permission:finance.update');
        Route::delete('/{id}', [AccountController::class, 'destroy'])->middleware('permission:finance.delete');
    });

    // Journal Entry management routes with permission checks
    Route::prefix('journal-entries')->group(function () {
        Route::get('/', [JournalEntryController::class, 'index'])->middleware('permission:finance.view');
        Route::post('/', [JournalEntryController::class, 'store'])->middleware('permission:finance.create');
        Route::get('/{id}', [JournalEntryController::class, 'show'])->middleware('permission:finance.view');
        Route::put('/{id}', [JournalEntryController::class, 'update'])->middleware('permission:finance.update');
        Route::delete('/{id}', [JournalEntryController::class, 'destroy'])->middleware('permission:finance.delete');
        Route::post('/{id}/post', [JournalEntryController::class, 'post'])->middleware('permission:finance.update');
    });

    // Budget management routes with permission checks
    Route::prefix('budgets')->group(function () {
        Route::get('/', [BudgetController::class, 'index'])->middleware('permission:finance.view');
        Route::post('/', [BudgetController::class, 'store'])->middleware('permission:finance.create');
        Route::get('/{id}', [BudgetController::class, 'show'])->middleware('permission:finance.view');
        Route::put('/{id}', [BudgetController::class, 'update'])->middleware('permission:finance.update');
        Route::delete('/{id}', [BudgetController::class, 'destroy'])->middleware('permission:finance.delete');
    });

    // Invoice management routes with permission checks
    Route::prefix('invoices')->group(function () {
        Route::get('/', [InvoiceController::class, 'index'])->middleware('permission:finance.view');
        Route::post('/', [InvoiceController::class, 'store'])->middleware('permission:finance.create');
        Route::get('/{id}', [InvoiceController::class, 'show'])->middleware('permission:finance.view');
        Route::put('/{id}', [InvoiceController::class, 'update'])->middleware('permission:finance.update');
        Route::delete('/{id}', [InvoiceController::class, 'destroy'])->middleware('permission:finance.delete');
        Route::post('/{id}/approve', [InvoiceController::class, 'approve'])->middleware('permission:finance.update');
        Route::post('/{id}/pay', [InvoiceController::class, 'pay'])->middleware('permission:finance.update');
    });

    // Vendor management routes with permission checks
    Route::prefix('vendors')->group(function () {
        Route::get('/', [VendorController::class, 'index'])->middleware('permission:finance.view');
        Route::post('/', [VendorController::class, 'store'])->middleware('permission:finance.create');
        Route::get('/{id}', [VendorController::class, 'show'])->middleware('permission:finance.view');
        Route::put('/{id}', [VendorController::class, 'update'])->middleware('permission:finance.update');
        Route::delete('/{id}', [VendorController::class, 'destroy'])->middleware('permission:finance.delete');
    });

    // Customer management routes with permission checks
    Route::prefix('customers')->group(function () {
        Route::get('/', [CustomerController::class, 'index'])->middleware('permission:finance.view');
        Route::get('/{id}', [CustomerController::class, 'show'])->middleware('permission:finance.view');
    });

    // Receivable Invoice management routes with permission checks
    Route::prefix('receivable-invoices')->group(function () {
        Route::get('/', [ReceivableInvoiceController::class, 'index'])->middleware('permission:finance.view');
        Route::post('/', [ReceivableInvoiceController::class, 'store'])->middleware('permission:finance.create');
        Route::get('/{id}', [ReceivableInvoiceController::class, 'show'])->middleware('permission:finance.view');
        Route::put('/{id}', [ReceivableInvoiceController::class, 'update'])->middleware('permission:finance.update');
        Route::delete('/{id}', [ReceivableInvoiceController::class, 'destroy'])->middleware('permission:finance.delete');
    });

    // Payment management routes with permission checks
    Route::prefix('payments')->group(function () {
        Route::post('/', [PaymentController::class, 'store'])->middleware('permission:finance.create');
        Route::get('/invoice/{invoiceId}', [PaymentController::class, 'getByInvoice'])->middleware('permission:finance.view');
    });

    // Purchase Order management routes with permission checks
    Route::prefix('purchase-orders')->group(function () {
        Route::get('/', [PurchaseOrderController::class, 'index'])->middleware('permission:finance.view');
        Route::post('/', [PurchaseOrderController::class, 'store'])->middleware('permission:finance.create');
        Route::get('/{id}', [PurchaseOrderController::class, 'show'])->middleware('permission:finance.view');
        Route::put('/{id}', [PurchaseOrderController::class, 'update'])->middleware('permission:finance.update');
        Route::patch('/{id}/status', [PurchaseOrderController::class, 'updateStatus'])->middleware('permission:finance.update');
        Route::delete('/{id}', [PurchaseOrderController::class, 'destroy'])->middleware('permission:finance.delete');
    });
    
    // Add your other protected routes here
});

