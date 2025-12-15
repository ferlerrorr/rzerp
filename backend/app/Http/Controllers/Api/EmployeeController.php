<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Employee\StoreEmployeeRequest;
use App\Http\Requests\Employee\UpdateEmployeeRequest;
use App\Services\EmployeeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EmployeeController extends Controller
{
    public function __construct(
        private readonly EmployeeService $employeeService
    ) {
    }

    /**
     * Get list of employees
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $result = $this->employeeService->getEmployees($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Employees retrieved successfully',
            'data' => $result,
        ]);
    }

    /**
     * Get a single employee
     *
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        $result = $this->employeeService->getEmployee($id);

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Employee retrieved successfully',
            'data' => $result['employee'],
        ]);
    }

    /**
     * Create a new employee
     *
     * @param StoreEmployeeRequest $request
     * @return JsonResponse
     */
    public function store(StoreEmployeeRequest $request): JsonResponse
    {
        $result = $this->employeeService->createEmployee($request->validated());

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
                'errors' => $result['errors'] ?? [],
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => 'Employee created successfully',
            'data' => $result['employee'],
        ], 201);
    }

    /**
     * Update an employee
     *
     * @param UpdateEmployeeRequest $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(UpdateEmployeeRequest $request, int $id): JsonResponse
    {
        $result = $this->employeeService->updateEmployee($id, $request->validated());

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
                'errors' => $result['errors'] ?? [],
            ], $result['status'] ?? 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Employee updated successfully',
            'data' => $result['employee'],
        ]);
    }

    /**
     * Delete an employee
     *
     * @param int $id
     * @return JsonResponse
     */
    public function destroy(int $id): JsonResponse
    {
        $result = $this->employeeService->deleteEmployee($id);

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
            ], $result['status'] ?? 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Employee deleted successfully',
        ]);
    }
}
