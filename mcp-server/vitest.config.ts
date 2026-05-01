import { defineConfig } from 'vitest/config'

export default defineConfig({
    // Disable Vite's PostCSS auto-discovery. Without this, Vitest walks up
    // the directory tree, finds the blog root's postcss.config.js, and
    // tries to load tailwindcss — which is not a dep of this workspace.
    css: { postcss: { plugins: [] } },
    test: {
        environment: 'node',
        include: ['src/**/*.test.ts'],
        reporters: 'default',
    },
})
