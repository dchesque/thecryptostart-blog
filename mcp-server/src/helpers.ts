import { z } from 'zod'
import type { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js'

type ToolDef<S extends z.ZodTypeAny = z.ZodTypeAny> = {
    name: string
    description: string
    inputSchema: S
    handler: (args: z.infer<S>) => Promise<{ content: Array<{ type: 'text'; text: string }> }>
}

const registry = new Map<string, ToolDef>()

export function registerTool<S extends z.ZodTypeAny>(_server: Server, def: ToolDef<S>) {
    registry.set(def.name, def as unknown as ToolDef)
}

export function bindRegistryToServer(server: Server) {
    server.setRequestHandler(ListToolsRequestSchema, async () => {
        const tools = Array.from(registry.values()).map((t) => ({
            name: t.name,
            description: t.description,
            inputSchema: zodToJsonSchema(t.inputSchema),
        }))
        return { tools }
    })

    server.setRequestHandler(CallToolRequestSchema, async (req) => {
        const def = registry.get(req.params.name)
        if (!def) throw new Error(`Unknown tool: ${req.params.name}`)
        const args = def.inputSchema.parse(req.params.arguments ?? {})
        return def.handler(args)
    })
}

export function jsonText(value: unknown) {
    return {
        content: [{ type: 'text' as const, text: JSON.stringify(value, null, 2) }],
    }
}

export function markdownText(text: string) {
    return { content: [{ type: 'text' as const, text }] }
}

/**
 * Defense against an LLM accidentally deleting content.
 * The caller must pass `confirm` equal to literally "DELETE <slug>".
 * Throws a structured error otherwise.
 */
export function requireDeleteConfirm(slug: string, confirm: string): void {
    const expected = `DELETE ${slug}`
    if (confirm !== expected) {
        throw new Error(`Refusing to delete: confirm must equal exactly "${expected}".`)
    }
}

/**
 * Minimal Zod → JSON Schema conversion. We only need shapes the MCP client
 * uses to build the tool form. Avoids pulling zod-to-json-schema as a dep.
 */
function zodToJsonSchema(schema: z.ZodTypeAny): any {
    const def = (schema as any)._def
    if (!def) return {}

    if (schema instanceof z.ZodObject) {
        const props: Record<string, any> = {}
        const required: string[] = []
        const shape = (schema as any).shape
        for (const [k, v] of Object.entries(shape)) {
            const sub = v as z.ZodTypeAny
            props[k] = zodToJsonSchema(sub)
            if (!(sub.isOptional() || sub instanceof z.ZodDefault)) required.push(k)
        }
        return { type: 'object', properties: props, ...(required.length ? { required } : {}), additionalProperties: false }
    }
    if (schema instanceof z.ZodString) return { type: 'string' }
    if (schema instanceof z.ZodNumber) return { type: 'number' }
    if (schema instanceof z.ZodBoolean) return { type: 'boolean' }
    if (schema instanceof z.ZodArray) return { type: 'array', items: zodToJsonSchema((schema as any).element) }
    if (schema instanceof z.ZodEnum) return { type: 'string', enum: (schema as any).options }
    if (schema instanceof z.ZodOptional) return zodToJsonSchema((schema as any).unwrap())
    if (schema instanceof z.ZodDefault) {
        const inner = zodToJsonSchema((schema as any)._def.innerType)
        return { ...inner, default: def.defaultValue() }
    }
    if (schema instanceof z.ZodLiteral) return { const: (schema as any).value }
    if (schema instanceof z.ZodUnion) return { anyOf: (schema as any).options.map(zodToJsonSchema) }
    return {}
}
