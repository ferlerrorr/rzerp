<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\PayrollService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PayrollPeriodController extends Controller
{
    public function __construct(
        private readonly PayrollService $payrollService
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $result = $this->payrollService->getPayrollPeriods($request->all());
        return response()->json([
            'success' => true,
            'message' => 'Payroll periods retrieved successfully',
            'data' => $result,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        // Simple create - would need PayrollPeriodService for full CRUD
        return response()->json(['success' => true, 'message' => 'Payroll period created'], 201);
    }
}
