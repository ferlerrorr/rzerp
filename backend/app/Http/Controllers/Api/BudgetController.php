<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Budget\StoreBudgetRequest;
use App\Http\Requests\Budget\UpdateBudgetRequest;
use App\Services\BudgetService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BudgetController extends Controller
{
    public function __construct(
        private readonly BudgetService $budgetService
    ) {
    }

    /**
     * Get list of budgets
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $result = $this->budgetService->getBudgets($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Budgets retrieved successfully',
            'data' => $result,
        ]);
    }

    /**
     * Get a single budget
     *
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        $result = $this->budgetService->getBudget($id);

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Budget retrieved successfully',
            'data' => $result['budget'],
        ]);
    }

    /**
     * Create a new budget
     *
     * @param StoreBudgetRequest $request
     * @return JsonResponse
     */
    public function store(StoreBudgetRequest $request): JsonResponse
    {
        $result = $this->budgetService->createBudget($request->validated());

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
                'errors' => $result['errors'] ?? [],
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => 'Budget created successfully',
            'data' => $result['budget'],
        ], 201);
    }

    /**
     * Update a budget
     *
     * @param UpdateBudgetRequest $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(UpdateBudgetRequest $request, int $id): JsonResponse
    {
        $result = $this->budgetService->updateBudget($id, $request->validated());

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
                'errors' => $result['errors'] ?? [],
            ], $result['status'] ?? 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Budget updated successfully',
            'data' => $result['budget'],
        ]);
    }

    /**
     * Delete a budget
     *
     * @param int $id
     * @return JsonResponse
     */
    public function destroy(int $id): JsonResponse
    {
        $result = $this->budgetService->deleteBudget($id);

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
            ], $result['status'] ?? 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Budget deleted successfully',
        ]);
    }
}
