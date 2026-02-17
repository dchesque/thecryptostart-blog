import { Role, Permission } from "@prisma/client";

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
    ADMIN: [
        "MANAGE_USERS",
        "MANAGE_ROLES",
        "DELETE_POST",
        "VIEW_ANALYTICS",
        "MODERATE_COMMENTS",
        "CREATE_POST",
        "PUBLISH_POST",
        "EDIT_ALL_POSTS",
        "EDIT_OWN_POST",
        "DELETE_OWN_POST",
    ],
    EDITOR: [
        "CREATE_POST",
        "PUBLISH_POST",
        "EDIT_ALL_POSTS",
        "MODERATE_COMMENTS",
        "EDIT_OWN_POST",
        "DELETE_OWN_POST",
    ],
    AUTHOR: [
        "CREATE_POST",
        "EDIT_OWN_POST",
        "DELETE_OWN_POST",
    ],
};

export type RolePermissions = typeof ROLE_PERMISSIONS;
