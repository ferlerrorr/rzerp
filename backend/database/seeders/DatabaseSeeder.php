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

        // Step 6: Seed HRIS data
        $this->call([
            LeaveTypeSeeder::class,
            HolidaySeeder::class,
            HrisDataSeeder::class,
        ]);
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
            'users.delete',
            // HRIS permissions
            'hris.view',
            'hris.create',
            'hris.update',
            'hris.delete',
            'hris.approve',
            'hris.reject',
            // Payroll permissions
            'payroll.view',
            'payroll.create',
            'payroll.update',
            'payroll.delete',
            'payroll.process',
            'payroll.approve',
            // Finance permissions
            'finance.view',
            'finance.create',
            'finance.update',
            'finance.delete',
            // Settings permissions
            'settings.view',
            'settings.update',
            // Notifications permissions
            'notifications.view',
            'notifications.update',
            'notifications.delete',
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
     * Note: User creation is handled by RZ Auth service, not locally
     */
    private function createAdminUser(): void
    {
        // Users are managed by RZ Auth service, not stored locally
        // Admin user should be created in RZ Auth service
        $this->command->info("User management is handled by RZ Auth service.");
        $this->command->info("Please ensure admin user is created in RZ Auth service with admin role.");
        
        // Get admin role for reference
        $adminRole = User::roleQuery()->where('name', 'admin')->first();
        if ($adminRole) {
            $this->command->info("Admin role exists in local database (ID: {$adminRole->id})");
        } else {
            $this->command->warn("Admin role not found.");
        }
    }
}
