<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     * 
     * Order matters:
     * 1. Permissions must be created first
     * 2. Roles can be created next
     * 3. Admin user and role assignment comes last
     */
    public function run(): void
    {
        // Step 1: Create permissions
        $this->createPermissions();

        // Step 2: Create roles
        $this->createRoles();

        // Step 3: Assign all permissions to admin role
        $this->assignPermissionsToAdminRole();

        // Step 4: Assign all permissions to generic user role
        $this->assignPermissionsToRole('user');

        // Step 5: Create admin user
        $this->createAdminUser();
    }

    /**
     * Create default permissions
     */
    private function createPermissions(): void
    {
        $permissions = [
            // User management permissions
            'users.view',
            'users.create',
            'users.update',
            'uasers.delete',
            // Email Other Permissions
           
        ];

        foreach ($permissions as $permissionName) {
            User::permissionQuery()->firstOrCreate(
                ['name' => $permissionName],
                ['name' => $permissionName]
            );
        }

        $this->command->info('Permissions created successfully.');
    }

    /**
     * Create default roles
     */
    private function createRoles(): void
    {
        $roles = [
            'admin',
            'manager',
            'user',
        ];

        foreach ($roles as $roleName) {
            User::roleQuery()->firstOrCreate(
                ['name' => $roleName],
                ['name' => $roleName]
            );
        }

        $this->command->info('Default roles created successfully.');
    }

    /**
     * Assign all permissions to admin role
     */
    private function assignPermissionsToAdminRole(): void
    {
        $this->assignPermissionsToRole('admin');
    }

    /**
     * Assign all permissions to a specific role (generic method)
     *
     * @param string $roleName
     * @return void
     */
    private function assignPermissionsToRole(string $roleName): void
    {
        $role = User::roleQuery()->where('name', $roleName)->first();

        if (!$role) {
            $this->command->warn("Role '{$roleName}' not found. Skipping permission assignment.");
            return;
        }

        $allPermissions = User::permissionQuery()->get();
        
        if ($allPermissions->isNotEmpty()) {
            $permissionIds = $allPermissions->pluck('id')->toArray();
            
            // Create a model for role_permission pivot table
            $rolePermissionModel = new class extends \Illuminate\Database\Eloquent\Model {
                protected $table = 'role_permission';
                public $timestamps = false;
                protected $fillable = ['role_id', 'permission_id'];
            };
            
            // Delete existing permissions for this role
            $rolePermissionModel->where('role_id', $role->id)->delete();
            
            // Insert all permissions using Eloquent
            $insertData = [];
            foreach ($permissionIds as $permissionId) {
                $insertData[] = [
                    'role_id' => $role->id,
                    'permission_id' => $permissionId,
                ];
            }
            
            if (!empty($insertData)) {
                $rolePermissionModel->insert($insertData);
            }
            
            $this->command->info("Assigned {$allPermissions->count()} permissions to {$roleName} role");
        } else {
            $this->command->warn("No permissions found.");
        }
    }

    /**
     * Create admin user with all permissions
     */
    private function createAdminUser(): void
    {
        // Find or create the admin user
        $user = User::firstOrCreate(
            ['email' => 'admin@socia.com'],
            [
                'name' => 'Admin',
                'email' => 'admin@socia.com',
                'password' => Hash::make('password'), // Same encryption as user register
                'email_verified_at' => \Carbon\Carbon::createFromFormat('Y-m-d H:i:s', '2025-12-05 10:14:46'),
            ]
        );

        if ($user->wasRecentlyCreated) {
            $this->command->info("Admin user created: {$user->email}");
        } else {
            // Update password and email_verified_at if user already exists
            $user->password = Hash::make('password');
            $user->email_verified_at = \Carbon\Carbon::createFromFormat('Y-m-d H:i:s', '2025-12-05 10:14:46');
            $user->save();
            $this->command->info("Admin user already exists, updated: {$user->email}");
        }

        // Get admin role
        $adminRole = User::roleQuery()->where('name', 'admin')->first();

        if ($adminRole) {
            // Assign admin role to the user
            $user->roles()->syncWithoutDetaching([$adminRole->id]);
            $this->command->info("Admin role assigned to user: {$user->email}");
        } else {
            $this->command->warn("Admin role not found. User created but role not assigned.");
        }

        $this->command->info("Admin user setup complete!");
    }
}
