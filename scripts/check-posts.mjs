import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const total = await prisma.post.count()
  console.log('Total posts (any status):', total)
  
  const published = await prisma.post.count({ where: { status: 'PUBLISHED' } })
  console.log('Posts PUBLISHED:', published)
  
  const all = await prisma.post.findMany({
    select: { id: true, title: true, status: true, publishDate: true, isFeatured: true },
    take: 20,
    orderBy: { createdAt: 'desc' }
  })
  
  console.log('\nPosts found:')
  all.forEach(p => {
    console.log(`  [${p.status}] ${p.title} | publishDate: ${p.publishDate} | featured: ${p.isFeatured}`)
  })

  const cats = await prisma.category.count()
  console.log('\nCategories:', cats)

  const authors = await prisma.author.count()
  console.log('Authors:', authors)

  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
