<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Department\StoreDepartmentRequest;
use App\Http\Requests\Department\UpdateDepartmentRequest;
use App\Services\DepartmentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DepartmentController extends Controller
{
    public function __construct(
        private readonly DepartmentService $departmentService
    ) {
    }

    /**
     * Get list of departments
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $result = $this->departmentService->getDepartments($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Departments retrieved successfully',
            'data' => $result,
        ]);
    }

    /**
     * Get a single department
     *
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        $result = $this->departmentService->getDepartment($id);

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Department retrieved successfully',
            'data' => $result['department'],
        ]);
    }

    /**
     * Create a new department
     *
     * @param StoreDepartmentRequest $request
     * @return JsonResponse
     */
    public function store(StoreDepartmentRequest $request): JsonResponse
    {
        $result = $this->departmentService->createDepartment($request->validated());

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
                'errors' => $result['errors'] ?? [],
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => 'Department created successfully',
            'data' => $result['department'],
        ], 201);
    }

    /**
     * Update a department
     *
     * @param UpdateDepartmentRequest $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(UpdateDepartmentRequest $request, int $id): JsonResponse
    {
        $result = $this->departmentService->updateDepartment($id, $request->validated());

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
                'errors' => $result['errors'] ?? [],
            ], $result['status'] ?? 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Department updated successfully',
            'data' => $result['department'],
        ]);
    }

    /**
     * Delete a department
     *
     * @param int $id
     * @return JsonResponse
     */
    public function destroy(int $id): JsonResponse
    {
        $result = $this->departmentService->deleteDepartment($id);

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
            ], $result['status'] ?? 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Department deleted successfully',
        ]);
    }
}
