import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AuthUtils } from "@/lib/permissions";
import { z } from "zod";

export async function GET() {
    try {
        const session = await auth();

        // Require ADMIN role
        AuthUtils.requireRole(session, "ADMIN");

        const users = await prisma.user.findMany({
            include: {
                roles: {
                    select: {
                        role: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        // Formatting for client
        const formattedUsers = users.map((user: any) => ({
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            roles: user.roles.map((r: any) => r.role),
            createdAt: user.createdAt,
        }));

        return NextResponse.json(formattedUsers);
    } catch (error: any) {
        if (error.message === "Authentication required") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        if (error.message.startsWith("Forbidden")) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.flatten().fieldErrors }, { status: 400 });
        }
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
