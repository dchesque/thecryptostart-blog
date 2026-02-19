import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    try {
        console.log('Connecting to database...')
        await prisma.$connect()
        console.log('Connected successfully.')

        console.log('Testing query...')
        const userCount = await prisma.user.count()
        console.log(`Found ${userCount} users.`)

        const admin = await prisma.user.findFirst({
            where: { email: 'admin@cryptoacademy.com' }
        })

        if (admin) {
            console.log('Admin user found:', admin.email)
        } else {
            console.log('Admin user not found')
        }

    } catch (e) {
        console.error('Database connection failed:', e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
