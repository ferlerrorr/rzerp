<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     * 
     * Order matters:
     * 1. Permissions must be created first
     * 2. Roles can be created next
     * 3. Super-admin user and role assignment comes last
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        // Seed in order: permissions -> roles -> super-admin user
        $this->call([
            PermissionSeeder::class,  // Create permissions first
            RoleSeeder::class,        // Create default roles
            SuperAdminSeeder::class,  // Create super-admin role and user
        ]);
    }
}
