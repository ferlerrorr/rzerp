<?php

namespace Database\Seeders;

use App\Models\Permission;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permissions = [
            // HRIS permissions
            'hris.view',
            'hris.create',
            'hris.update',
            'hris.delete',
            // User management permissions
            'users.view',
            'users.create',
            'users.update',
            'users.delete',
        ];

        foreach ($permissions as $permissionName) {
            Permission::firstOrCreate(
                ['name' => $permissionName],
                ['name' => $permissionName]
            );
        }

        $this->command->info('HRIS permissions created successfully.');
    }
}
