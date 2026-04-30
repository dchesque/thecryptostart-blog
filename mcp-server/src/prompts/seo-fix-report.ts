import { registerPrompt } from './index.js'

registerPrompt({
    name: 'seo-fix-report',
    description:
        'Produces a prioritized SEO action report by combining seo.metrics + seo.gsc + seo.ai_scores. Output is markdown only — no automatic edits, no PR creation (per DECISIONS.md D7).',
    arguments: [
        { name: 'topN', description: 'How many top opportunities to surface (default 10).', required: false },
    ],
    build: (args) => {
        const topN = args.topN || '10'
        return [
            `Goal: build a prioritized SEO action report for the top ${topN} posts.`,
            ``,
            `Steps:`,
            `1. Call \`seo.metrics\` (cached 5min) for word count averages, internal/external link averages, expansionOpportunities, linkingSuggestions.`,
            `2. Call \`seo.gsc\` for top queries, low-CTR pages, average position.`,
            `3. Call \`seo.ai_scores\` for AI-readiness per post.`,
            `4. Cross-reference: a post is a HIGH priority if it has at least 2 of:`,
            `   - avg position 8-15 (great quick win),`,
            `   - word count < 1500,`,
            `   - low CTR despite high impressions,`,
            `   - missing FAQ/HowTo schema,`,
            `   - no Quick Answer in first 200 chars.`,
            ``,
            `Output (markdown only):`,
            ``,
            `## Executive summary`,
            `- Total published posts, avg word count, % under 1500, avg internal/external links.`,
            `- Top 3 themes from GSC.`,
            `- Estimated effort to fix top ${topN} (rough hours).`,
            ``,
            `## Top ${topN} priorities`,
            `Markdown table: rank | slug | issues | recommended actions | est. impact.`,
            ``,
            `## Per-post action items`,
            `For each of the top ${topN}, a short bullet list of concrete edits (e.g. "Add FAQ block with 5 questions about X", "Expand section H2 'Setup' to 600+ words", "Internal link to /blog/foo and /blog/bar").`,
            ``,
            `Constraints:`,
            `- DO NOT call posts.update or any write tool. This prompt is read-only by policy.`,
            `- Cite specific GSC numbers (impressions, position, CTR) when justifying priority.`,
        ].join('\n')
    },
})
