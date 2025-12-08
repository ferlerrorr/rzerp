<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * 
     * Creates default roles for the system.
     */
    public function run(): void
    {
        $roles = [
            'super-admin',
            'admin',
            'manager',
            'user',
        ];

        foreach ($roles as $roleName) {
            Role::firstOrCreate(
                ['name' => $roleName],
                ['name' => $roleName]
            );
        }

        $this->command->info('Default roles created successfully.');
    }
}

