<?php

namespace App\Services;

use App\Models\Department;
use Illuminate\Support\Facades\DB;

class DepartmentService
{
    /**
     * Get list of departments with pagination
     *
     * @param array<string, mixed> $filters
     * @return array<string, mixed>
     */
    public function getDepartments(array $filters = []): array
    {
        $query = Department::query();

        // Apply filters
        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $perPage = $filters['per_page'] ?? 15;
        $departments = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return [
            'departments' => $departments->items(),
            'pagination' => [
                'current_page' => $departments->currentPage(),
                'last_page' => $departments->lastPage(),
                'per_page' => $departments->perPage(),
                'total' => $departments->total(),
            ],
        ];
    }

    /**
     * Get a single department
     *
     * @param int $id
     * @return array<string, mixed>
     */
    public function getDepartment(int $id): array
    {
        $department = Department::find($id);

        if (!$department) {
            return [
                'success' => false,
                'message' => 'Department not found',
            ];
        }

        return [
            'success' => true,
            'department' => $department,
        ];
    }

    /**
     * Create a new department
     *
     * @param array<string, mixed> $data
     * @return array<string, mixed>
     */
    public function createDepartment(array $data): array
    {
        try {
            DB::beginTransaction();

            $department = Department::create([
                'name' => $data['name'],
                'description' => $data['description'] ?? null,
            ]);

            DB::commit();

            return [
                'success' => true,
                'department' => $department,
            ];
        } catch (\Exception $e) {
            DB::rollBack();
            return [
                'success' => false,
                'message' => 'Failed to create department: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Update a department
     *
     * @param int $id
     * @param array<string, mixed> $data
     * @return array<string, mixed>
     */
    public function updateDepartment(int $id, array $data): array
    {
        $department = Department::find($id);

        if (!$department) {
            return [
                'success' => false,
                'message' => 'Department not found',
                'status' => 404,
            ];
        }

        try {
            DB::beginTransaction();

            $department->update([
                'name' => $data['name'],
                'description' => $data['description'] ?? null,
            ]);

            DB::commit();

            return [
                'success' => true,
                'department' => $department->fresh(),
            ];
        } catch (\Exception $e) {
            DB::rollBack();
            return [
                'success' => false,
                'message' => 'Failed to update department: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Delete a department
     *
     * @param int $id
     * @return array<string, mixed>
     */
    public function deleteDepartment(int $id): array
    {
        $department = Department::find($id);

        if (!$department) {
            return [
                'success' => false,
                'message' => 'Department not found',
                'status' => 404,
            ];
        }

        try {
            // Check if department has employees
            $employeeCount = DB::table('employees')
                ->where('department', $department->name)
                ->count();

            if ($employeeCount > 0) {
                return [
                    'success' => false,
                    'message' => "Cannot delete department. There are {$employeeCount} employee(s) assigned to this department.",
                    'status' => 422,
                ];
            }

            DB::beginTransaction();
            $department->delete();
            DB::commit();

            return [
                'success' => true,
                'message' => 'Department deleted successfully',
            ];
        } catch (\Exception $e) {
            DB::rollBack();
            return [
                'success' => false,
                'message' => 'Failed to delete department: ' . $e->getMessage(),
            ];
        }
    }
}

