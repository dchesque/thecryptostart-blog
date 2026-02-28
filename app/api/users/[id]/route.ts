import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AuthUtils } from "@/lib/permissions";
import { z } from "zod";
import { hash } from "bcryptjs";
import { logRequest, logSuccess, logWarn, logError, createTimer } from "@/lib/logger";

const PATH = "/api/users/[id]";

const updateUserSchema = z.object({
    name: z.string().min(2).optional(),
    email: z.string().email().optional(),
    password: z.string().min(6).optional(),
    roles: z.array(z.string()).min(1).optional(),
    bio: z.string().optional(),
    image: z.string().url().optional().or(z.literal("")),
    emailVerified: z.boolean().optional(),
});

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const t = createTimer();
    const { id } = await params;
    logRequest("PATCH", PATH, { id });

    try {
        const session = await auth();
        AuthUtils.requireRole(session, "ADMIN");

        const body = await req.json();
        const { name, email, password, roles, bio, image, emailVerified } = updateUserSchema.parse(body);

        const updateData: any = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (password) updateData.passwordHash = await hash(password, 12);
        if (bio !== undefined) updateData.bio = bio;
        if (image !== undefined) updateData.image = image || null;
        if (emailVerified !== undefined) updateData.emailVerified = emailVerified ? new Date() : null;

        if (roles) {
            await prisma.$transaction([
                prisma.userRole.deleteMany({ where: { userId: id } }),
                prisma.user.update({
                    where: { id },
                    data: {
                        ...updateData,
                        roles: { create: roles.map((role) => ({ role: role as any })) },
                    },
                }),
            ]);
        } else if (Object.keys(updateData).length > 0) {
            await prisma.user.update({ where: { id }, data: updateData });
        }

        logSuccess({ method: "PATCH", path: PATH, durationMs: t.ms(), extra: { id } });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return handleError("PATCH", PATH, error, id);
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const t = createTimer();
    const { id } = await params;
    logRequest("DELETE", PATH, { id });

    try {
        const session = await auth();
        AuthUtils.requireRole(session, "ADMIN");

        if (id === (session?.user as any)?.id) {
            logWarn({ method: "DELETE", path: PATH, status: 400, extra: { id, reason: "Cannot delete self" } });
            return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 });
        }

        await prisma.user.delete({ where: { id } });

        logSuccess({ method: "DELETE", path: PATH, status: 200, durationMs: t.ms(), extra: { id } });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return handleError("DELETE", PATH, error, id);
    }
}

function handleError(method: string, path: string, error: any, id?: string) {
    if (error.message === "Authentication required") {
        logWarn({ method, path, status: 401, extra: { id, reason: "Unauthenticated" } });
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.message?.startsWith("Forbidden")) {
        logWarn({ method, path, status: 403, extra: { id, reason: error.message } });
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (error instanceof z.ZodError) {
        logWarn({ method, path, status: 400, extra: { id, reason: "Validation error", errors: error.flatten().fieldErrors } });
        return NextResponse.json({ error: error.flatten().fieldErrors }, { status: 400 });
    }
    logError({ method, path, error, extra: { id } });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
}
