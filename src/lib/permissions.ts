import type { UserRole } from "@/types/cms";

const permissions: Record<UserRole, string[]> = {
  admin: ["*"],
  editor: ["content:read", "content:write", "media:write", "forms:read"],
  contributor: ["content:propose", "media:propose"],
  viewer: ["content:read"],
};

export function can(role: UserRole, permission: string) {
  return permissions[role].includes("*") || permissions[role].includes(permission);
}
