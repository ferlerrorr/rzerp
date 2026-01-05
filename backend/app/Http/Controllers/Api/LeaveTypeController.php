<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\LeaveService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LeaveTypeController extends Controller
{
    public function __construct(
        private readonly LeaveService $leaveService
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $result = $this->leaveService->getLeaveTypes($request->all());
        return response()->json([
            'success' => true,
            'message' => 'Leave types retrieved successfully',
            'data' => $result,
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $result = $this->leaveService->getLeaveType($id);
        if (!$result['success']) {
            return response()->json(['success' => false, 'message' => $result['message']], 404);
        }
        return response()->json(['success' => true, 'data' => $result['leave_type']]);
    }

    public function store(Request $request): JsonResponse
    {
        $result = $this->leaveService->createLeaveType($request->all());
        if (!$result['success']) {
            return response()->json(['success' => false, 'message' => $result['message']], 422);
        }
        return response()->json(['success' => true, 'data' => $result['leave_type']], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $result = $this->leaveService->updateLeaveType($id, $request->all());
        if (!$result['success']) {
            return response()->json(['success' => false, 'message' => $result['message']], $result['status'] ?? 404);
        }
        return response()->json(['success' => true, 'data' => $result['leave_type']]);
    }

    public function destroy(int $id): JsonResponse
    {
        $result = $this->leaveService->deleteLeaveType($id);
        if (!$result['success']) {
            return response()->json(['success' => false, 'message' => $result['message']], $result['status'] ?? 404);
        }
        return response()->json(['success' => true, 'message' => 'Leave type deleted successfully']);
    }
}
