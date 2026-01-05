<?php

namespace App\Services;

use App\Models\Attendance;
use App\Models\Employee;
use Illuminate\Support\Str;
use Carbon\Carbon;

class AttendanceService
{
    /**
     * Get list of attendances
     *
     * @param array<string, mixed> $filters
     * @return array<string, mixed>
     */
    public function getAttendances(array $filters = []): array
    {
        $query = Attendance::with('employee');

        if (isset($filters['employee_id'])) {
            $query->where('employee_id', $filters['employee_id']);
        }

        if (isset($filters['date'])) {
            $query->where('date', $filters['date']);
        }

        if (isset($filters['start_date']) && isset($filters['end_date'])) {
            $query->whereBetween('date', [$filters['start_date'], $filters['end_date']]);
        }

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        $perPage = $filters['per_page'] ?? 15;
        $attendances = $query->orderBy('date', 'desc')->orderBy('created_at', 'desc')->paginate($perPage);

        return [
            'attendances' => $attendances->map(function ($attendance) {
                return $this->formatAttendance($attendance);
            })->all(),
            'pagination' => [
                'current_page' => $attendances->currentPage(),
                'last_page' => $attendances->lastPage(),
                'per_page' => $attendances->perPage(),
                'total' => $attendances->total(),
            ],
        ];
    }

