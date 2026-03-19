import { PrismaClient, Role } from '@prisma/client'
import { hash } from 'bcryptjs'

/**
 * Script de emergência para resetar a senha de admin via CLI.
 * Uso: npx ts-node scripts/reset-admin.ts
 */

const prisma = new PrismaClient()

// CONFIGURAÇÃO DO RESET
const ADMIN_EMAIL = 'admin@thecryptostart.com'
const NEW_PASSWORD = 'admin_secure_2026' // ⚠️ Mude após o primeiro login no painel!

async function main() {
    console.log('🛡️ Iniciando reset de senha administrativa...')

    const hashedPassword = await hash(NEW_PASSWORD, 12)

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
        })

        console.log(`✅ Usuário ${user.email} atualizado/criado com sucesso.`)

        // 2. Garantir Role ADMIN
        await prisma.userRole.upsert({
            where: {
                userId_role: {
                    userId: user.id,
                    role: Role.ADMIN
                }
            },
            update: {},
            create: {
                userId: user.id,
                role: Role.ADMIN
            }
        })

        console.log(`✅ Role ADMIN garantida para o usuário: ${user.email}`)
        console.log('\n--------------------------------------------------')
        console.log('🚀 ACESSO RESTAURADO!')
        console.log(`Email: ${ADMIN_EMAIL}`)
        console.log(`Senha: ${NEW_PASSWORD}`)
        console.log('--------------------------------------------------')
        console.log('⚠️ IMPORTANTE: Altere esta senha assim que logar no /admin.')

    } catch (error) {
        console.error('❌ Erro crítico ao resetar senha:', error)
    } finally {
        await prisma.$disconnect()
    }
}

main()
