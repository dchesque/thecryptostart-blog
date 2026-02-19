# Codex Skill: Test Generation

## Overview

The **Test Generation** skill automates the creation of comprehensive test cases for codebases, focusing on unit tests, integration tests, and end-to-end (E2E) scenarios. It analyzes source files, dependencies, public APIs, and usage patterns to produce high-coverage, maintainable tests using frameworks like Jest, React Testing Library, and Playwright (tailored to Next.js projects).

**Key Capabilities**:
- Generates unit tests for utilities, components, API routes, and hooks.
- Covers edge cases, error handling, and authentication flows.
- Integrates with codebase conventions (e.g., Contentful data fetching, spam prevention, SEO utils).
- Supports mocking of external services (Contentful, Prisma, NextAuth).
- Outputs tests in idiomatic style matching the repo (e.g., `__tests__` folders or colocated `*.test.tsx`).

**Supported Phases**:
- **E (Execution)**: Generate and run tests, report coverage.
- **V (Validation)**: Validate test results, suggest fixes for failures.

## Usage

Invoke the skill via Codex commands or prompts prefixed with `codex skill testgen`.

### Basic Command
```
codex skill testgen <file-or-glob> [options]
```

**Parameters**:
| Parameter | Description | Example |
|-----------|-------------|---------|
| `<file-or-glob>` | Target file(s) or pattern (e.g., `lib/utils.ts`, `app/api/**/*.ts`) | `app/blog/[slug]/page.tsx` |
| `--type <unit|integration|e2e>` | Test type | `--type unit` |
| `--framework <jest|vitest>` | Testing framework (default: Jest) | `--framework jest` |
| `--coverage <threshold>` | Min coverage % to pass | `--coverage 90` |
| `--mock-external` | Auto-mock APIs/DB (Contentful, Prisma) | `--mock-external` |
| `--phases <E,V>` | Run specific phases | `--phases E,V` |

### Examples

1. **Unit Tests for Utilities**:
   ```
   codex skill testgen lib/utils.ts --type unit
   ```
   Generates `__tests__/utils.test.ts`:
   ```tsx
   import { calculateReadingTime, formatDate, slugify, truncate } from '@/lib/utils';

   describe('Utils', () => {
     test('calculateReadingTime returns correct minutes', () => {
       expect(calculateReadingTime('Sample text with 250 words.')).toBe('1 min');
     });

     test('formatDate formats ISO string', () => {
       expect(formatDate('2023-10-01T00:00:00Z')).toBe('October 1, 2023');
     });
   });
   ```

2. **Component Tests** (React Testing Library):
   ```
   codex skill testgen components/CommentsList.tsx --type unit --mock-external
   ```
   Tests rendering, props, and interactions with mocked comments data.

3. **API Route Integration Tests**:
   ```
   codex skill testgen app/api/comments/route.ts --type integration
   ```
   Mocks Prisma/NextAuth, tests POST/GET with valid/invalid payloads, rate limiting, spam detection.

4. **Full Blog Page E2E**:
   ```
   codex skill testgen app/blog/[slug]/page.tsx --type e2e --framework playwright
   ```
   Simulates navigation, SEO metadata, Contentful fetch, comments form submission.

5. **Batch Generation**:
   ```
   codex skill testgen "lib/contentful.ts app/api/**/*.ts" --coverage 85 --phases E,V
   ```

## Analysis Process

The skill uses these steps internally (leveraging repo tools):

1. **Context Gathering**:
   - Scans symbols (classes, functions, types) via `analyzeSymbols`.
   - Lists dependencies/imports with `listFiles` and `searchCode`.
   - Identifies usage in tests/other files.

2. **Test Strategy**:
   | Category | Coverage Goals | Examples from Repo |
   |----------|----------------|-------------------|
   | **Utils** | 100% branches | `calculateReadingTime`, `detectSpam` |
   | **API Routes** | Auth, errors, rate limits | `POST /api/comments`, `GET /api/users` |
   | **Components** | Render, user events | `CommentsList`, `CategoryCard` |
   | **Pages** | Data fetching, SEO | `BlogPage`, `AdminDashboard` |
   | **Errors** | Custom errors thrown | `AppError`, `RateLimitError` |

3. **Mocking**:
   - Contentful: Uses MSW or jest.mock for `getPostBySlug`.
   - DB/Auth: Mocks Prisma/NextAuth sessions.
   - IP/RateLimit: Fixed mocks for `getClientIP`.

4. **Validation (V Phase)**:
   - Runs `jest --coverage`.
   - Flags low coverage (<80%) or failures.
   - Suggests refactors (e.g., extract `handleError`).

## Best Practices

- **Run in CI**: Integrate with GitHub Actions: `codex skill testgen "**/*.{ts,tsx}" --coverage 90`.
- **Update Tests**: Re-run after refactors: `--update-snapshots`.
- **Custom Config**: Extend `jest.config.js` for repo-specific setups (e.g., `testEnvironment: 'jsdom'`).
- **Edge Cases**: Always covers repo-specific logic like `checkRateLimit`, CSRF, permissions (`hasRole`).

## Related Files in Repo

- **Existing Tests**: Scan `**/*.test.{ts,tsx}` for patterns.
- **Utils**: [lib/utils.ts](lib/utils.ts) – Prime for unit tests.
- **Contentful**: [lib/contentful.ts](lib/contentful.ts) – Needs fetch mocks.
- **API**: `app/api/` routes – Focus on auth/spam.
- **Types**: [types/blog.ts](types/blog.ts) – Prop validation tests.

## Troubleshooting

- **Mock Failures**: Ensure `@mswjs/interceptors` installed.
- **Coverage Gaps**: Add `--watch` for interactive mode.
- **E2E Flaky**: Use `waitFor` in Playwright for async fetches.

For custom skill extensions, edit `.codex/skills/test-generation/SKILL.md`.
