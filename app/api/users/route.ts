import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AuthUtils } from "@/lib/permissions";
import { z } from "zod";
import { hash } from "bcryptjs";

const createUserSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    roles: z.array(z.string()).min(1),
    bio: z.string().optional(),
    image: z.string().url().optional().or(z.literal("")),
    emailVerified: z.boolean().optional(),
});

export async function GET() {
    try {
        const session = await auth();
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

        const formattedUsers = users.map((user: any) => ({
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            bio: user.bio,
            emailVerified: user.emailVerified,
            roles: user.roles.map((r: any) => r.role),
            createdAt: user.createdAt,
        }));

        return NextResponse.json(formattedUsers);
    } catch (error: any) {
        return handleError(error);
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        AuthUtils.requireRole(session, "ADMIN");

        const body = await req.json();
        const { name, email, password, roles, bio, image, emailVerified } = createUserSchema.parse(body);

        const exists = await prisma.user.findUnique({ where: { email } });
        if (exists) {
            return NextResponse.json({ error: "User already exists" }, { status: 400 });
        }

        const passwordHash = await hash(password, 12);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash,
                bio,
                image: image || null,
                emailVerified: emailVerified ? new Date() : null,
                roles: {
                    create: roles.map((role) => ({ role: role as any })),
                },
            },
        });

        return NextResponse.json({ id: user.id, email: user.email }, { status: 201 });
    } catch (error: any) {
        return handleError(error);
    }
}

function handleError(error: any) {
    if (error.message === "Authentication required") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.message.startsWith("Forbidden")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (error instanceof z.ZodError) {
        return NextResponse.json({ error: error.flatten().fieldErrors }, { status: 400 });
    }
    console.error("API Error:", error);
    return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
    );
}
