# trott-conformance

Conformance test suite for TROTT protocol implementations. Validates Nostr
events against TROTT schemas and verifies state machine transitions using
machine-readable JSON fixtures. The fixtures are language-agnostic: the CLI is
a reference runner with TAP output, but any language can consume the
`fixtures/` directory directly.

## Build & test

| Command | Purpose |
|---------|---------|
| `pnpm install` | Install dependencies |
| `pnpm run build` | Compile TypeScript with `tsc` (also type-checks) |
| `pnpm test` | Run the test suite (`vitest run`) |
| `pnpm start` | Run the CLI from source via `tsx` |

There is no separate lint or typecheck script; `tsc` performs type-checking as
part of `build`.

## Structure

```
src/
  cli.ts               entry point, parses --schema/--state-machine/--domain/--fixtures
  fixture-loader.ts     loads event and sequence fixtures from a directory
  types.ts              EventFixture, SequenceFixture, TestResult
  runners/schema.ts      runs event fixtures against schema validation
  runners/state-machine.ts  runs sequence fixtures against state machine transitions
__tests__/              vitest test files
fixtures/
  events/                event fixtures, by domain
  sequences/              sequence fixtures, by domain
```

## Conventions

- British English in prose and comments.
- Fixtures are plain JSON, not TypeScript, so they stay usable from any
  language's test suite.
- Each fixture has an `expect: 'pass' | 'fail'` field; invalid fixtures should
  also carry a `reason`.

## Common pitfalls

- The CLI resolves the built-in fixtures relative to `dist/cli.js`
  (`join(__dirname, '..', 'fixtures')`), so `pnpm run build` must run before
  the fixtures directory is reachable via the compiled entry point.
- `--fixtures <path>` only adds a directory if it exists (`existsSync`); a
  missing path is silently ignored, not an error.
- The `@trott/sdk` dependency is a local `file:` reference; it is not resolved
  from the npm registry.

## Verifying a change

Run `pnpm run build` and `pnpm test` before committing.
