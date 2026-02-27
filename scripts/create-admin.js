/**
 * Script para criar um novo usuário admin no banco de dados.
 *
 * Uso:
 *   node scripts/create-admin.js EMAIL NOME SENHA
 *
 * Exemplos:
 *   node scripts/create-admin.js dchesque@gmail.com "Diego Chesque" minhasenha123
 *   node scripts/create-admin.js admin@thecryptostart.com "Admin" senhasegura456
 */

const { PrismaClient } = require("@prisma/client");
const { hash } = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
    const [email, name, password] = process.argv.slice(2);

    if (!email || !name || !password) {
        console.error("❌ Uso: node scripts/create-admin.js EMAIL NOME SENHA");
        console.error('   Ex: node scripts/create-admin.js admin@email.com "Meu Nome" minhasenha123');
        process.exit(1);
    }

    if (password.length < 8) {
        console.error("❌ A senha deve ter pelo menos 8 caracteres.");
        process.exit(1);
    }

    console.log(`\n🔐 Criando admin: ${email}...`);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        console.error(`❌ Já existe um usuário com o e-mail: ${email}`);
        console.error("   Use a opção de edição de usuário no painel /admin/users para alterar.");
        process.exit(1);
    }

    const passwordHash = await hash(password, 12);

    const user = await prisma.user.create({
        data: {
            email,
            name,
            passwordHash,
            roles: {
                create: { role: "ADMIN" },
            },
        },
        include: { roles: true },
    });

    console.log(`\n✅ Admin criado com sucesso!`);
    console.log(`   ID:    ${user.id}`);
    console.log(`   Nome:  ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role:  ${user.roles.map((r) => r.role).join(", ")}`);
    console.log(`\n🔑 Acesse: /login → ${email}`);
}

main()
    .catch((e) => {
        console.error("❌ Erro:", e.message);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
