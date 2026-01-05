<?php

namespace App\Services;

use App\Models\LeaveType;
use App\Models\LeaveRequest;
use App\Models\LeaveBalance;
use Illuminate\Support\Str;

class LeaveService
{
    /**
     * Get list of leave types
     *
     * @param array<string, mixed> $filters
     * @return array<string, mixed>
     */
    public function getLeaveTypes(array $filters = []): array
    {
        $query = LeaveType::query();

        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if (isset($filters['is_active'])) {
            $query->where('is_active', $filters['is_active']);
        }

        $perPage = $filters['per_page'] ?? 15;
        $leaveTypes = $query->orderBy('name', 'asc')->paginate($perPage);

        return [
            'leave_types' => $leaveTypes->items(),
            'pagination' => [
                'current_page' => $leaveTypes->currentPage(),
                'last_page' => $leaveTypes->lastPage(),
                'per_page' => $leaveTypes->perPage(),
                'total' => $leaveTypes->total(),
            ],
        ];
    }

    /**
     * Get list of leave requests
     *
     * @param array<string, mixed> $filters
     * @return array<string, mixed>
     */
    public function getLeaveRequests(array $filters = []): array
    {
        $query = LeaveRequest::with(['employee', 'leaveType']);

        if (isset($filters['employee_id'])) {
            $query->where('employee_id', $filters['employee_id']);
        }

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['leave_type_id'])) {
            $query->where('leave_type_id', $filters['leave_type_id']);
        }

        $perPage = $filters['per_page'] ?? 15;
        $leaveRequests = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return [
            'leave_requests' => $leaveRequests->map(function ($request) {
                return $this->formatLeaveRequest($request);
            })->all(),
            'pagination' => [
                'current_page' => $leaveRequests->currentPage(),
                'last_page' => $leaveRequests->lastPage(),
                'per_page' => $leaveRequests->perPage(),
                'total' => $leaveRequests->total(),
            ],
        ];
    }

    /**
     * Get leave balances for an employee
     *
     * @param int $employeeId
     * @param int|null $year
     * @return array<string, mixed>
     */
    public function getLeaveBalances(int $employeeId, ?int $year = null): array
    {
        $year = $year ?? date('Y');
        $query = LeaveBalance::with('leaveType')
            ->where('employee_id', $employeeId)
            ->where('year', $year);

        $balances = $query->get();

        return [
            'leave_balances' => $balances->map(function ($balance) {
                return $this->formatLeaveBalance($balance);
            })->all(),
        ];
    }

    /**
     * Create a leave request
     *
     * @param array<string, mixed> $data
     * @return array<string, mixed>
     */
    public function createLeaveRequest(array $data): array
    {
        try {
            $startDate = new \DateTime($data['start_date']);
            $endDate = new \DateTime($data['end_date']);
            $totalDays = $startDate->diff($endDate)->days + 1;

            // Check available balance
            $balance = $this->getOrCreateLeaveBalance(
                $data['employee_id'],
                $data['leave_type_id'],
                (int) $startDate->format('Y')
            );

            if ($balance['available_days'] < $totalDays) {
                return [
                    'success' => false,
                    'message' => 'Insufficient leave balance',
                ];
            }

            $leaveRequest = LeaveRequest::create([
                'code' => $this->generateLeaveRequestCode(),
                'employee_id' => $data['employee_id'],
                'leave_type_id' => $data['leave_type_id'],
                'start_date' => $data['start_date'],
                'end_date' => $data['end_date'],
                'total_days' => $totalDays,
                'reason' => $data['reason'] ?? null,
                'status' => 'pending',
            ]);

            // Update balance pending_days
            $this->updateLeaveBalancePending($balance['id'], $totalDays, 'add');

            return [
                'success' => true,
                'leave_request' => $this->formatLeaveRequest($leaveRequest),
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to create leave request: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Approve a leave request
     *
     * @param int $id
     * @param int $approvedBy
     * @return array<string, mixed>
     */
    public function approveLeaveRequest(int $id, int $approvedBy): array
    {
        $leaveRequest = LeaveRequest::find($id);

        if (!$leaveRequest) {
            return [
                'success' => false,
                'message' => 'Leave request not found',
                'status' => 404,
            ];
        }

        if ($leaveRequest->status !== 'pending') {
            return [
                'success' => false,
                'message' => 'Leave request is not pending',
            ];
        }

        try {
            $leaveRequest->update([
                'status' => 'approved',
                'approved_by' => $approvedBy,
                'approved_at' => now(),
            ]);

            // Update balance: decrease pending, increase used
            $balance = LeaveBalance::where('employee_id', $leaveRequest->employee_id)
                ->where('leave_type_id', $leaveRequest->leave_type_id)
                ->where('year', (int) $leaveRequest->start_date->format('Y'))
                ->first();

            if ($balance) {
                $balance->pending_days -= $leaveRequest->total_days;
                $balance->used_days += $leaveRequest->total_days;
                $balance->recalculateAvailableDays();
            }

            return [
                'success' => true,
                'leave_request' => $this->formatLeaveRequest($leaveRequest->fresh()),
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to approve leave request: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Reject a leave request
     *
     * @param int $id
     * @param string $reason
     * @return array<string, mixed>
     */
    public function rejectLeaveRequest(int $id, string $reason): array
    {
        $leaveRequest = LeaveRequest::find($id);

        if (!$leaveRequest) {
            return [
                'success' => false,
                'message' => 'Leave request not found',
                'status' => 404,
            ];
        }

        if ($leaveRequest->status !== 'pending') {
            return [
                'success' => false,
                'message' => 'Leave request is not pending',
            ];
        }

        try {
            $leaveRequest->update([
                'status' => 'rejected',
                'rejection_reason' => $reason,
            ]);

            // Update balance: decrease pending
            $balance = LeaveBalance::where('employee_id', $leaveRequest->employee_id)
                ->where('leave_type_id', $leaveRequest->leave_type_id)
                ->where('year', (int) $leaveRequest->start_date->format('Y'))
                ->first();

            if ($balance) {
                $balance->pending_days -= $leaveRequest->total_days;
                $balance->recalculateAvailableDays();
            }

            return [
                'success' => true,
                'leave_request' => $this->formatLeaveRequest($leaveRequest->fresh()),
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to reject leave request: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Get or create leave balance for employee
     *
     * @param int $employeeId
     * @param int $leaveTypeId
     * @param int $year
     * @return LeaveBalance
     */
    private function getOrCreateLeaveBalance(int $employeeId, int $leaveTypeId, int $year): LeaveBalance
    {
        $balance = LeaveBalance::where('employee_id', $employeeId)
            ->where('leave_type_id', $leaveTypeId)
            ->where('year', $year)
            ->first();

        if (!$balance) {
            $leaveType = LeaveType::find($leaveTypeId);
            $balance = LeaveBalance::create([
                'employee_id' => $employeeId,
                'leave_type_id' => $leaveTypeId,
                'year' => $year,
                'total_days' => $leaveType->max_days_per_year ?? 0,
                'used_days' => 0,
                'pending_days' => 0,
                'carried_over_days' => 0,
                'available_days' => $leaveType->max_days_per_year ?? 0,
            ]);
        }

        return $balance;
    }

    /**
     * Update leave balance pending days
     *
     * @param int $balanceId
     * @param int $days
     * @param string $operation
     * @return void
     */
    private function updateLeaveBalancePending(int $balanceId, int $days, string $operation): void
    {
        $balance = LeaveBalance::find($balanceId);
        if ($balance) {
            if ($operation === 'add') {
                $balance->pending_days += $days;
            } else {
                $balance->pending_days -= $days;
            }
            $balance->recalculateAvailableDays();
        }
    }

    /**
     * Generate unique leave request code
     *
     * @return string
     */
    private function generateLeaveRequestCode(): string
    {
        do {
            $code = 'LR-' . strtoupper(Str::random(8));
        } while (LeaveRequest::where('code', $code)->exists());

        return $code;
    }

    /**
     * Format leave request for API response
     *
     * @param LeaveRequest $leaveRequest
     * @return array<string, mixed>
     */
    private function formatLeaveRequest(LeaveRequest $leaveRequest): array
    {
        return [
            'id' => $leaveRequest->id,
            'code' => $leaveRequest->code ?? '',
            'employee_id' => $leaveRequest->employee_id,
            'employee' => $leaveRequest->employee ? [
                'id' => $leaveRequest->employee->id,
                'name' => $leaveRequest->employee->first_name . ' ' . $leaveRequest->employee->last_name,
            ] : null,
            'leave_type_id' => $leaveRequest->leave_type_id,
            'leave_type' => $leaveRequest->leaveType ? [
                'id' => $leaveRequest->leaveType->id,
                'name' => $leaveRequest->leaveType->name,
            ] : null,
            'start_date' => $leaveRequest->start_date ? $leaveRequest->start_date->format('Y-m-d') : null,
            'end_date' => $leaveRequest->end_date ? $leaveRequest->end_date->format('Y-m-d') : null,
            'total_days' => (float) ($leaveRequest->total_days ?? 0),
            'reason' => $leaveRequest->reason,
            'status' => $leaveRequest->status ?? 'pending',
            'approved_by' => $leaveRequest->approved_by,
            'approved_at' => $leaveRequest->approved_at ? $leaveRequest->approved_at->toDateTimeString() : null,
            'rejection_reason' => $leaveRequest->rejection_reason,
            'created_at' => $leaveRequest->created_at ? $leaveRequest->created_at->toDateTimeString() : null,
            'updated_at' => $leaveRequest->updated_at ? $leaveRequest->updated_at->toDateTimeString() : null,
        ];
    }

    /**
     * Get a single leave type
     *
     * @param int $id
     * @return array<string, mixed>
     */
    public function getLeaveType(int $id): array
    {
        $leaveType = LeaveType::find($id);

        if (!$leaveType) {
            return [
                'success' => false,
                'message' => 'Leave type not found',
            ];
        }

        return [
            'success' => true,
            'leave_type' => $this->formatLeaveType($leaveType),
        ];
    }

    /**
     * Create a new leave type
     *
     * @param array<string, mixed> $data
     * @return array<string, mixed>
     */
    public function createLeaveType(array $data): array
    {
        try {
            $leaveType = LeaveType::create([
                'name' => $data['name'],
                'description' => $data['description'] ?? null,
                'max_days_per_year' => $data['max_days_per_year'] ?? 0,
                'is_paid' => $data['is_paid'] ?? true,
                'allows_carry_over' => $data['allows_carry_over'] ?? false,
                'max_carry_over_days' => $data['max_carry_over_days'] ?? null,
                'is_active' => $data['is_active'] ?? true,
            ]);

            return [
                'success' => true,
                'leave_type' => $this->formatLeaveType($leaveType),
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to create leave type: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Update a leave type
     *
     * @param int $id
     * @param array<string, mixed> $data
     * @return array<string, mixed>
     */
    public function updateLeaveType(int $id, array $data): array
    {
        $leaveType = LeaveType::find($id);

        if (!$leaveType) {
            return [
                'success' => false,
                'message' => 'Leave type not found',
                'status' => 404,
            ];
        }

        try {
            $leaveType->update([
                'name' => $data['name'],
                'description' => $data['description'] ?? null,
                'max_days_per_year' => $data['max_days_per_year'] ?? 0,
                'is_paid' => $data['is_paid'] ?? true,
                'allows_carry_over' => $data['allows_carry_over'] ?? false,
                'max_carry_over_days' => $data['max_carry_over_days'] ?? null,
                'is_active' => $data['is_active'] ?? true,
            ]);

            return [
                'success' => true,
                'leave_type' => $this->formatLeaveType($leaveType),
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to update leave type: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Delete a leave type
     *
     * @param int $id
     * @return array<string, mixed>
     */
    public function deleteLeaveType(int $id): array
    {
        $leaveType = LeaveType::find($id);

        if (!$leaveType) {
            return [
                'success' => false,
                'message' => 'Leave type not found',
                'status' => 404,
            ];
        }

        $leaveType->delete();

        return [
            'success' => true,
        ];
    }

    /**
     * Format leave type for API response
     *
     * @param LeaveType $leaveType
     * @return array<string, mixed>
     */
    private function formatLeaveType(LeaveType $leaveType): array
    {
        return [
            'id' => $leaveType->id,
            'name' => $leaveType->name,
            'description' => $leaveType->description,
            'max_days_per_year' => (int) ($leaveType->max_days_per_year ?? 0),
            'is_paid' => $leaveType->is_paid ?? true,
            'allows_carry_over' => $leaveType->allows_carry_over ?? false,
            'max_carry_over_days' => $leaveType->max_carry_over_days,
            'is_active' => $leaveType->is_active ?? true,
            'created_at' => $leaveType->created_at ? $leaveType->created_at->toDateTimeString() : null,
            'updated_at' => $leaveType->updated_at ? $leaveType->updated_at->toDateTimeString() : null,
        ];
    }

    /**
     * Format leave balance for API response
     *
     * @param LeaveBalance $leaveBalance
     * @return array<string, mixed>
     */
    private function formatLeaveBalance(LeaveBalance $leaveBalance): array
    {
        return [
            'id' => $leaveBalance->id,
            'employee_id' => $leaveBalance->employee_id,
            'leave_type_id' => $leaveBalance->leave_type_id,
            'leave_type' => $leaveBalance->leaveType ? [
                'id' => $leaveBalance->leaveType->id,
                'name' => $leaveBalance->leaveType->name,
            ] : null,
            'year' => $leaveBalance->year,
            'total_days' => $leaveBalance->total_days,
            'used_days' => $leaveBalance->used_days,
            'pending_days' => $leaveBalance->pending_days,
            'carried_over_days' => $leaveBalance->carried_over_days,
            'available_days' => $leaveBalance->available_days,
            'created_at' => $leaveBalance->created_at,
            'updated_at' => $leaveBalance->updated_at,
        ];
    }
}

