const { PrismaClient } = require("@prisma/client");
const { hash } = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Seeding database...");

    // 1. Admin
    const adminPassword = await hash("admin123", 12);
    const admin = await prisma.user.upsert({
        where: { email: "admin@cryptoacademy.com" },
        update: {},
        create: {
            email: "admin@cryptoacademy.com",
            name: "Admin User",
            passwordHash: adminPassword,
            roles: {
                create: { role: "ADMIN" },
            },
        },
    });
    console.log(`✅ Admin created: ${admin.email}`);

    // 2. Editor
    const editorPassword = await hash("editor123", 12);
    const editor = await prisma.user.upsert({
        where: { email: "editor@cryptoacademy.com" },
        update: {},
        create: {
            email: "editor@cryptoacademy.com",
            name: "Editor User",
            passwordHash: editorPassword,
            roles: {
                create: { role: "EDITOR" },
            },
        },
    });
    console.log(`✅ Editor created: ${editor.email}`);

    // 3. Author
    const authorPassword = await hash("author123", 12);
    const author = await prisma.user.upsert({
        where: { email: "author@cryptoacademy.com" },
        update: {},
        create: {
            email: "author@cryptoacademy.com",
            name: "Author User",
            passwordHash: authorPassword,
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
