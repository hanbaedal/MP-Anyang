export type Role = "supervisor" | "admin" | "member";

export type SessionUser = {
  id: string;
  username: string;
  name: string;
  role: Role;
  phone?: string;
  email?: string;
  title?: string;
};

export function isStaffRole(role: Role | string | undefined | null): role is "supervisor" | "admin" {
  return role === "supervisor" || role === "admin";
}

export function profileIncomplete(user: {
  role: Role;
  username?: string;
  name?: string;
  phone?: string;
  email?: string;
}) {
  if (user.role !== "member") return false;
  return !user.username?.trim() || !user.name?.trim() || !user.phone?.trim() || !user.email?.trim();
}

export function afterLoginPath(user: SessionUser) {
  return profileIncomplete(user) ? "/account/complete" : "/sitemap";
}
