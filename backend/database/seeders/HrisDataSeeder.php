<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\Position;
use App\Models\Employee;
use App\Models\Attendance;
use App\Models\LeaveRequest;
use App\Models\LeaveType;
use App\Models\PayrollPeriod;
use App\Models\PayrollRun;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Carbon\Carbon;

class HrisDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create departments
        $departments = [
            ['name' => 'Human Resources', 'description' => 'HR Department'],
            ['name' => 'Information Technology', 'description' => 'IT Department'],
            ['name' => 'Finance', 'description' => 'Finance Department'],
            ['name' => 'Sales', 'description' => 'Sales Department'],
            ['name' => 'Operations', 'description' => 'Operations Department'],
        ];

        $departmentIds = [];
        foreach ($departments as $dept) {
            $department = Department::firstOrCreate(['name' => $dept['name']], $dept);
            $departmentIds[] = $department->id;
        }

        // Create positions
        $positions = [
            ['name' => 'HR Manager', 'department_id' => $departmentIds[0]],
            ['name' => 'HR Specialist', 'department_id' => $departmentIds[0]],
            ['name' => 'IT Manager', 'department_id' => $departmentIds[1]],
            ['name' => 'Software Developer', 'department_id' => $departmentIds[1]],
            ['name' => 'Finance Manager', 'department_id' => $departmentIds[2]],
            ['name' => 'Accountant', 'department_id' => $departmentIds[2]],
            ['name' => 'Sales Manager', 'department_id' => $departmentIds[3]],
            ['name' => 'Sales Representative', 'department_id' => $departmentIds[3]],
            ['name' => 'Operations Manager', 'department_id' => $departmentIds[4]],
            ['name' => 'Operations Staff', 'department_id' => $departmentIds[4]],
        ];

        $positionIds = [];
        foreach ($positions as $pos) {
            $position = Position::firstOrCreate(
                ['name' => $pos['name'], 'department_id' => $pos['department_id']],
                $pos
            );
            $positionIds[] = $position->id;
        }

        // Create employees
        $employees = [
            [
                'first_name' => 'John',
                'last_name' => 'Doe',
                'email' => 'john.doe@example.com',
                'phone' => '09123456789',
                'birth_date' => '1990-01-15',
                'gender' => 'Male',
                'civil_status' => 'Single',
                'street_address' => '123 Main Street',
                'city' => 'Manila',
                'province' => 'Metro Manila',
                'zip_code' => '1000',
                'sss_number' => '34-1234567-8',
                'tin' => '123-456-789-000',
                'phil_health_number' => '12-345678901-2',
                'pag_ibig_number' => '121234567890',
                'emergency_contact_name' => 'Jane Doe',
                'emergency_contact_phone' => '09123456788',
                'emergency_contact_relationship' => 'Sister',
                'department' => 'Human Resources',
                'position' => 'HR Manager',
                'employment_type' => 'Regular',
                'start_date' => '2020-01-01',
                'monthly_salary' => 50000.00,
            ],
            [
                'first_name' => 'Jane',
                'last_name' => 'Smith',
                'email' => 'jane.smith@example.com',
                'phone' => '09123456790',
                'birth_date' => '1992-05-20',
                'gender' => 'Female',
                'civil_status' => 'Married',
                'street_address' => '456 Oak Avenue',
                'city' => 'Quezon City',
                'province' => 'Metro Manila',
                'zip_code' => '1100',
                'sss_number' => '34-2345678-9',
                'tin' => '234-567-890-000',
                'phil_health_number' => '23-456789012-3',
                'pag_ibig_number' => '122345678901',
                'emergency_contact_name' => 'John Smith',
                'emergency_contact_phone' => '09123456789',
                'emergency_contact_relationship' => 'Husband',
                'department' => 'Information Technology',
                'position' => 'Software Developer',
                'employment_type' => 'Regular',
                'start_date' => '2021-03-15',
                'monthly_salary' => 45000.00,
            ],
            [
                'first_name' => 'Michael',
                'last_name' => 'Johnson',
                'email' => 'michael.johnson@example.com',
                'phone' => '09123456791',
                'birth_date' => '1988-08-10',
                'gender' => 'Male',
                'civil_status' => 'Married',
                'street_address' => '789 Pine Road',
                'city' => 'Makati',
                'province' => 'Metro Manila',
                'zip_code' => '1200',
                'sss_number' => '34-3456789-0',
                'tin' => '345-678-901-000',
                'phil_health_number' => '34-567890123-4',
                'pag_ibig_number' => '123456789012',
                'emergency_contact_name' => 'Mary Johnson',
                'emergency_contact_phone' => '09123456790',
                'emergency_contact_relationship' => 'Wife',
                'department' => 'Finance',
                'position' => 'Finance Manager',
                'employment_type' => 'Regular',
                'start_date' => '2019-06-01',
                'monthly_salary' => 55000.00,
            ],
            [
                'first_name' => 'Sarah',
                'last_name' => 'Williams',
                'email' => 'sarah.williams@example.com',
                'phone' => '09123456792',
                'birth_date' => '1995-11-25',
                'gender' => 'Female',
                'civil_status' => 'Single',
                'street_address' => '321 Elm Street',
                'city' => 'Pasig',
                'province' => 'Metro Manila',
                'zip_code' => '1600',
                'sss_number' => '34-4567890-1',
                'tin' => '456-789-012-000',
                'phil_health_number' => '45-678901234-5',
                'pag_ibig_number' => '124567890123',
                'emergency_contact_name' => 'Robert Williams',
                'emergency_contact_phone' => '09123456791',
                'emergency_contact_relationship' => 'Father',
                'department' => 'Sales',
                'position' => 'Sales Representative',
                'employment_type' => 'Regular',
                'start_date' => '2022-02-01',
                'monthly_salary' => 35000.00,
            ],
            [
                'first_name' => 'David',
                'last_name' => 'Brown',
                'email' => 'david.brown@example.com',
                'phone' => '09123456793',
                'birth_date' => '1991-03-30',
                'gender' => 'Male',
                'civil_status' => 'Single',
                'street_address' => '654 Maple Drive',
                'city' => 'Taguig',
                'province' => 'Metro Manila',
                'zip_code' => '1630',
                'sss_number' => '34-5678901-2',
                'tin' => '567-890-123-000',
                'phil_health_number' => '56-789012345-6',
                'pag_ibig_number' => '125678901234',
                'emergency_contact_name' => 'Lisa Brown',
                'emergency_contact_phone' => '09123456792',
                'emergency_contact_relationship' => 'Mother',
                'department' => 'Operations',
                'position' => 'Operations Staff',
                'employment_type' => 'Regular',
                'start_date' => '2021-07-01',
                'monthly_salary' => 30000.00,
            ],
        ];

        $employeeIds = [];
        foreach ($employees as $emp) {
            $employee = Employee::firstOrCreate(
                ['email' => $emp['email']],
                $emp
            );
            $employeeIds[] = $employee->id;
        }

        // Create attendances for the last 30 days
        $leaveTypes = LeaveType::where('is_active', true)->get();
        if ($leaveTypes->isEmpty()) {
            $this->command->warn('No leave types found. Please run LeaveTypeSeeder first.');
            return;
        }

        $today = Carbon::today();
        foreach ($employeeIds as $employeeId) {
            for ($i = 0; $i < 20; $i++) {
                $date = $today->copy()->subDays($i);
                
                // Skip weekends
                if ($date->isWeekend()) {
                    continue;
                }

                $timeIn = $date->copy()->setTime(8, 30 + rand(0, 30), 0);
                $timeOut = $date->copy()->setTime(17, 0 + rand(0, 30), 0);
                $breakStart = $date->copy()->setTime(12, 0, 0);
                $breakEnd = $date->copy()->setTime(13, 0, 0);

                $totalHours = 8.0;
                $lateMinutes = max(0, ($timeIn->diffInMinutes($date->copy()->setTime(9, 0, 0))));
                $status = $lateMinutes > 5 ? 'late' : 'present';

                Attendance::firstOrCreate(
                    [
                        'employee_id' => $employeeId,
                        'date' => $date->format('Y-m-d'),
                    ],
                    [
                        'code' => 'ATT-' . strtoupper(Str::random(8)),
                        'time_in' => $timeIn,
                        'time_out' => $timeOut,
                        'break_start' => $breakStart,
                        'break_end' => $breakEnd,
                        'total_hours' => $totalHours,
                        'overtime_hours' => 0,
                        'late_minutes' => $lateMinutes,
                        'status' => $status,
                    ]
                );
            }
        }

        // Create leave requests
        $leaveRequestStatuses = ['pending', 'approved', 'rejected'];
        foreach ($employeeIds as $employeeId) {
            for ($i = 0; $i < 3; $i++) {
                $startDate = $today->copy()->addDays(rand(5, 30));
                $endDate = $startDate->copy()->addDays(rand(1, 5));
                $leaveType = $leaveTypes->random();
                $status = $leaveRequestStatuses[array_rand($leaveRequestStatuses)];

                LeaveRequest::create([
                    'code' => 'LR-' . strtoupper(Str::random(8)),
                    'employee_id' => $employeeId,
                    'leave_type_id' => $leaveType->id,
                    'start_date' => $startDate,
                    'end_date' => $endDate,
                    'total_days' => $startDate->diffInDays($endDate) + 1,
                    'reason' => 'Personal leave request',
                    'status' => $status,
                ]);
            }
        }

        // Create payroll periods for the last 6 months
        $payrollPeriods = [];
        for ($i = 0; $i < 6; $i++) {
            $periodStart = $today->copy()->subMonths($i)->startOfMonth();
            $periodEnd = $periodStart->copy()->endOfMonth();
            $periodName = $periodStart->format('F Y');

            $period = PayrollPeriod::firstOrCreate(
                ['name' => $periodName],
                [
                    'start_date' => $periodStart,
                    'end_date' => $periodEnd,
                    'type' => 'monthly',
                    'status' => $i === 0 ? 'active' : 'closed',
                ]
            );
            $payrollPeriods[] = $period;
        }

        // Create payroll runs for each period
        foreach ($payrollPeriods as $period) {
            PayrollRun::firstOrCreate(
                [
                    'payroll_period_id' => $period->id,
                    'status' => 'approved',
                ],
                [
                    'code' => 'PR-' . strtoupper(Str::random(8)),
                    'status' => 'approved',
                    'total_gross' => 200000.00,
                    'total_deductions' => 30000.00,
                    'total_net' => 170000.00,
                    'employee_count' => count($employeeIds),
                    'processed_at' => $period->end_date->copy()->addDay(),
                ]
            );
        }

        $this->command->info('HRIS data seeded successfully.');
        $this->command->info('Created: ' . count($departmentIds) . ' departments, ' . count($positionIds) . ' positions, ' . count($employeeIds) . ' employees');
    }
}
