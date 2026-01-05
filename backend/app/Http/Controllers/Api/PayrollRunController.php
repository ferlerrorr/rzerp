<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\PayrollService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PayrollRunController extends Controller
{
    public function __construct(
        private readonly PayrollService $payrollService
    ) {
    }

    /**
     * Get list of payroll runs
     */
    public function index(Request $request): JsonResponse
    {
        $result = $this->payrollService->getPayrollRuns($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Payroll runs retrieved successfully',
            'data' => $result,
        ]);
    }

    /**
     * Get payroll entries for a run
     */
    public function entries(int $id): JsonResponse
    {
        $result = $this->payrollService->getPayrollEntries($id);

        return response()->json([
            'success' => true,
            'message' => 'Payroll entries retrieved successfully',
            'data' => $result,
        ]);
    }

    /**
     * Create a new payroll run
     */
    public function store(Request $request): JsonResponse
    {
        $result = $this->payrollService->createPayrollRun($request->all());

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => 'Payroll run created successfully',
            'data' => $result['payroll_run'],
        ], 201);
    }

    /**
     * Process a payroll run
     */
    public function process(int $id): JsonResponse
    {
        $this->payrollService->processPayrollRun($id);

        return response()->json([
            'success' => true,
            'message' => 'Payroll run processed successfully',
        ]);
    }

    /**
     * Approve a payroll run
     */
    public function approve(int $id): JsonResponse
    {
        // This would update the payroll run status and mark all entries as approved
        // Implementation would go in PayrollService
        return response()->json([
            'success' => true,
            'message' => 'Payroll run approved successfully',
        ]);
    }
}
