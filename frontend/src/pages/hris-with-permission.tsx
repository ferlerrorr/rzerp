import { PermissionGuard } from "@/components/rbac/PermissionGuard";
import { Heading, Paragraph } from "@/components/semantic/index";
import { HrisPage } from "./hris/hris";

export function HrisPageWithPermission() {
  return (
    <PermissionGuard
      permission="hris.view"
      fallback={
        <div>
          <Heading level={1}>Access Denied</Heading>
          <Paragraph>
            You do not have permission to view HRIS. You need the "hris.view"
            permission.
          </Paragraph>
        </div>
      }
    >
      <HrisPage />
    </PermissionGuard>
  );
}
