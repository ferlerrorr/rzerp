<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\EmploymentTypeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EmploymentTypeController extends Controller
{
    public function __construct(
        private readonly EmploymentTypeService $employmentTypeService
    ) {
    }

    /**
     * Get list of employment types
     */
    public function index(Request $request): JsonResponse
    {
        $result = $this->employmentTypeService->getEmploymentTypes($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Employment types retrieved successfully',
            'data' => $result,
        ]);
    }

    /**
     * Get a single employment type
     */
    public function show(int $id): JsonResponse
    {
        $result = $this->employmentTypeService->getEmploymentType($id);

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Employment type retrieved successfully',
            'data' => $result['employment_type'],
        ]);
    }

    /**
     * Create a new employment type
     */
    public function store(Request $request): JsonResponse
    {
        $result = $this->employmentTypeService->createEmploymentType($request->all());

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => 'Employment type created successfully',
            'data' => $result['employment_type'],
        ], 201);
    }

    /**
     * Update an employment type
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $result = $this->employmentTypeService->updateEmploymentType($id, $request->all());

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
            ], $result['status'] ?? 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Employment type updated successfully',
            'data' => $result['employment_type'],
        ]);
    }

    /**
     * Delete an employment type
     */
    public function destroy(int $id): JsonResponse
    {
        $result = $this->employmentTypeService->deleteEmploymentType($id);

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
            ], $result['status'] ?? 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Employment type deleted successfully',
        ]);
    }
}
