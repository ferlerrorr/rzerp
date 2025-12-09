import { PermissionGuard } from "@/components/rbac/PermissionGuard";
import { Heading, Paragraph } from "@/components/semantic/index";
import { UsersPage } from "./users";

export function UsersPageWithPermission() {
  return (
    <PermissionGuard
      permission="users.view"
      fallback={
        <div>
          <Heading level={1}>Access Denied</Heading>
          <Paragraph>You do not have permission to view users.</Paragraph>
        </div>
      }
    >
      <UsersPage />
    </PermissionGuard>
  );
}
