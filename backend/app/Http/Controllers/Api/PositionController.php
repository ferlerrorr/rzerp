<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Position\StorePositionRequest;
use App\Http\Requests\Position\UpdatePositionRequest;
use App\Services\PositionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PositionController extends Controller
{
    public function __construct(
        private readonly PositionService $positionService
    ) {
    }

    /**
     * Get list of positions
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $result = $this->positionService->getPositions($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Positions retrieved successfully',
            'data' => $result,
        ]);
    }

    /**
     * Get a single position
     *
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        $result = $this->positionService->getPosition($id);

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Position retrieved successfully',
            'data' => $result['position'],
        ]);
    }

    /**
     * Create a new position
     *
     * @param StorePositionRequest $request
     * @return JsonResponse
     */
    public function store(StorePositionRequest $request): JsonResponse
    {
        $result = $this->positionService->createPosition($request->validated());

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
                'errors' => $result['errors'] ?? [],
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => 'Position created successfully',
            'data' => $result['position'],
        ], 201);
    }

    /**
     * Update a position
     *
     * @param UpdatePositionRequest $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(UpdatePositionRequest $request, int $id): JsonResponse
    {
        $result = $this->positionService->updatePosition($id, $request->validated());

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
                'errors' => $result['errors'] ?? [],
            ], $result['status'] ?? 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Position updated successfully',
            'data' => $result['position'],
        ]);
    }

    /**
     * Delete a position
     *
     * @param int $id
     * @return JsonResponse
     */
    public function destroy(int $id): JsonResponse
    {
        $result = $this->positionService->deletePosition($id);

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
            ], $result['status'] ?? 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Position deleted successfully',
        ]);
    }
}
