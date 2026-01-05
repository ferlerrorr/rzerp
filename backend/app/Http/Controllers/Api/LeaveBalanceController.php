<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\LeaveService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LeaveBalanceController extends Controller
{
    public function __construct(
        private readonly LeaveService $leaveService
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $employeeId = $request->input('employee_id');
        $year = $request->input('year', date('Y'));
        
        if (!$employeeId) {
            return response()->json([
                'success' => false,
                'message' => 'Employee ID is required',
            ], 400);
        }

        $result = $this->leaveService->getLeaveBalances((int) $employeeId, (int) $year);
        return response()->json([
            'success' => true,
            'message' => 'Leave balances retrieved successfully',
            'data' => $result,
        ]);
    }
}
