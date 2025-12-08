import { createFileRoute } from "@tanstack/react-router";
import { AuthGuard } from "../components/rbac/AuthGuard";
import { PermissionGuard } from "../components/rbac/PermissionGuard";
import { AppLayout } from "../components/layouts/AppLayout";
import { Heading, Paragraph } from "../components/semantic/index";
import { useState, useEffect } from "react";
import { api } from "../lib/api";
import { ApiResponse } from "../lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/Input";

interface User {
  id: number;
  name: string;
  email: string;
  roles: string[];
  permissions: string[];
  created_at?: string;
}

interface UsersData {
  users: User[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

interface Role {
  id: number;
  name: string;
}

function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role_ids: [] as number[],
  });

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, [search]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = search ? { search } : {};
      const response = await api.get<ApiResponse<UsersData>>("/api/users", { params });
      if (response.data.success && response.data.data) {
        setUsers(response.data.data.users);
      } else {
        setError(response.data.message || "Failed to load users");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await api.get<ApiResponse<Role[]>>("/api/roles");
      if (response.data.success && response.data.data) {
        setRoles(response.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch roles:", err);
    }
  };

  const handleCreate = async () => {
    try {
      const response = await api.post<ApiResponse<User>>("/api/users", formData);
      if (response.data.success) {
        setShowCreateModal(false);
        setFormData({ name: "", email: "", password: "", role_ids: [] });
        fetchUsers();
      } else {
        setError(response.data.message || "Failed to create user");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create user");
    }
  };

  const handleUpdate = async (id: number) => {
    try {
      const response = await api.put<ApiResponse<User>>(`/api/users/${id}`, formData);
      if (response.data.success) {
        setEditingUser(null);
        setFormData({ name: "", email: "", password: "", role_ids: [] });
        fetchUsers();
      } else {
        setError(response.data.message || "Failed to update user");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const response = await api.delete<ApiResponse<void>>(`/api/users/${id}`);
      if (response.data.success) {
        fetchUsers();
      } else {
        setError(response.data.message || "Failed to delete user");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete user");
    }
  };

  const openEditModal = async (user: User) => {
    setEditingUser(user);
    
    // Fetch full user details to get role IDs
    try {
      const response = await api.get<ApiResponse<User>>(`/api/users/${user.id}`);
      if (response.data.success && response.data.data) {
        const fullUser = response.data.data;
        // Map role names to IDs
        const roleIds = fullUser.roles
          .map((roleName) => roles.find((r) => r.name === roleName)?.id)
          .filter((id): id is number => id !== undefined);
        
        setFormData({
          name: fullUser.name,
          email: fullUser.email,
          password: "",
          role_ids: roleIds,
        });
      } else {
        // Fallback to basic data
        setFormData({
          name: user.name,
          email: user.email,
          password: "",
          role_ids: [],
        });
      }
    } catch (err) {
      // Fallback to basic data
      setFormData({
        name: user.name,
        email: user.email,
        password: "",
        role_ids: [],
      });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <Heading level={1} className="mb-2">User Management</Heading>
          <Paragraph className="text-muted-foreground">Manage system users and their roles</Paragraph>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>Create User</Button>
      </div>

      {error && (
        <div className="bg-destructive/15 text-destructive border border-destructive/50 rounded-md p-4 mb-4">
          {error}
        </div>
      )}

      <Card className="mb-4">
        <CardContent className="pt-6">
          <Input
            label="Search users"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </CardContent>
      </Card>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-4">
          {users.map((user) => (
            <Card key={user.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{user.name}</CardTitle>
                    <CardDescription>{user.email}</CardDescription>
                    <div className="mt-2">
                      <span className="text-xs text-muted-foreground">
                        Roles: {user.roles.join(", ") || "None"}
                      </span>
                      {user.created_at && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Created: {new Date(user.created_at).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEditModal(user)}>
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(user.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || editingUser) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>{editingUser ? "Edit User" : "Create User"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <Input
                label={editingUser ? "New Password (leave empty to keep current)" : "Password"}
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <div>
                <label className="block text-sm font-medium mb-2">Roles</label>
                <div className="space-y-2">
                  {roles.map((role) => (
                    <label key={role.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.role_ids.includes(role.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              role_ids: [...formData.role_ids, role.id],
                            });
                          } else {
                            setFormData({
                              ...formData,
                              role_ids: formData.role_ids.filter((id) => id !== role.id),
                            });
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">{role.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => {
                  setShowCreateModal(false);
                  setEditingUser(null);
                  setFormData({ name: "", email: "", password: "", role_ids: [] });
                }}>
                  Cancel
                </Button>
                <Button onClick={() => editingUser ? handleUpdate(editingUser.id) : handleCreate()}>
                  {editingUser ? "Update" : "Create"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export const Route = createFileRoute("/users")({
  component: () => (
    <AuthGuard>
      <AppLayout>
        <PermissionGuard permission="users.view" fallback={
          <div>
            <Heading level={1}>Access Denied</Heading>
            <Paragraph>You do not have permission to view users.</Paragraph>
          </div>
        }>
          <UsersPage />
        </PermissionGuard>
      </AppLayout>
    </AuthGuard>
  ),
});

