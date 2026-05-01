import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import { jsonText, markdownText } from './helpers.js'

// Unwrap helper for tests: helpers.ts keeps zodToJsonSchema private,
// but we can verify it via the public surface (registerTool→ListTools)
// in an integration test if needed. For now, focus on jsonText/markdownText.

describe('jsonText', () => {
    it('wraps a value in MCP content shape with pretty JSON', () => {
        const out = jsonText({ a: 1 })
        expect(out).toEqual({
            content: [{ type: 'text', text: '{\n  "a": 1\n}' }],
        })
    })

    it('handles primitives', () => {
        expect(jsonText('hi')).toEqual({ content: [{ type: 'text', text: '"hi"' }] })
        expect(jsonText(42)).toEqual({ content: [{ type: 'text', text: '42' }] })
        expect(jsonText(null)).toEqual({ content: [{ type: 'text', text: 'null' }] })
    })

    it('handles arrays', () => {
        const out = jsonText([1, 2, 3])
        expect(out.content[0].text).toBe('[\n  1,\n  2,\n  3\n]')
    })
})

describe('markdownText', () => {
    it('wraps a string in MCP content shape', () => {
        expect(markdownText('# Hi')).toEqual({
            content: [{ type: 'text', text: '# Hi' }],
        })
    })
})

// Integration smoke: ensure the registry binding is at least syntactically
// callable on a stand-in Server. We dynamic-import to avoid pulling MCP SDK
// types into the smoke layer.
describe('registerTool smoke', () => {
    it('does not throw when registering a tool with a Zod schema', async () => {
        const { registerTool } = await import('./helpers.js')
        const fakeServer = {} as any // registerTool only uses the registry
        expect(() => {
            registerTool(fakeServer, {
                name: 'test.echo',
                description: 'echo',
                inputSchema: z.object({ msg: z.string() }),
                handler: async ({ msg }) => ({ content: [{ type: 'text' as const, text: msg }] }),
            })
        }).not.toThrow()
    })
})
