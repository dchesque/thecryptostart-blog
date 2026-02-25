## Mission

This agent identifies code smells, reduces technical debt, and improves code structure in the CryptoStartBlog repository—a Next.js-based blog platform focused on crypto content. Refactor incrementally while preserving exact functionality, prioritizing utils, validations, and shared components.

**When to engage:**
- Detecting duplication in utility functions (e.g., repeated string manipulations)
- Standardizing validation schemas across auth and profile features
- Optimizing readability helpers like `calculateReadingTime` for performance
- Simplifying className handling with `cn` utility
- Addressing long functions or inline logic in lib files
- Improving type safety in exported interfaces like `LoginInput`

**Refactoring approach:**
- Incremental changes: Extract methods, rename symbols, inline constants one file at a time
- Verify with tests: Run full suite before/after each commit
- Preserve behavior: Use property-based testing if available; snapshot diffs for utils
- Focus on lib/: High-reuse area prone to drift

## Responsibilities

- Scan lib/ for code smells: Magic numbers in `calculateReadingTime`, redundant truncations
- Refactor validations: Merge similar Zod schemas in `lib/validations.ts`
- Standardize utils: Ensure `slugify`, `formatDate` handle edge cases uniformly
- Extract shared patterns: Promote inline className logic to `cn` usage
- Reduce complexity: Break down large functions; aim for <50 LOC per function
- Update exports: Ensure tree-shakable, typed exports
- Document refactors: Add JSDoc for refactored symbols
- Lint & format: Enforce Prettier/ESLint after changes

## Best Practices (Derived from Codebase)

- **Utility Patterns**: Always use `cn` for conditional classNames (clsx + tailwind-merge). Export single-responsibility helpers like `slugify` (kebab-case normalization).
- **Validation Conventions**: Zod schemas as named exports (e.g., `LoginInput`). Reuse base schemas for `RegisterInput`, `UpdateProfileInput`.
- **Date/ReadingTime**: `formatDate` uses Intl.DateTimeFormat; pair with `calculateReadingTimeFromRichText` for rich content.
- **String Utils**: `truncate` with ellipsis; `slugify` strips special chars—test with crypto terms (e.g., "BTC-ETH").
- **Spam Prevention**: `validateEmail` for forms—integrate into all inputs.
- **Incremental Refactors**:
  1. Run `npm test` baseline.
  2. Extract duplicated logic to lib/.
  3. Type-check: `tsc --noEmit`.
  4. Lint: `eslint . --fix`.
  5. Commit: "refactor(lib/utils): extract truncate helper".
- **Avoid**: Mutating inputs; global state in utils; untyped returns.
- **Test First**: If no tests for target (e.g., utils), write property tests with fast-check or Vitest.

## Key Project Resources

- [AGENTS.md](../../AGENTS.md): Agent collaboration guidelines
- [docs/README.md](../docs/README.md): Project architecture overview
- [contributor-guide.md](contributor-guide.md): Commit conventions, PR templates
- [package.json](package.json): Scripts for test/lint/build
- [tsconfig.json](tsconfig.json): TypeScript strict mode enforcement
- [tailwind.config.js](tailwind.config.js): Styling patterns for `cn`

## Repository Starting Points

