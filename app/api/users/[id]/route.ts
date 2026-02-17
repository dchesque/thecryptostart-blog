import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AuthUtils } from "@/lib/permissions";
import { z } from "zod";
import { hash } from "bcryptjs";

const updateUserSchema = z.object({
    name: z.string().min(2).optional(),
    email: z.string().email().optional(),
    password: z.string().min(6).optional(),
    roles: z.array(z.string()).min(1).optional(),
});

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        AuthUtils.requireRole(session, "ADMIN");

        const { id } = await params;
        const body = await req.json();
        const { name, email, password, roles } = updateUserSchema.parse(body);

        const updateData: any = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (password) updateData.passwordHash = await hash(password, 12);

        if (roles) {
            // Transaction to update roles
            await prisma.$transaction([
                prisma.userRole.deleteMany({ where: { userId: id } }),
                prisma.user.update({
                    where: { id },
                    data: {
                        ...updateData,
                        roles: {
                            create: roles.map((role) => ({ role: role as any })),
                        },
                    },
                }),
            ]);
        } else if (Object.keys(updateData).length > 0) {
            await prisma.user.update({
                where: { id },
                data: updateData,
            });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return handleError(error);
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        AuthUtils.requireRole(session, "ADMIN");

        const { id } = await params;

        // Don't allow deleting self
        if (id === (session?.user as any)?.id) {
            return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 });
        }

        await prisma.user.delete({ where: { id } });

        return NextResponse.json({ success: true });
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
