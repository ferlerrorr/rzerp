<?php

namespace App\Services;

use App\Models\EmploymentType;

class EmploymentTypeService
{
    /**
     * Get list of employment types
     *
     * @param array<string, mixed> $filters
     * @return array<string, mixed>
     */
    public function getEmploymentTypes(array $filters = []): array
    {
        $query = EmploymentType::query();

        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $perPage = $filters['per_page'] ?? 15;
        $employmentTypes = $query->orderBy('name', 'asc')->paginate($perPage);

        return [
            'employment_types' => $employmentTypes->items(),
            'pagination' => [
                'current_page' => $employmentTypes->currentPage(),
                'last_page' => $employmentTypes->lastPage(),
                'per_page' => $employmentTypes->perPage(),
                'total' => $employmentTypes->total(),
            ],
        ];
    }

    /**
     * Get a single employment type
     *
     * @param int $id
     * @return array<string, mixed>
     */
    public function getEmploymentType(int $id): array
    {
        $employmentType = EmploymentType::find($id);

        if (!$employmentType) {
            return [
                'success' => false,
                'message' => 'Employment type not found',
            ];
        }

        return [
            'success' => true,
            'employment_type' => $this->formatEmploymentType($employmentType),
        ];
    }

    /**
     * Create a new employment type
     *
     * @param array<string, mixed> $data
     * @return array<string, mixed>
     */
    public function createEmploymentType(array $data): array
    {
        try {
            $employmentType = EmploymentType::create([
                'name' => $data['name'],
                'description' => $data['description'] ?? null,
            ]);

            return [
                'success' => true,
                'employment_type' => $this->formatEmploymentType($employmentType),
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to create employment type: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Update an employment type
     *
     * @param int $id
     * @param array<string, mixed> $data
     * @return array<string, mixed>
     */
    public function updateEmploymentType(int $id, array $data): array
    {
        $employmentType = EmploymentType::find($id);

        if (!$employmentType) {
            return [
                'success' => false,
                'message' => 'Employment type not found',
                'status' => 404,
            ];
        }

        try {
            $employmentType->update([
                'name' => $data['name'],
                'description' => $data['description'] ?? null,
            ]);

            return [
                'success' => true,
                'employment_type' => $this->formatEmploymentType($employmentType),
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to update employment type: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Delete an employment type
     *
     * @param int $id
     * @return array<string, mixed>
     */
    public function deleteEmploymentType(int $id): array
    {
        $employmentType = EmploymentType::find($id);

        if (!$employmentType) {
            return [
                'success' => false,
                'message' => 'Employment type not found',
                'status' => 404,
            ];
        }

        $employmentType->delete();

        return [
            'success' => true,
        ];
    }

    /**
     * Format employment type data for API response
     *
     * @param EmploymentType $employmentType
     * @return array<string, mixed>
     */
    private function formatEmploymentType(EmploymentType $employmentType): array
    {
        return [
            'id' => $employmentType->id,
            'name' => $employmentType->name,
            'description' => $employmentType->description,
            'created_at' => $employmentType->created_at,
            'updated_at' => $employmentType->updated_at,
        ];
    }
}

