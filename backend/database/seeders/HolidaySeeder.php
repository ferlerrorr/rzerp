<?php

namespace Database\Seeders;

use App\Models\Holiday;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class HolidaySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $currentYear = date('Y');
        $nextYear = $currentYear + 1;

        $holidays = [
            // Regular Holidays
            [
                'date' => Carbon::create($currentYear, 1, 1),
                'name' => 'New Year\'s Day',
                'description' => 'First day of the year',
                'type' => 'regular',
                'is_active' => true,
            ],
            [
                'date' => Carbon::create($currentYear, 4, 9),
                'name' => 'Araw ng Kagitingan',
                'description' => 'Day of Valor',
                'type' => 'regular',
                'is_active' => true,
            ],
            [
                'date' => Carbon::create($currentYear, 5, 1),
                'name' => 'Labor Day',
                'description' => 'International Workers\' Day',
                'type' => 'regular',
                'is_active' => true,
            ],
            [
                'date' => Carbon::create($currentYear, 6, 12),
                'name' => 'Independence Day',
                'description' => 'Philippine Independence Day',
                'type' => 'regular',
                'is_active' => true,
            ],
            [
                'date' => Carbon::create($currentYear, 8, 30),
                'name' => 'National Heroes\' Day',
                'description' => 'Commemoration of national heroes',
                'type' => 'regular',
                'is_active' => true,
            ],
            [
                'date' => Carbon::create($currentYear, 11, 30),
                'name' => 'Bonifacio Day',
                'description' => 'Birth anniversary of Andres Bonifacio',
                'type' => 'regular',
                'is_active' => true,
            ],
            [
                'date' => Carbon::create($currentYear, 12, 25),
                'name' => 'Christmas Day',
                'description' => 'Christmas celebration',
                'type' => 'regular',
                'is_active' => true,
            ],
            [
                'date' => Carbon::create($currentYear, 12, 30),
                'name' => 'Rizal Day',
                'description' => 'Commemoration of Dr. Jose Rizal',
                'type' => 'regular',
                'is_active' => true,
            ],
            // Special Non-Working Days
            [
                'date' => Carbon::create($currentYear, 2, 10),
                'name' => 'Chinese New Year',
                'description' => 'Lunar New Year celebration',
                'type' => 'special_non_working',
                'is_active' => true,
            ],
            [
                'date' => Carbon::create($currentYear, 3, 28),
                'name' => 'Maundy Thursday',
                'description' => 'Holy Thursday',
                'type' => 'special_non_working',
                'is_active' => true,
            ],
            [
                'date' => Carbon::create($currentYear, 3, 29),
                'name' => 'Good Friday',
                'description' => 'Commemoration of Jesus\' crucifixion',
                'type' => 'special_non_working',
                'is_active' => true,
            ],
            [
                'date' => Carbon::create($currentYear, 8, 21),
                'name' => 'Ninoy Aquino Day',
                'description' => 'Commemoration of Ninoy Aquino',
                'type' => 'special_non_working',
                'is_active' => true,
            ],
            [
                'date' => Carbon::create($currentYear, 11, 1),
                'name' => 'All Saints\' Day',
                'description' => 'All Saints Day',
                'type' => 'special_non_working',
                'is_active' => true,
            ],
            [
                'date' => Carbon::create($currentYear, 12, 31),
                'name' => 'New Year\'s Eve',
                'description' => 'Last day of the year',
                'type' => 'special_non_working',
                'is_active' => true,
            ],
        ];

        foreach ($holidays as $holiday) {
            Holiday::firstOrCreate(
                [
                    'date' => $holiday['date']->format('Y-m-d'),
                    'name' => $holiday['name'],
                ],
                $holiday
            );
        }

        $this->command->info('Holidays seeded successfully.');
    }
}
