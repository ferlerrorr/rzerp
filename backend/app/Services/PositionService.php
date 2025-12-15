<?php

namespace App\Services;

use App\Models\Position;
use Illuminate\Support\Facades\DB;

class PositionService
{
    /**
     * Get list of positions with pagination
     *
     * @param array<string, mixed> $filters
     * @return array<string, mixed>
     */
    public function getPositions(array $filters = []): array
    {
        $query = Position::with('department');

        // Apply filters
        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if (isset($filters['department_id'])) {
            $query->where('department_id', $filters['department_id']);
        }

        $perPage = $filters['per_page'] ?? 15;
        $positions = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return [
            'positions' => $positions->items(),
            'pagination' => [
                'current_page' => $positions->currentPage(),
                'last_page' => $positions->lastPage(),
                'per_page' => $positions->perPage(),
                'total' => $positions->total(),
            ],
        ];
    }

    /**
     * Get a single position
     *
     * @param int $id
     * @return array<string, mixed>
     */
    public function getPosition(int $id): array
    {
        $position = Position::with('department')->find($id);

        if (!$position) {
            return [
                'success' => false,
                'message' => 'Position not found',
            ];
        }

        return [
            'success' => true,
            'position' => $position,
        ];
    }

    /**
     * Create a new position
     *
     * @param array<string, mixed> $data
     * @return array<string, mixed>
     */
    public function createPosition(array $data): array
    {
        try {
            DB::beginTransaction();

            $position = Position::create([
                'name' => $data['name'],
                'description' => $data['description'] ?? null,
                'department_id' => $data['department_id'] ?? null,
            ]);

            DB::commit();

            return [
                'success' => true,
                'position' => $position->load('department'),
            ];
        } catch (\Exception $e) {
            DB::rollBack();
            return [
                'success' => false,
                'message' => 'Failed to create position: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Update a position
     *
     * @param int $id
     * @param array<string, mixed> $data
     * @return array<string, mixed>
     */
    public function updatePosition(int $id, array $data): array
    {
        $position = Position::find($id);

        if (!$position) {
            return [
                'success' => false,
                'message' => 'Position not found',
                'status' => 404,
            ];
        }

        try {
            DB::beginTransaction();

            $position->update([
                'name' => $data['name'],
                'description' => $data['description'] ?? null,
                'department_id' => $data['department_id'] ?? null,
            ]);

            DB::commit();

            return [
                'success' => true,
                'position' => $position->fresh()->load('department'),
            ];
        } catch (\Exception $e) {
            DB::rollBack();
            return [
                'success' => false,
                'message' => 'Failed to update position: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Delete a position
     *
     * @param int $id
     * @return array<string, mixed>
     */
    public function deletePosition(int $id): array
    {
        $position = Position::find($id);

        if (!$position) {
            return [
                'success' => false,
                'message' => 'Position not found',
                'status' => 404,
            ];
        }

        try {
            // Check if position has employees
            $employeeCount = DB::table('employees')
                ->where('position', $position->name)
                ->count();

            if ($employeeCount > 0) {
                return [
                    'success' => false,
                    'message' => "Cannot delete position. There are {$employeeCount} employee(s) assigned to this position.",
                    'status' => 422,
                ];
            }

            DB::beginTransaction();
            $position->delete();
            DB::commit();

            return [
                'success' => true,
                'message' => 'Position deleted successfully',
            ];
        } catch (\Exception $e) {
            DB::rollBack();
            return [
                'success' => false,
                'message' => 'Failed to delete position: ' . $e->getMessage(),
            ];
        }
    }
}

