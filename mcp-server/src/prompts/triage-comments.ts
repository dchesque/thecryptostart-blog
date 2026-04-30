import { registerPrompt } from './index.js'

registerPrompt({
    name: 'triage-comments',
    description:
        'Walks the LLM through reviewing PENDING comments and proposing APPROVE/REJECT/SPAM with justifications. Does NOT auto-apply — produces a structured plan that the human commits via comments.moderate.',
    arguments: [
        { name: 'limit', description: 'How many pending comments to triage (default 25).', required: false },
        { name: 'postSlug', description: 'Optionally restrict to a single post.', required: false },
    ],
    build: (args) => {
        const limit = args.limit || '25'
        const postFilter = args.postSlug ? ` filtered to postSlug="${args.postSlug}"` : ''
        return [
            `Goal: triage up to ${limit} pending comments${postFilter} and produce a moderation plan.`,
            ``,
            `Steps:`,
            `1. Call \`comments.list\` with status="PENDING".`,
            `2. For each comment, classify as one of: APPROVE | REJECT | SPAM.`,
            `3. Output a markdown table with columns: id | author | excerpt (≤80 chars) | decision | reason.`,
            `4. After the table, output the **command list** the human can run as JSON:`,
            ``,
            `   \`\`\`json`,
            `   [`,
            `     { "tool": "comments.moderate", "args": { "id": "<id>", "status": "APPROVED" } },`,
            `     ...`,
            `   ]`,
            `   \`\`\``,
            ``,
            `Decision rules:`,
            `- **APPROVE** if on-topic, civil, adds value or is a genuine question.`,
            `- **REJECT** if off-topic, low-effort ("nice post"), insulting, but clearly not spam.`,
            `- **SPAM** if links to scams, generic shilling, repeats keywords, contains crypto pump/airdrop bait.`,
            ``,
            `Important:`,
            `- DO NOT call comments.moderate yourself. Output the plan for human review.`,
            `- Be conservative on borderline cases — flag as REJECT, not SPAM (SPAM is a permanent label).`,
        ].join('\n')
    },
})
