<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\LeaveService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LeaveRequestController extends Controller
{
    public function __construct(
        private readonly LeaveService $leaveService
    ) {
    }

    /**
     * Get list of leave requests
     */
    public function index(Request $request): JsonResponse
    {
        $result = $this->leaveService->getLeaveRequests($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Leave requests retrieved successfully',
            'data' => $result,
        ]);
    }

    /**
     * Create a new leave request
     */
    public function store(Request $request): JsonResponse
    {
        $result = $this->leaveService->createLeaveRequest($request->all());

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => 'Leave request created successfully',
            'data' => $result['leave_request'],
        ], 201);
    }

    /**
     * Approve a leave request
     */
    public function approve(int $id): JsonResponse
    {
        $result = $this->leaveService->approveLeaveRequest($id, Auth::id());

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
            ], $result['status'] ?? 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Leave request approved successfully',
            'data' => $result['leave_request'],
        ]);
    }

    /**
     * Reject a leave request
     */
    public function reject(Request $request, int $id): JsonResponse
    {
        $result = $this->leaveService->rejectLeaveRequest($id, $request->input('reason', ''));

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
            ], $result['status'] ?? 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Leave request rejected successfully',
            'data' => $result['leave_request'],
        ]);
    }
}
