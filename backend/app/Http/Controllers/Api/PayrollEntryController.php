<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\PayrollService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PayrollEntryController extends Controller
{
    public function __construct(
        private readonly PayrollService $payrollService
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $runId = $request->input('payroll_run_id');
        if (!$runId) {
            return response()->json(['success' => false, 'message' => 'Payroll run ID is required'], 400);
        }
        $result = $this->payrollService->getPayrollEntries((int) $runId);
        return response()->json(['success' => true, 'data' => $result]);
    }
}
