import { DefaultSession } from "next-auth";
import { Role } from "@prisma/client";

declare module "next-auth" {
    interface User {
        roles: Role[];
    }

    interface Session {
        user: {
            id: string;
            roles: Role[];
        } & DefaultSession["user"];
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        roles: Role[];
    }
}

export type UserWithRoles = {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    roles: Role[];
};
