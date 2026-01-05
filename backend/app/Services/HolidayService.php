<?php

namespace App\Services;

use App\Models\Holiday;

class HolidayService
{
    /**
     * Get list of holidays
     *
     * @param array<string, mixed> $filters
     * @return array<string, mixed>
     */
    public function getHolidays(array $filters = []): array
    {
        $query = Holiday::query();

        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if (isset($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (isset($filters['is_active'])) {
            $query->where('is_active', $filters['is_active']);
        }

        if (isset($filters['year'])) {
            $query->whereYear('date', $filters['year']);
        }

        $perPage = $filters['per_page'] ?? 15;
        $holidays = $query->orderBy('date', 'desc')->paginate($perPage);

        return [
            'holidays' => $holidays->items(),
            'pagination' => [
                'current_page' => $holidays->currentPage(),
                'last_page' => $holidays->lastPage(),
                'per_page' => $holidays->perPage(),
                'total' => $holidays->total(),
            ],
        ];
    }

    /**
     * Get a single holiday
     *
     * @param int $id
     * @return array<string, mixed>
     */
    public function getHoliday(int $id): array
    {
        $holiday = Holiday::find($id);

        if (!$holiday) {
            return [
                'success' => false,
                'message' => 'Holiday not found',
            ];
        }

        return [
            'success' => true,
            'holiday' => $this->formatHoliday($holiday),
        ];
    }

    /**
     * Create a new holiday
     *
     * @param array<string, mixed> $data
     * @return array<string, mixed>
     */
    public function createHoliday(array $data): array
    {
        try {
            $holiday = Holiday::create([
                'date' => $data['date'],
                'name' => $data['name'],
                'description' => $data['description'] ?? null,
                'type' => $data['type'] ?? 'regular',
                'is_active' => $data['is_active'] ?? true,
            ]);

            return [
                'success' => true,
                'holiday' => $this->formatHoliday($holiday),
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to create holiday: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Update a holiday
     *
     * @param int $id
     * @param array<string, mixed> $data
     * @return array<string, mixed>
     */
    public function updateHoliday(int $id, array $data): array
    {
        $holiday = Holiday::find($id);

        if (!$holiday) {
            return [
                'success' => false,
                'message' => 'Holiday not found',
                'status' => 404,
            ];
        }

        try {
            $holiday->update([
                'date' => $data['date'],
                'name' => $data['name'],
                'description' => $data['description'] ?? null,
                'type' => $data['type'] ?? 'regular',
                'is_active' => $data['is_active'] ?? true,
            ]);

            return [
                'success' => true,
                'holiday' => $this->formatHoliday($holiday),
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to update holiday: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Delete a holiday
     *
     * @param int $id
     * @return array<string, mixed>
     */
    public function deleteHoliday(int $id): array
    {
        $holiday = Holiday::find($id);

        if (!$holiday) {
            return [
                'success' => false,
                'message' => 'Holiday not found',
                'status' => 404,
            ];
        }

        $holiday->delete();

        return [
            'success' => true,
        ];
    }

    /**
     * Format holiday data for API response
     *
     * @param Holiday $holiday
     * @return array<string, mixed>
     */
    private function formatHoliday(Holiday $holiday): array
    {
        return [
            'id' => $holiday->id,
            'date' => $holiday->date,
            'name' => $holiday->name,
            'description' => $holiday->description,
            'type' => $holiday->type,
            'is_active' => $holiday->is_active,
            'created_at' => $holiday->created_at,
            'updated_at' => $holiday->updated_at,
        ];
    }
}

