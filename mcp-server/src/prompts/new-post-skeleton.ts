import { registerPrompt } from './index.js'

registerPrompt({
    name: 'new-post-skeleton',
    description:
        'Returns a JSON body skeleton ready to feed into posts.create. Pre-fills slug, schemaType, secondary keywords slot, and adDensity hints based on the targetKeyword/contentType.',
    arguments: [
        { name: 'targetKeyword', description: 'Primary SEO keyword for the post.', required: true },
        { name: 'contentType', description: 'ARTICLE | GUIDE | TUTORIAL | GLOSSARY | REVIEW | NEWS', required: false },
        { name: 'difficulty', description: 'BEGINNER | INTERMEDIATE | ADVANCED', required: false },
        { name: 'authorId', description: 'Author id (required for posts.create — fetch via authors.list).', required: false },
        { name: 'categoryId', description: 'Category id (required for posts.create — fetch via categories.list).', required: false },
    ],
    build: (args) => {
        const kw = args.targetKeyword || 'crypto-topic'
        const contentType = (args.contentType || 'ARTICLE').toUpperCase()
        const difficulty = (args.difficulty || 'BEGINNER').toUpperCase()
        const slug = kw.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-')

        const schemaTypeMap: Record<string, string> = {
            ARTICLE: 'ARTICLE',
            GUIDE: 'HOW_TO',
            TUTORIAL: 'HOW_TO',
            REVIEW: 'REVIEW',
            NEWS: 'NEWS_ARTICLE',
            GLOSSARY: 'ARTICLE',
        }
        const schemaType = schemaTypeMap[contentType] ?? 'ARTICLE'

        const skeleton = {
            title: `<TITLE — include "${kw}">`,
            slug,
            excerpt: `<140-160 char meta-style excerpt that contains "${kw}".>`,
            content: `<MARKDOWN BODY HERE — aim for 1800-2500 words, h2/h3 structure, FAQ block at the end.>`,
            authorId: args.authorId || '<authorId — call authors.list to find>',
            categoryId: args.categoryId || '<categoryId — call categories.list to find>',
            status: 'DRAFT',
            tags: [kw],
            seoTitle: `<60 char title — front-loaded with "${kw}">`,
            seoDescription: `<155 char meta description — must contain "${kw}">`,
            targetKeyword: kw,
            secondaryKeywords: [`<related kw 1>`, `<related kw 2>`, `<related kw 3>`],
            isFeatured: false,
            contentType,
            difficulty,
            schemaType,
            adDensity: contentType === 'NEWS' ? 'LOW' : 'NORMAL',
        }

        return [
            `Goal: produce a publishable post skeleton for **${kw}** (${contentType}, ${difficulty}).`,
            ``,
            `Steps:`,
            `1. Call \`posts.search\` with q="${kw}" to check we don't already cover this topic.`,
            `2. Call \`authors.list\` and \`categories.list\` to pick valid ids.`,
            `3. Fill in the skeleton below — keep slug stable, replace every <…> placeholder.`,
            `4. Call \`posts.create\` with the completed JSON. Will create as DRAFT.`,
            `5. (Optional) Call \`posts.publish\` once content is reviewed.`,
            ``,
            `\`\`\`json`,
            JSON.stringify(skeleton, null, 2),
            `\`\`\``,
            ``,
            `Notes:`,
            `- \`schemaType\` was inferred as **${schemaType}** from contentType=${contentType}.`,
            `- For HOW_TO posts, also fill \`howToSteps\` (array of {name, text}).`,
            `- For REVIEW posts, also fill \`pros\` and \`cons\` (string arrays).`,
            `- All write tools require \`MCP_WRITES_ENABLED=true\` on the server.`,
        ].join('\n')
    },
})
