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

    // 3. Create Sample Post
    const samplePost = await prisma.post.upsert({
        where: { slug: 'welcome-to-thecryptostart' },
        update: {},
        create: {
            title: 'Welcome to TheCryptoStart',
            slug: 'welcome-to-thecryptostart',
            excerpt: 'Your journey into crypto starts here. A fundamental guide for all beginners.',
            content: '## What is TheCryptoStart?\n\nTheCryptoStart is your go-to resource for cryptocurrency education. We aim to make complex topics simple and accessible.\n\n## Getting Started\n\n1. Learn the basics\n2. Understand the risks\n3. Start small\n\n> Crypto is a marathon, not a sprint.\n\nHere is a simple example of a smart contract:\n\n```solidity\npragma solidity ^0.8.0;\n\ncontract HelloWorld {\n    string public greet = "Hello World!";\n}\n```\n\nEnjoy your journey!',
            status: 'PUBLISHED',
            publishDate: new Date(),
            contentType: 'ARTICLE',
            difficulty: 'BEGINNER',
            isFeatured: true,
            readingTime: 2,
            wordCount: 50,
            targetKeyword: 'crypto basics',
            categoryId: basicsCategory.id,
            authorId: author.id,
            tags: ['crypto', 'beginner', 'education']
        },
    })

    console.log(`Sample post created: ${samplePost.title}`)

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
