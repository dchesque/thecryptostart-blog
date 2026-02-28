import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AuthUtils } from "@/lib/permissions";
import { z } from "zod";
import { hash } from "bcryptjs";
import { logRequest, logSuccess, logWarn, logError, createTimer } from "@/lib/logger";

const PATH = "/api/users";

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
    const t = createTimer();
    logRequest("GET", PATH);

    try {
        const session = await auth();
        AuthUtils.requireRole(session, "ADMIN");

        const users = await prisma.user.findMany({
            include: { roles: { select: { role: true } } },
            orderBy: { createdAt: "desc" },
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

        logSuccess({ method: "GET", path: PATH, durationMs: t.ms(), extra: { count: formattedUsers.length } });
        return NextResponse.json(formattedUsers);
    } catch (error: any) {
        return handleError("GET", PATH, error);
    }
}

export async function POST(req: Request) {
    const t = createTimer();
    logRequest("POST", PATH);

    try {
        const session = await auth();
        AuthUtils.requireRole(session, "ADMIN");

        const body = await req.json();
        const { name, email, password, roles, bio, image, emailVerified } = createUserSchema.parse(body);

        const exists = await prisma.user.findUnique({ where: { email } });
        if (exists) {
            logWarn({ method: "POST", path: PATH, status: 400, extra: { reason: "User already exists", email } });
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
                roles: { create: roles.map((role) => ({ role: role as any })) },
            },
        });

        logSuccess({ method: "POST", path: PATH, status: 201, durationMs: t.ms(), extra: { userId: user.id } });
        return NextResponse.json({ id: user.id, email: user.email }, { status: 201 });
    } catch (error: any) {
        return handleError("POST", PATH, error);
    }
}

function handleError(method: string, path: string, error: any) {
    if (error.message === "Authentication required") {
        logWarn({ method, path, status: 401, extra: { reason: "Unauthenticated" } });
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.message?.startsWith("Forbidden")) {
        logWarn({ method, path, status: 403, extra: { reason: error.message } });
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (error instanceof z.ZodError) {
        logWarn({ method, path, status: 400, extra: { reason: "Validation error", errors: error.flatten().fieldErrors } });
        return NextResponse.json({ error: error.flatten().fieldErrors }, { status: 400 });
    }
    logError({ method, path, error });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
}
