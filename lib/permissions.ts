import { Role, Permission } from "@prisma/client";
import { ROLE_PERMISSIONS } from "@/types/roles";
import { Session } from "next-auth";

/**
 * Checks if a set of roles has a specific permission.
 */
export function hasPermission(roles: Role[], permission: Permission): boolean {
    return roles.some((role) => ROLE_PERMISSIONS[role]?.includes(permission));
}

/**
 * Checks if a set of roles includes a specific role.
 */
export function hasRole(roles: Role[], role: Role): boolean {
    return roles.includes(role);
}

/**
 * Higher-level auth utilities for server components and API routes.
 */
export const AuthUtils = {
    /**
     * Requires the user to be authenticated.
     */
    requireAuth(session: Session | null) {
        if (!session || !session.user) {
            throw new Error("Authentication required");
        }
        return session.user;
    },

    /**
     * Requires the user to have a specific role.
     */
    requireRole(session: Session | null, role: Role) {
        const user = this.requireAuth(session);
        if (!hasRole(user.roles, role)) {
            throw new Error(`Forbidden: Role ${role} required`);
        }
        return user;
    },

    /**
     * Requires the user to have a specific permission.
     */
    requirePermission(session: Session | null, permission: Permission) {
        const user = this.requireAuth(session);
        if (!hasPermission(user.roles, permission)) {
            throw new Error(`Forbidden: Permission ${permission} required`);
        }
        return user;
    },
};
