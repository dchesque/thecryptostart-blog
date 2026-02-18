const { PrismaClient } = require("@prisma/client");
const { hash } = require("bcryptjs");

const prisma = new PrismaClient();

function requireEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(
            `[seed] Missing required environment variable: ${name}\n` +
            `Set it before running the seed:\n` +
            `  ${name}=<value> npx prisma db seed`
        );
    }
    if (value.length < 12) {
        throw new Error(
            `[seed] ${name} must be at least 12 characters long for security.`
        );
    }
    return value;
}

async function main() {
    console.log("🌱 Seeding database...");

    const adminPassword = requireEnv("SEED_ADMIN_PASSWORD");
    const editorPassword = requireEnv("SEED_EDITOR_PASSWORD");
    const authorPassword = requireEnv("SEED_AUTHOR_PASSWORD");

    const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@thecryptostart.com";
    const editorEmail = process.env.SEED_EDITOR_EMAIL || "editor@thecryptostart.com";
    const authorEmail = process.env.SEED_AUTHOR_EMAIL || "author@thecryptostart.com";

    // 1. Admin
    const adminHash = await hash(adminPassword, 12);
    const admin = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {},
        create: {
            email: adminEmail,
            name: "Admin User",
            passwordHash: adminHash,
            roles: {
                create: { role: "ADMIN" },
            },
        },
    });
    console.log(`✅ Admin created: ${admin.email}`);

    // 2. Editor
    const editorHash = await hash(editorPassword, 12);
    const editor = await prisma.user.upsert({
        where: { email: editorEmail },
        update: {},
        create: {
            email: editorEmail,
            name: "Editor User",
            passwordHash: editorHash,
            roles: {
                create: { role: "EDITOR" },
            },
        },
    });
    console.log(`✅ Editor created: ${editor.email}`);

    // 3. Author
    const authorHash = await hash(authorPassword, 12);
    const author = await prisma.user.upsert({
        where: { email: authorEmail },
        update: {},
        create: {
            email: authorEmail,
            name: "Author User",
            passwordHash: authorHash,
            roles: {
                create: { role: "AUTHOR" },
            },
        },
    });
    console.log(`✅ Author created: ${author.email}`);

    console.log("🏁 Seeding finished.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
