import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding initial data...')

    // 1. Create Author
    const author = await prisma.author.upsert({
        where: { slug: 'thecryptostart' },
        update: {},
        create: {
            name: 'TheCryptoStart',
            slug: 'thecryptostart',
            bio: 'Your crypto education hub.',
            avatar: 'https://cdn.iconscout.com/icon/free/png-256/free-avatar-370-456322.png',
            socialLinks: {
                twitter: 'thecryptostart',
                website: 'https://thecryptostart.com',
            },
        },
    })
    console.log(`Author created: ${author.name}`)

    // 2. Create Categories
    const categoriesToCreate = [
        { slug: 'bitcoin', name: 'Bitcoin', icon: '₿', color: '#F7931A', description: 'Everything about Bitcoin', order: 1 },
        { slug: 'ethereum', name: 'Ethereum', icon: '💎', color: '#627EEA', description: 'Ethereum and smart contracts', order: 2 },
        { slug: 'defi', name: 'DeFi', icon: '🏦', color: '#00D395', description: 'Decentralized Finance', order: 3 },
        { slug: 'crypto-security', name: 'Security', icon: '🛡️', color: '#E84142', description: 'Crypto security best practices', order: 4 },
        { slug: 'crypto-opportunities', name: 'Opportunities', icon: '🚀', color: '#F0B90B', description: 'New projects and updates', order: 5 },
        { slug: 'crypto-basics', name: 'Basics', icon: '📖', color: '#4C4A4A', description: 'Crypto basics for beginners', order: 6 },
        { slug: 'web3-and-innovation', name: 'Web3 & Innovation', icon: '🌐', color: '#A020F0', description: 'Web3 and new technologies', order: 7 },
        { slug: 'investing-and-strategy', name: 'Investing', icon: '📈', color: '#4CAF50', description: 'Investment strategies', order: 8 }
    ]

    for (const cat of categoriesToCreate) {
        await prisma.category.upsert({
            where: { slug: cat.slug },
            update: {},
            create: {
                name: cat.name,
                slug: cat.slug,
                icon: cat.icon,
                color: cat.color,
                description: cat.description,
                order: cat.order,
            },
        })
    }
    console.log(`Categories created.`)

    // Get a category for the post
    const basicsCategory = await prisma.category.findUnique({
        where: { slug: 'crypto-basics' }
    })

    if (!basicsCategory) throw new Error('Category crypto-basics not found')

    // 3. Create Sample Posts
    const postsToCreate = [
        {
            title: 'Welcome to TheCryptoStart',
            slug: 'welcome-to-thecryptostart',
            excerpt: 'Your journey into crypto starts here. A fundamental guide for all beginners.',
            content: '## What is TheCryptoStart?\n\nTheCryptoStart is your go-to resource for cryptocurrency education. We aim to make complex topics simple and accessible.\n\n## Getting Started\n\n1. Learn the basics\n2. Understand the risks\n3. Start small\n\n> Crypto is a marathon, not a sprint.\n\nEnjoy your journey!',
            status: 'PUBLISHED',
            publishDate: new Date(),
            featuredImageUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200&h=630&fit=crop',
            featuredImageAlt: 'Welcome to TheCryptoStart - Crypto Education',
            featuredImageWidth: 1200,
            featuredImageHeight: 630,
            contentType: 'ARTICLE',
            difficulty: 'BEGINNER',
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
            status: 'PUBLISHED',
            publishDate: new Date(Date.now() - 86400000), // Yesterday
            featuredImageUrl: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=1200&h=630&fit=crop',
            featuredImageAlt: 'Bitcoin coins on a table',
            featuredImageWidth: 1200,
            featuredImageHeight: 630,
            contentType: 'GUIDE',
            difficulty: 'BEGINNER',
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
            status: 'PUBLISHED',
            publishDate: new Date(Date.now() - 172800000), // 2 days ago
            featuredImageUrl: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=1200&h=630&fit=crop',
            featuredImageAlt: 'Digital financial representation',
            featuredImageWidth: 1200,
            featuredImageHeight: 630,
            contentType: 'ARTICLE',
            difficulty: 'INTERMEDIATE',
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
            status: 'PUBLISHED',
            publishDate: new Date(Date.now() - 259200000), // 3 days ago
            featuredImageUrl: 'https://images.unsplash.com/photo-1633265485768-306df35c82b6?w=1200&h=630&fit=crop',
            featuredImageAlt: 'Cybersecurity lock representation',
            featuredImageWidth: 1200,
            featuredImageHeight: 630,
            contentType: 'TUTORIAL',
            difficulty: 'BEGINNER',
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
    console.log('Seeding finished.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
