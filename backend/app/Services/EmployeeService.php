<?php

namespace App\Services;

use App\Models\Employee;

class EmployeeService
{
    /**
     * Get list of employees with pagination
     *
     * @param array<string, mixed> $filters
     * @return array<string, mixed>
     */
    public function getEmployees(array $filters = []): array
    {
        $query = Employee::query();

        // Apply filters
        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if (isset($filters['department'])) {
            $query->where('department', $filters['department']);
        }

        if (isset($filters['position'])) {
            $query->where('position', $filters['position']);
        }

        if (isset($filters['employment_type'])) {
            $query->where('employment_type', $filters['employment_type']);
        }

        $perPage = $filters['per_page'] ?? 15;
        $employees = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return [
            'employees' => $employees->items(),
            'pagination' => [
                'current_page' => $employees->currentPage(),
                'last_page' => $employees->lastPage(),
                'per_page' => $employees->perPage(),
                'total' => $employees->total(),
            ],
        ];
    }

    /**
     * Get a single employee
     *
     * @param int $id
     * @return array<string, mixed>
     */
    public function getEmployee(int $id): array
    {
        $employee = Employee::find($id);

        if (!$employee) {
            return [
                'success' => false,
                'message' => 'Employee not found',
            ];
        }

        return [
            'success' => true,
            'employee' => $this->formatEmployee($employee),
        ];
    }

    /**
     * Create a new employee
     *
     * @param array<string, mixed> $data
     * @return array<string, mixed>
     */
    public function createEmployee(array $data): array
    {
        try {
            $employee = Employee::create([
                'first_name' => $data['first_name'],
                'middle_name' => $data['middle_name'] ?? null,
                'last_name' => $data['last_name'],
                'email' => $data['email'],
                'phone' => $data['phone'],
                'birth_date' => $data['birth_date'],
                'gender' => $data['gender'],
                'civil_status' => $data['civil_status'],
                'street_address' => $data['street_address'],
                'city' => $data['city'],
                'province' => $data['province'],
                'zip_code' => $data['zip_code'],
                'sss_number' => $data['sss_number'],
                'tin' => $data['tin'],
                'phil_health_number' => $data['phil_health_number'],
                'pag_ibig_number' => $data['pag_ibig_number'],
                'department' => $data['department'],
                'position' => $data['position'],
                'employment_type' => $data['employment_type'],
                'start_date' => $data['start_date'],
                'monthly_salary' => $data['monthly_salary'],
                'emergency_contact_name' => $data['emergency_contact_name'],
                'emergency_contact_phone' => $data['emergency_contact_phone'],
                'emergency_contact_relationship' => $data['emergency_contact_relationship'],
            ]);

            return [
                'success' => true,
                'employee' => $this->formatEmployee($employee),
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to create employee: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Update an employee
     *
     * @param int $id
     * @param array<string, mixed> $data
     * @return array<string, mixed>
     */
    public function updateEmployee(int $id, array $data): array
    {
        $employee = Employee::find($id);

        if (!$employee) {
            return [
                'success' => false,
                'message' => 'Employee not found',
                'status' => 404,
            ];
        }

        try {
            $updateData = [
                'first_name' => $data['first_name'],
                'middle_name' => $data['middle_name'] ?? null,
                'last_name' => $data['last_name'],
                'email' => $data['email'],
                'phone' => $data['phone'],
                'birth_date' => $data['birth_date'],
                'gender' => $data['gender'],
                'civil_status' => $data['civil_status'],
                'street_address' => $data['street_address'],
                'city' => $data['city'],
                'province' => $data['province'],
                'zip_code' => $data['zip_code'],
                'sss_number' => $data['sss_number'],
                'tin' => $data['tin'],
                'phil_health_number' => $data['phil_health_number'],
                'pag_ibig_number' => $data['pag_ibig_number'],
                'department' => $data['department'],
                'position' => $data['position'],
                'employment_type' => $data['employment_type'],
                'start_date' => $data['start_date'],
                'monthly_salary' => $data['monthly_salary'],
                'emergency_contact_name' => $data['emergency_contact_name'],
                'emergency_contact_phone' => $data['emergency_contact_phone'],
                'emergency_contact_relationship' => $data['emergency_contact_relationship'],
            ];

            $employee->update($updateData);

            return [
                'success' => true,
                'employee' => $this->formatEmployee($employee),
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to update employee: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Delete an employee
     *
     * @param int $id
     * @return array<string, mixed>
     */
    public function deleteEmployee(int $id): array
    {
        $employee = Employee::find($id);

        if (!$employee) {
            return [
                'success' => false,
                'message' => 'Employee not found',
                'status' => 404,
            ];
        }

        $employee->delete();

        return [
            'success' => true,
        ];
    }

    /**
     * Format employee data for API response
     *
     * @param Employee $employee
     * @return array<string, mixed>
     */
    private function formatEmployee(Employee $employee): array
    {
        return [
            'id' => $employee->id,
            'first_name' => $employee->first_name,
            'middle_name' => $employee->middle_name,
            'last_name' => $employee->last_name,
            'email' => $employee->email,
            'phone' => $employee->phone,
            'birth_date' => $employee->birth_date,
            'gender' => $employee->gender,
            'civil_status' => $employee->civil_status,
            'street_address' => $employee->street_address,
            'city' => $employee->city,
            'province' => $employee->province,
            'zip_code' => $employee->zip_code,
            'sss_number' => $employee->sss_number,
            'tin' => $employee->tin,
            'phil_health_number' => $employee->phil_health_number,
            'pag_ibig_number' => $employee->pag_ibig_number,
            'department' => $employee->department,
            'position' => $employee->position,
            'employment_type' => $employee->employment_type,
            'start_date' => $employee->start_date,
            'monthly_salary' => $employee->monthly_salary,
            'emergency_contact_name' => $employee->emergency_contact_name,
            'emergency_contact_phone' => $employee->emergency_contact_phone,
            'emergency_contact_relationship' => $employee->emergency_contact_relationship,
            'created_at' => $employee->created_at,
            'updated_at' => $employee->updated_at,
        ];
    }
}

