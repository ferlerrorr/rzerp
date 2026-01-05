<?php

namespace Database\Seeders;

use App\Models\LeaveType;
use Illuminate\Database\Seeder;

class LeaveTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $leaveTypes = [
            [
                'name' => 'Vacation Leave',
                'description' => 'Annual vacation leave for employees',
                'max_days_per_year' => 15,
                'is_paid' => true,
                'allows_carry_over' => true,
                'max_carry_over_days' => 5,
                'is_active' => true,
            ],
            [
                'name' => 'Sick Leave',
                'description' => 'Leave for medical reasons',
                'max_days_per_year' => 10,
                'is_paid' => true,
                'allows_carry_over' => false,
                'max_carry_over_days' => null,
                'is_active' => true,
            ],
            [
                'name' => 'Emergency Leave',
                'description' => 'Leave for emergency situations',
                'max_days_per_year' => 5,
                'is_paid' => true,
                'allows_carry_over' => false,
                'max_carry_over_days' => null,
                'is_active' => true,
            ],
            [
                'name' => 'Maternity Leave',
                'description' => 'Leave for expecting mothers',
                'max_days_per_year' => 105,
                'is_paid' => true,
                'allows_carry_over' => false,
                'max_carry_over_days' => null,
                'is_active' => true,
            ],
            [
                'name' => 'Paternity Leave',
                'description' => 'Leave for new fathers',
                'max_days_per_year' => 7,
                'is_paid' => true,
                'allows_carry_over' => false,
                'max_carry_over_days' => null,
                'is_active' => true,
            ],
            [
                'name' => 'Bereavement Leave',
                'description' => 'Leave for family bereavement',
                'max_days_per_year' => 5,
                'is_paid' => true,
                'allows_carry_over' => false,
                'max_carry_over_days' => null,
                'is_active' => true,
            ],
        ];

        foreach ($leaveTypes as $leaveType) {
            LeaveType::firstOrCreate(
                ['name' => $leaveType['name']],
                $leaveType
            );
        }

        $this->command->info('Leave types seeded successfully.');
    }
}
