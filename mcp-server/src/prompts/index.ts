import type { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { GetPromptRequestSchema, ListPromptsRequestSchema } from '@modelcontextprotocol/sdk/types.js'

type PromptDef = {
    name: string
    description: string
    arguments: Array<{ name: string; description: string; required?: boolean }>
    build: (args: Record<string, string>) => string
}

const prompts: PromptDef[] = []

export function registerPrompt(p: PromptDef) {
    prompts.push(p)
}

export function bindPromptsToServer(server: Server) {
    server.setRequestHandler(ListPromptsRequestSchema, async () => ({
        prompts: prompts.map(({ name, description, arguments: args }) => ({
            name,
            description,
            arguments: args,
        })),
    }))

    server.setRequestHandler(GetPromptRequestSchema, async (req) => {
        const def = prompts.find((p) => p.name === req.params.name)
        if (!def) throw new Error(`Unknown prompt: ${req.params.name}`)
        const args = (req.params.arguments ?? {}) as Record<string, string>
        return {
            description: def.description,
            messages: [
                {
                    role: 'user',
                    content: { type: 'text', text: def.build(args) },
                },
            ],
        }
    })
}
