<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\HolidayService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HolidayController extends Controller
{
    public function __construct(
        private readonly HolidayService $holidayService
    ) {
    }

    /**
     * Get list of holidays
     */
    public function index(Request $request): JsonResponse
    {
        $result = $this->holidayService->getHolidays($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Holidays retrieved successfully',
            'data' => $result,
        ]);
    }

    /**
     * Get a single holiday
     */
    public function show(int $id): JsonResponse
    {
        $result = $this->holidayService->getHoliday($id);

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Holiday retrieved successfully',
            'data' => $result['holiday'],
        ]);
    }

    /**
     * Create a new holiday
     */
    public function store(Request $request): JsonResponse
    {
        $result = $this->holidayService->createHoliday($request->all());

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => 'Holiday created successfully',
            'data' => $result['holiday'],
        ], 201);
    }

    /**
     * Update a holiday
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $result = $this->holidayService->updateHoliday($id, $request->all());

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
            ], $result['status'] ?? 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Holiday updated successfully',
            'data' => $result['holiday'],
        ]);
    }

    /**
     * Delete a holiday
     */
    public function destroy(int $id): JsonResponse
    {
        $result = $this->holidayService->deleteHoliday($id);

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
            ], $result['status'] ?? 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Holiday deleted successfully',
        ]);
    }
}
