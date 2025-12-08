<?php

namespace App\Services;

use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class UserService
{
    /**
     * Get list of users with pagination
     *
     * @param array<string, mixed> $filters
     * @return array<string, mixed>
     */
    public function getUsers(array $filters = []): array
    {
        $query = User::with(['roles', 'roles.permissions']);

        // Apply filters
        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $perPage = $filters['per_page'] ?? 15;
        $users = $query->paginate($perPage);

        return [
            'users' => $users->items(),
            'pagination' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
            ],
        ];
    }

    /**
     * Get a single user
     *
     * @param int $id
     * @return array<string, mixed>
     */
    public function getUser(int $id): array
    {
        $user = User::with(['roles', 'roles.permissions'])->find($id);

        if (!$user) {
            return [
                'success' => false,
                'message' => 'User not found',
            ];
        }

        // Get all permissions through roles
        $roleIds = $user->roles->pluck('id')->toArray();
        $permissions = empty($roleIds) ? [] : \App\Models\Permission::whereHas('roles', function ($query) use ($roleIds) {
            $query->whereIn('roles.id', $roleIds);
        })->pluck('name')->toArray();

        return [
            'success' => true,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'email_verified_at' => $user->email_verified_at,
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
                'roles' => $user->roles->pluck('name')->toArray(),
                'permissions' => $permissions,
            ],
        ];
    }

    /**
     * Create a new user
     *
     * @param array<string, mixed> $data
     * @return array<string, mixed>
     */
    public function createUser(array $data): array
    {
        try {
            DB::beginTransaction();

            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
            ]);

            // Assign roles if provided
            if (isset($data['role_ids']) && is_array($data['role_ids'])) {
                $user->roles()->sync($data['role_ids']);
            }

            DB::commit();

            $user->load('roles');
            $roleIds = $user->roles->pluck('id')->toArray();
            $permissions = empty($roleIds) ? [] : \App\Models\Permission::whereHas('roles', function ($query) use ($roleIds) {
                $query->whereIn('roles.id', $roleIds);
            })->pluck('name')->toArray();

            return [
                'success' => true,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'roles' => $user->roles->pluck('name')->toArray(),
                    'permissions' => $permissions,
                ],
            ];
        } catch (\Exception $e) {
            DB::rollBack();
            return [
                'success' => false,
                'message' => 'Failed to create user: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Update a user
     *
     * @param int $id
     * @param array<string, mixed> $data
     * @return array<string, mixed>
     */
    public function updateUser(int $id, array $data): array
    {
        $user = User::find($id);

        if (!$user) {
            return [
                'success' => false,
                'message' => 'User not found',
                'status' => 404,
            ];
        }

        try {
            DB::beginTransaction();

            $updateData = [
                'name' => $data['name'],
                'email' => $data['email'],
            ];

            if (isset($data['password']) && !empty($data['password'])) {
                $updateData['password'] = Hash::make($data['password']);
            }

            $user->update($updateData);

            // Update roles if provided
            if (isset($data['role_ids']) && is_array($data['role_ids'])) {
                $user->roles()->sync($data['role_ids']);
            }

            DB::commit();

            $user->load('roles');
            $roleIds = $user->roles->pluck('id')->toArray();
            $permissions = empty($roleIds) ? [] : \App\Models\Permission::whereHas('roles', function ($query) use ($roleIds) {
                $query->whereIn('roles.id', $roleIds);
            })->pluck('name')->toArray();

            return [
                'success' => true,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'roles' => $user->roles->pluck('name')->toArray(),
                    'permissions' => $permissions,
                ],
            ];
        } catch (\Exception $e) {
            DB::rollBack();
            return [
                'success' => false,
                'message' => 'Failed to update user: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Delete a user
     *
     * @param int $id
     * @return array<string, mixed>
     */
    public function deleteUser(int $id): array
    {
        $user = User::find($id);

        if (!$user) {
            return [
                'success' => false,
                'message' => 'User not found',
                'status' => 404,
            ];
        }

        // Prevent deleting super-admin
        if ($user->hasRole('super-admin')) {
            return [
                'success' => false,
                'message' => 'Cannot delete super-admin user',
                'status' => 403,
            ];
        }

        $user->delete();

        return [
            'success' => true,
        ];
    }

    /**
     * Assign roles to a user
     *
     * @param int $userId
     * @param array<int> $roleIds
     * @return array<string, mixed>
     */
    public function assignRoles(int $userId, array $roleIds): array
    {
        $user = User::find($userId);

        if (!$user) {
            return [
                'success' => false,
                'message' => 'User not found',
            ];
        }

        $user->roles()->sync($roleIds);
        $user->load('roles');

        $roleIds = $user->roles->pluck('id')->toArray();
        $permissions = empty($roleIds) ? [] : \App\Models\Permission::whereHas('roles', function ($query) use ($roleIds) {
            $query->whereIn('roles.id', $roleIds);
        })->pluck('name')->toArray();

        return [
            'success' => true,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->roles->pluck('name')->toArray(),
                'permissions' => $permissions,
            ],
        ];
    }
}

