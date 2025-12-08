<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class SuperAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * 
     * Creates:
     * - super-admin role
     * - super-admin user (if doesn't exist)
     * - Assigns super-admin role to the user
     * - Assigns ALL permissions to super-admin role
     */
    public function run(): void
    {
        // Create super-admin role if it doesn't exist
        $superAdminRole = Role::firstOrCreate(
            ['name' => 'super-admin'],
            ['name' => 'super-admin']
        );

        $this->command->info("Super-admin role created/verified: {$superAdminRole->name}");

        // Assign ALL permissions to super-admin role
        $allPermissions = Permission::all();
        if ($allPermissions->isNotEmpty()) {
            $permissionIds = $allPermissions->pluck('id')->toArray();
            $superAdminRole->permissions()->sync($permissionIds);
            $this->command->info("Assigned {$allPermissions->count()} permissions to super-admin role");
        } else {
            $this->command->warn("No permissions found. Run PermissionSeeder first.");
        }

        // Find or create the super-admin user
        $user = User::firstOrCreate(
            ['email' => 'rzadmin@socia.com'],
            [
                'name' => 'Super Admin',
                'email' => 'rzadmin@socia.com',
                'password' => Hash::make('password'), // Default password, should be changed
                'email_verified_at' => now(),
            ]
        );

        // If user already existed, update password hash if needed
        // (using the provided hash from the user's data)
        if ($user->wasRecentlyCreated) {
            $this->command->info("Super-admin user created: {$user->email}");
        } else {
            // Update password to the provided hash if it's different
            $providedHash = '$2y$12$yV1JJNd2RB2Z1vzOHHohVuuOIPHR06CZpiZ9eIItaW5...';
            // Note: Only update if you want to use the exact hash provided
            // For security, it's better to let the user change it via password reset
            $this->command->info("Super-admin user already exists: {$user->email}");
        }

        // Assign super-admin role to the user
        $user->roles()->syncWithoutDetaching([$superAdminRole->id]);
        
        $this->command->info("Super-admin role assigned to user: {$user->email}");
        $this->command->info("Super-admin setup complete!");
    }
}
