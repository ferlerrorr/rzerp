<?php

namespace App\Services;

use App\Models\Budget;

class BudgetService
{
    /**
     * Get list of budgets with pagination
     *
     * @param array<string, mixed> $filters
     * @return array<string, mixed>
     */
    public function getBudgets(array $filters = []): array
    {
        $query = Budget::query();

        // Apply filters
        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('category', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if (isset($filters['period'])) {
            $query->where('period', $filters['period']);
        }

        if (isset($filters['category'])) {
            $query->where('category', $filters['category']);
        }

        $perPage = $filters['per_page'] ?? 15;
        $budgets = $query->orderBy('period', 'desc')
            ->orderBy('category', 'asc')
            ->paginate($perPage);

        return [
            'budgets' => $budgets->items(),
            'pagination' => [
                'current_page' => $budgets->currentPage(),
                'last_page' => $budgets->lastPage(),
                'per_page' => $budgets->perPage(),
                'total' => $budgets->total(),
            ],
        ];
    }

    /**
     * Get a single budget
     *
     * @param int $id
     * @return array<string, mixed>
     */
    public function getBudget(int $id): array
    {
        $budget = Budget::find($id);

        if (!$budget) {
            return [
                'success' => false,
                'message' => 'Budget not found',
            ];
        }

        return [
            'success' => true,
            'budget' => $this->formatBudget($budget),
        ];
    }

    /**
     * Create a new budget
     *
     * @param array<string, mixed> $data
     * @return array<string, mixed>
     */
    public function createBudget(array $data): array
    {
        try {
            $budget = Budget::create([
                'category' => $data['category'],
                'budgeted_amount' => $data['budgeted_amount'],
                'actual_spending' => $data['actual_spending'] ?? 0,
                'period' => $data['period'],
                'description' => $data['description'] ?? null,
            ]);

            return [
                'success' => true,
                'budget' => $this->formatBudget($budget),
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to create budget: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Update a budget
     *
     * @param int $id
     * @param array<string, mixed> $data
     * @return array<string, mixed>
     */
    public function updateBudget(int $id, array $data): array
    {
        $budget = Budget::find($id);

        if (!$budget) {
            return [
                'success' => false,
                'message' => 'Budget not found',
                'status' => 404,
            ];
        }

        try {
            $updateData = [
                'category' => $data['category'] ?? $budget->category,
                'budgeted_amount' => $data['budgeted_amount'] ?? $budget->budgeted_amount,
                'actual_spending' => $data['actual_spending'] ?? $budget->actual_spending,
                'period' => $data['period'] ?? $budget->period,
                'description' => $data['description'] ?? $budget->description,
            ];

            $budget->update($updateData);

            return [
                'success' => true,
                'budget' => $this->formatBudget($budget->fresh()),
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to update budget: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Delete a budget
     *
     * @param int $id
     * @return array<string, mixed>
     */
    public function deleteBudget(int $id): array
    {
        $budget = Budget::find($id);

        if (!$budget) {
            return [
                'success' => false,
                'message' => 'Budget not found',
                'status' => 404,
            ];
        }

        try {
            $budget->delete();

            return [
                'success' => true,
                'message' => 'Budget deleted successfully',
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to delete budget: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Format budget data for API response
     *
     * @param Budget $budget
     * @return array<string, mixed>
     */
    private function formatBudget(Budget $budget): array
    {
        return [
            'id' => $budget->id,
            'category' => $budget->category,
            'budgeted_amount' => (string) $budget->budgeted_amount,
            'actual_spending' => (string) $budget->actual_spending,
            'period' => $budget->period,
            'description' => $budget->description,
            'created_at' => $budget->created_at,
            'updated_at' => $budget->updated_at,
        ];
    }
}

