/**
 * Role-based access control map. Each role lists the route prefixes it can
 * access. Add new roles here without modifying any other file.
 */

import type { Role } from "./types";

export const ROLE_ALLOWED_ROUTES: Record<Role, readonly string[]> = {
  examiner: [
    "/home",
    "/dashboard",
    "/evaluation",
    "/moderation",
    "/intake",
    "/rubric-builder",
    "/audit",
  ],
  moderator: [
    "/home",
    "/dashboard",
    "/moderation",
    "/audit",
  ],
  admin: [
    "/home",
    "/dashboard",
    "/evaluation",
    "/moderation",
    "/intake",
    "/rubric-builder",
    "/audit",
  ],
} as const;

/** Check whether a given role is allowed to access a route. */
export function isRouteAllowed(role: Role, pathname: string): boolean {
  const allowed = ROLE_ALLOWED_ROUTES[role];
  return allowed.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/"),
  );
}
