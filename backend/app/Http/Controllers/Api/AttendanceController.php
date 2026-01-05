<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AttendanceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    public function __construct(
        private readonly AttendanceService $attendanceService
    ) {
    }

    /**
     * Get list of attendances
     */
    public function index(Request $request): JsonResponse
    {
        $result = $this->attendanceService->getAttendances($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Attendances retrieved successfully',
            'data' => $result,
        ]);
    }

    /**
     * Record time in
     */
    public function timeIn(Request $request): JsonResponse
    {
        $result = $this->attendanceService->timeIn($request->all());

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => 'Time in recorded successfully',
            'data' => $result['attendance'],
        ], 201);
    }

    /**
     * Record time out
     */
    public function timeOut(Request $request, int $id): JsonResponse
    {
        $result = $this->attendanceService->timeOut($id, $request->all());

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
            ], $result['status'] ?? 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Time out recorded successfully',
            'data' => $result['attendance'],
        ]);
    }
}