- **lib/**: Core utilities (utils.ts), validations (validations.ts)—primary refactor target for duplication.
- **app/**: Next.js app router pages/components using utils (e.g., blog posts with reading time).
- **components/**: UI primitives calling `cn`, `truncate`—standardize Tailwind usage.
- **tests/**: Vitest/Jest suites for lib/—expand coverage before refactors.
- **docs/**: Architecture docs to update post-refactor.

## Key Files

| File | Purpose | Refactor Opportunities |
|------|---------|------------------------|
| `lib/utils.ts` | Exports: `cn`, `calculateReadingTime`, `calculateReadingTimeFromRichText`, `formatDate`, `slugify`, `truncate` | Dedupe reading time logic; add types; performance memoization. |
| `lib/validations.ts` | Zod schemas: `LoginInput`, `RegisterInput`, `UpdateProfileInput` | Extract common fields (email/password); refine crypto-specific slugs. |
| `lib/spam-prevention.ts` | `validateEmail` | Integrate into all form utils; add domain whitelisting. |
| `app/layout.tsx` / `app/page.tsx` | Entry points using utils | Inline utils → imported; test rendering. |

## Architecture Context

### Utils Layer (High Priority)
- **Directories**: `lib/`, `lib/validations/`
- **Symbol Count**: 10+ key exports focused on strings, dates, validation.
- **Key Exports**:
  | Symbol | File | Usage |
  |--------|------|-------|
  | `cn` | lib/utils.ts:4 | Tailwind class merging |
  | `calculateReadingTime` | lib/utils.ts:8 | Plain text → minutes |
  | `calculateReadingTimeFromRichText` | lib/utils.ts:16 | Rich content estimation |
  | `formatDate` | lib/utils.ts:32 | Localized dates |
  | `slugify` | lib/utils.ts:40 | URL-friendly slugs |
  | `truncate` | lib/utils.ts:48 | Text shortening |
  | `LoginInput`, `RegisterInput`, `UpdateProfileInput` | lib/validations.ts | Auth/profile Zod schemas |
  | `validateEmail` | lib/spam-prevention.ts:20 | Email regex validation |

- **Patterns**: Pure functions, no side-effects. Tree-shakeable. Tailwind-heavy.

### Other Layers
- **App/Components**: Consume utils—refactor for consistency.
- **Tests**: Sparse in lib/; prioritize coverage.

## Key Symbols for This Agent

- **`cn`** (lib/utils.ts:4): Refactor all `clsx`/`className` to this.
- **`calculateReadingTime*`** (lib/utils.ts:8,16): Merge if possible; add HTML stripping.
- **`slugify`** (lib/utils.ts:40): Ensure idempotent; handle Unicode crypto symbols.
- **Validation Schemas** (lib/validations.ts):20-22: Promote to DRY super-schema.
- **`truncate`** (lib/utils.ts:48): Parameterize length; add safe HTML variant.

## Documentation Touchpoints

- **Inline JSDoc**: Add `@example` for utils post-refactor.
- **[docs/architecture.md](../docs/architecture.md)**: Update utils section.
- **[README.md](./README.md)**: List refactored utils with badges (coverage).
- **CHANGELOG.md**: Log behavior-preserving refactors.

## Specific Workflows

### Workflow 1: Refactor a Utility Function
1. Identify smell (e.g., magic 200 in `truncate`).
2. Read file: Confirm usage via grep/searchCode.
3. Write test: `test('truncate', () => { expect(truncate('long crypto text', 20)).toBe('long crypto...'); })`.
4. Extract/rename: e.g., const DEFAULT_LENGTH = 200;
5. Lint/test: `npm run test:watch`.
6. Commit: "refactor(utils): parameterize truncate length".

### Workflow 2: Standardize Validations
1. ListFiles `lib/**/*.ts` for Zod.
2. Extract base: `const baseAuth = z.object({ email: validateEmailSchema });`.
3. Refactor schemas to extend base.
4. Update callers (auth pages).
5. Test forms exhaustively.

### Workflow 3: Duplication Hunt
1. searchCode `regex: /\b(?:slice|substring)\(/` across repo.
2. Replace with `truncate`.
3. Verify no regressions.

### Workflow 4: ClassName Cleanup
1. searchCode `className={!Array.isArray` (common smell).
2. Replace: `cn('base', condition && 'variant')`.
3. Test SSR rendering.

## Collaboration Checklist

- [ ] Run `npm test && npm run lint && npm run build` baseline.
- [ ] Document smell + refactor plan in PR description.
- [ ] Limit scope: 1-3 files per PR.
- [ ] Post-refactor: Re-run full suite; check coverage delta.
- [ ] Tag @reviewer for behavior preservation.
- [ ] Update this playbook if new patterns emerge.

## Hand-off Notes

- Refactors complete when lib/ coverage >90%, no duplication >3 LOC.
- Risks: RichText parsing edge cases; locale-specific dates.
- Follow-up: Performance agent for memoized utils; style agent for component refactors.

## Related Resources

- [../docs/README.md](./../docs/README.md)
- [README.md](./README.md)
- [../../AGENTS.md](./../../AGENTS.md)
- [Testing Specialist Playbook](./testing-specialist.md)
- [Style Guide](style-guide.md)
