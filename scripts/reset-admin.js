const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcryptjs');

/**
 * Script de emergência para resetar a senha de admin via CLI (Versão JS).
 * Uso: RESET_PASSWORD=minhasenha npx node scripts/reset-admin.js
 */

const prisma = new PrismaClient();

const ADMIN_EMAIL = 'admin@thecryptostart.com';
const NEW_PASSWORD = process.env.RESET_PASSWORD;

async function main() {
    if (!NEW_PASSWORD) {
        console.error('❌ ERRO: Defina a variável de ambiente RESET_PASSWORD antes de rodar o script.');
        console.log('Exemplo: RESET_PASSWORD=minhasenha123 node scripts/reset-admin.js');
        process.exit(1);
    }

    console.log('🛡️ Iniciando reset de senha administrativa...');

    const hashedPassword = await hash(NEW_PASSWORD, 12);

    try {
        // 1. Upsert do Usuário
        const user = await prisma.user.upsert({
            where: { email: ADMIN_EMAIL },
            update: {
                passwordHash: hashedPassword,
                name: 'Blog Admin',
            },
            create: {
                email: ADMIN_EMAIL,
                name: 'Blog Admin',
                passwordHash: hashedPassword,
            },
        });

        console.log(`✅ Usuário ${user.email} atualizado/criado com sucesso.`);

        // 2. Garantir Role ADMIN
        // Nota: No Prisma Client JS, Roles são strings (Enums)
        await prisma.userRole.upsert({
            where: {
                userId_role: {
                    userId: user.id,
                    role: 'ADMIN'
                }
            },
            update: {},
            create: {
                userId: user.id,
                role: 'ADMIN'
            }
        });

        console.log(`✅ Role ADMIN garantida para o usuário: ${user.email}`);
        console.log('\n--------------------------------------------------');
        console.log('🚀 ACESSO RESTAURADO!');
        console.log(`Email: ${ADMIN_EMAIL}`);
        console.log(`Senha: ${NEW_PASSWORD}`);
        console.log('--------------------------------------------------');
        console.log('⚠️ IMPORTANTE: Delete este script (scripts/reset-admin.js) após o uso.');

    } catch (error) {
        console.error('❌ Erro crítico ao resetar senha:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