    /**
     * Create or update attendance (time in)
     *
     * @param array<string, mixed> $data
     * @return array<string, mixed>
     */
    public function timeIn(array $data): array
    {
        try {
            $date = $data['date'] ?? date('Y-m-d');
            $employeeId = $data['employee_id'];
            $timeIn = $data['time_in'] ?? now()->format('H:i:s');

            $attendance = Attendance::where('employee_id', $employeeId)
                ->where('date', $date)
                ->first();

            if ($attendance) {
                // Update existing attendance
                $attendance->update([
                    'time_in' => $timeIn,
                ]);
            } else {
                // Create new attendance
                $attendance = Attendance::create([
                    'code' => $this->generateAttendanceCode(),
                    'employee_id' => $employeeId,
                    'date' => $date,
                    'time_in' => $timeIn,
                    'status' => $this->determineStatus($timeIn),
                ]);
            }

            // Recalculate status and late minutes
            $this->recalculateAttendance($attendance);

            return [
                'success' => true,
                'attendance' => $this->formatAttendance($attendance->fresh()),
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to record time in: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Update attendance (time out)
     *
     * @param int $id
     * @param array<string, mixed> $data
     * @return array<string, mixed>
     */
    public function timeOut(int $id, array $data): array
    {
        $attendance = Attendance::find($id);

        if (!$attendance) {
            return [
                'success' => false,
                'message' => 'Attendance not found',
                'status' => 404,
            ];
        }

        try {
            $timeOut = $data['time_out'] ?? now()->format('H:i:s');
            $breakStart = $data['break_start'] ?? null;
            $breakEnd = $data['break_end'] ?? null;

            $attendance->update([
                'time_out' => $timeOut,
                'break_start' => $breakStart,
                'break_end' => $breakEnd,
            ]);

            // Recalculate hours and overtime
            $this->recalculateAttendance($attendance);

            return [
                'success' => true,
                'attendance' => $this->formatAttendance($attendance->fresh()),
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to record time out: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Recalculate attendance metrics
     *
     * @param Attendance $attendance
     * @return void
     */
    private function recalculateAttendance(Attendance $attendance): void
    {
        if (!$attendance->time_in) {
            $attendance->status = 'absent';
            $attendance->save();
            return;
        }

        // Determine status based on time in
        $attendance->status = $this->determineStatus($attendance->time_in);
        $attendance->late_minutes = $this->calculateLateMinutes($attendance->time_in);

        // Calculate total hours if time out exists
        if ($attendance->time_out) {
            $totalHours = $this->calculateTotalHours(
                $attendance->time_in,
                $attendance->time_out,
                $attendance->break_start,
                $attendance->break_end
            );
            $attendance->total_hours = $totalHours;

            // Calculate overtime (hours beyond 8)
            $attendance->overtime_hours = max(0, $totalHours - 8);
        }

        $attendance->save();
    }

    /**
     * Determine attendance status
     *
     * @param string $timeIn
     * @return string
     */
    private function determineStatus(string $timeIn): string
    {
        $expectedTimeIn = $this->getExpectedTimeIn();
        $toleranceMinutes = $this->getLateToleranceMinutes();

        $timeInCarbon = Carbon::parse($timeIn);
        $expectedCarbon = Carbon::parse($expectedTimeIn);
        $diffMinutes = $timeInCarbon->diffInMinutes($expectedCarbon, false);

        if ($diffMinutes <= $toleranceMinutes) {
            return 'present';
        } else {
            return 'late';
        }
    }

    /**
     * Calculate late minutes
     *
     * @param string $timeIn
     * @return int
     */
    private function calculateLateMinutes(string $timeIn): int
    {
        $expectedTimeIn = $this->getExpectedTimeIn();
        $timeInCarbon = Carbon::parse($timeIn);
        $expectedCarbon = Carbon::parse($expectedTimeIn);
        $diffMinutes = $timeInCarbon->diffInMinutes($expectedCarbon, false);

        return max(0, $diffMinutes);
    }

    /**
     * Calculate total hours worked (excluding breaks)
     *
     * @param string $timeIn
     * @param string $timeOut
     * @param string|null $breakStart
     * @param string|null $breakEnd
     * @return float
     */
    private function calculateTotalHours(string $timeIn, string $timeOut, ?string $breakStart = null, ?string $breakEnd = null): float
    {
        $timeInCarbon = Carbon::parse($timeIn);
        $timeOutCarbon = Carbon::parse($timeOut);

        $totalMinutes = $timeInCarbon->diffInMinutes($timeOutCarbon);

        // Subtract break time if provided
        if ($breakStart && $breakEnd) {
            $breakStartCarbon = Carbon::parse($breakStart);
            $breakEndCarbon = Carbon::parse($breakEnd);
            $breakMinutes = $breakStartCarbon->diffInMinutes($breakEndCarbon);
            $totalMinutes -= $breakMinutes;
        }

        return round($totalMinutes / 60, 2);
    }

    /**
     * Get expected time in from settings
     *
     * @return string
     */
    private function getExpectedTimeIn(): string
    {
        // Default to 09:00, can be overridden by settings
        return '09:00:00';
    }

    /**
     * Get late tolerance minutes from settings
     *
     * @return int
     */
    private function getLateToleranceMinutes(): int
    {
        // Default to 5 minutes, can be overridden by settings
        return 5;
    }

    /**
     * Generate unique attendance code
     *
     * @return string
     */
    private function generateAttendanceCode(): string
    {
        do {
            $code = 'ATT-' . strtoupper(Str::random(8));
        } while (Attendance::where('code', $code)->exists());

        return $code;
    }

    /**
     * Format attendance for API response
     *
     * @param Attendance $attendance
     * @return array<string, mixed>
     */
    private function formatAttendance(Attendance $attendance): array
    {
        return [
            'id' => $attendance->id,
            'code' => $attendance->code ?? '',
            'employee_id' => $attendance->employee_id,
            'employee' => $attendance->employee ? [
                'id' => $attendance->employee->id,
                'name' => $attendance->employee->first_name . ' ' . $attendance->employee->last_name,
            ] : null,
            'date' => $attendance->date ? $attendance->date->format('Y-m-d') : null,
            'time_in' => $attendance->time_in ? $attendance->time_in->format('H:i:s') : null,
            'time_out' => $attendance->time_out ? $attendance->time_out->format('H:i:s') : null,
            'break_start' => $attendance->break_start ? $attendance->break_start->format('H:i:s') : null,
            'break_end' => $attendance->break_end ? $attendance->break_end->format('H:i:s') : null,
            'total_hours' => (float) ($attendance->total_hours ?? 0),
            'overtime_hours' => (float) ($attendance->overtime_hours ?? 0),
            'late_minutes' => $attendance->late_minutes ?? 0,
            'status' => $attendance->status ?? 'absent',
            'notes' => $attendance->notes,
            'created_at' => $attendance->created_at ? $attendance->created_at->toDateTimeString() : null,
            'updated_at' => $attendance->updated_at ? $attendance->updated_at->toDateTimeString() : null,
        ];
    }
}

