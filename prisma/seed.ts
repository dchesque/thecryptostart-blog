import { PrismaClient, PostStatus, ContentType, Difficulty, Role } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Starting seed...')

    // 1. Create Admin User
    const hashedPassword = await hash('admin123', 12)
    const user = await prisma.user.upsert({
        where: { email: 'admin@thecryptostart.com' },
        update: {},
        create: {
            email: 'admin@thecryptostart.com',
            name: 'Blog Admin',
            passwordHash: hashedPassword,
        },
    })

    // Create Admin Role for the user
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

    console.log(`User and Role created: ${user.email}`)

    // 2. Create Author
    const author = await prisma.author.upsert({
        where: { slug: 'cryptostart-team' },
        update: {},
        create: {
            name: 'TheCryptoStart Team',
            slug: 'cryptostart-team',
            bio: 'Expert team dedicated to simplifying cryptocurrency for everyone.',
            avatar: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&h=400&fit=crop',
        },
    })
    console.log(`Author created: ${author.name}`)

    // 3. Create Categories
    const categories = [
        { name: 'Bitcoin', slug: 'bitcoin', description: 'Everything about the first cryptocurrency.', icon: '₿' },
        { name: 'Ethereum', slug: 'ethereum', description: 'Smart contracts and decentralized applications.', icon: 'Ξ' },
        { name: 'DeFi', slug: 'defi', description: 'Decentralized Finance ecosystem.', icon: '🏦' },
        { name: 'Crypto Basics', slug: 'crypto-basics', description: 'Fundamental concepts for beginners.', icon: '📚' },
        { name: 'Investing & Strategy', slug: 'investing-and-strategy', description: 'How to build and manage your portfolio.', icon: '📈' },
        { name: 'Crypto Security', slug: 'crypto-security', description: 'Keeping your assets safe.', icon: '🛡️' },
    ]

    for (const cat of categories) {
        await prisma.category.upsert({
            where: { slug: cat.slug },
            update: { icon: cat.icon },
            create: cat,
        })
    }
    console.log('Categories created.')

    // 4. Create Sample Posts
    const postsToCreate = [
        {
            title: 'Welcome to TheCryptoStart',
            slug: 'welcome-to-thecryptostart',
            excerpt: 'Your journey into crypto starts here. A fundamental guide for all beginners.',
            content: '## What is TheCryptoStart?\n\nTheCryptoStart is your go-to resource for cryptocurrency education. We aim to make complex topics simple and accessible.\n\n## Getting Started\n\n1. Learn the basics\n2. Understand the risks\n3. Start small\n\n> Crypto is a marathon, not a sprint.\n\nEnjoy your journey!',
            status: PostStatus.PUBLISHED as PostStatus,
            publishDate: new Date(),
            featuredImageUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200&h=630&fit=crop',
            featuredImageAlt: 'Welcome to TheCryptoStart - Crypto Education',
            featuredImageWidth: 1200,
            featuredImageHeight: 630,
            contentType: ContentType.GUIDE,
            difficulty: Difficulty.BEGINNER,
            isFeatured: true,
            readingTime: 2,
            wordCount: 150,
            targetKeyword: 'crypto basics',
            categorySlug: 'crypto-basics',
        },
        {
            title: 'What is Bitcoin? A Complete Guide for Beginners',
            slug: 'what-is-bitcoin-complete-guide',
            excerpt: 'Learn the fundamentals of the world\'s first cryptocurrency and why it matters.',
            content: 'Bitcoin is a decentralized digital currency, without a central bank or single administrator, that can be sent from user to user on the peer-to-peer bitcoin network without the need for intermediaries.\n\n### Key Features:\n- Decentralized\n- Limited Supply (21 million)\n- Transparent Ledger (Blockchain)\n\nBitcoin was invented by an unknown person or group of people using the name Satoshi Nakamoto in 2008.',
            status: PostStatus.PUBLISHED as PostStatus,
            publishDate: new Date(Date.now() - 86400000), // Yesterday
            featuredImageUrl: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=1200&h=630&fit=crop',
            featuredImageAlt: 'Bitcoin coins on a table',
            featuredImageWidth: 1200,
            featuredImageHeight: 630,
            contentType: ContentType.GUIDE,
            difficulty: Difficulty.BEGINNER,
            isFeatured: false,
            readingTime: 3,
            wordCount: 300,
            targetKeyword: 'what is bitcoin',
            categorySlug: 'bitcoin',
        },
        {
            title: 'Understanding DeFi: Decentralized Finance Explained',
            slug: 'understanding-defi-explained',
            excerpt: 'Discover how blockchain technology is transforming traditional financial systems.',
            content: 'Decentralized Finance (DeFi) is an emerging financial technology based on secure distributed ledgers similar to those used by cryptocurrencies.\n\nUnlike traditional banking, DeFi uses smart contracts on blockchains to provide financial services like lending, borrowing, and trading without traditional intermediaries.',
            status: PostStatus.PUBLISHED as PostStatus,
            publishDate: new Date(Date.now() - 172800000), // 2 days ago
            featuredImageUrl: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=1200&h=630&fit=crop',
            featuredImageAlt: 'Digital financial representation',
            featuredImageWidth: 1200,
            featuredImageHeight: 630,
            contentType: ContentType.ARTICLE,
            difficulty: Difficulty.INTERMEDIATE,
            isFeatured: true,
            readingTime: 4,
            wordCount: 450,
            targetKeyword: 'defi explained',
            categorySlug: 'defi',
        },
        {
            title: 'How to Secure Your Crypto Wallet',
            slug: 'how-to-secure-crypto-wallet',
            excerpt: 'Practical tips and best practices to keep your digital assets safe from hackers.',
            content: 'Securing your crypto wallet is the most important step in your crypto journey. Remember: Not your keys, not your coins.\n\n1. Use a hardware wallet\n2. Never share your recovery phrase\n3. Enable 2FA\n4. Be aware of phishing attacks',
            status: PostStatus.PUBLISHED as PostStatus,
            publishDate: new Date(Date.now() - 259200000), // 3 days ago
            featuredImageUrl: 'https://images.unsplash.com/photo-1633265485768-306df35c82b6?w=1200&h=630&fit=crop',
            featuredImageAlt: 'Cybersecurity lock representation',
            featuredImageWidth: 1200,
            featuredImageHeight: 630,
            contentType: ContentType.TUTORIAL,
            difficulty: Difficulty.BEGINNER,
            isFeatured: false,
            readingTime: 5,
            wordCount: 400,
            targetKeyword: 'crypto security',
            categorySlug: 'crypto-security',
        }
    ]

    for (const postData of postsToCreate) {
        const category = await prisma.category.findUnique({
            where: { slug: postData.categorySlug }
        })
        if (!category) continue

        const { categorySlug, ...data } = postData
        await prisma.post.upsert({
            where: { slug: data.slug },
            update: {},
            create: {
                ...data,
                categoryId: category.id,
                authorId: author.id,
                tags: ['crypto', 'education', postData.categorySlug]
            },
        })
    }

    console.log(`Sample posts created.`)
    console.log('🏁 Seeding finished.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
