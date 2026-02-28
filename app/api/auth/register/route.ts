import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { logRequest, logSuccess, logWarn, logError, createTimer } from "@/lib/logger";

const PATH = "/api/auth/register";

const registerSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
});

export async function POST(req: Request) {
    const t = createTimer();
    logRequest("POST", PATH);

    try {
        const body = await req.json();
        const { name, email, password } = registerSchema.parse(body);

        const userExists = await prisma.user.findUnique({ where: { email } });

        if (userExists) {
            logWarn({ method: "POST", path: PATH, status: 400, extra: { reason: "User already exists", email } });
            return NextResponse.json({ error: "User already exists" }, { status: 400 });
        }

        const hashedPassword = await hash(password, 12);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash: hashedPassword,
                roles: { create: { role: "AUTHOR" } },
            },
        });

        logSuccess({ method: "POST", path: PATH, status: 201, durationMs: t.ms(), extra: { userId: user.id } });
        return NextResponse.json(
            { message: "User created successfully", userId: user.id },
            { status: 201 }
        );
    } catch (error) {
        if (error instanceof z.ZodError) {
            logWarn({ method: "POST", path: PATH, status: 400, extra: { reason: "Validation error", errors: error.flatten().fieldErrors } });
            return NextResponse.json({ error: error.flatten().fieldErrors }, { status: 400 });
        }
        logError({ method: "POST", path: PATH, error });
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
