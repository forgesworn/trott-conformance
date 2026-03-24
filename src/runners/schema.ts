import * as schemas from '@trott/sdk/generated/schemas'
import type { EventFixture, TestResult } from '../types.js'

// Build kind -> schema lookup.
// Duck-type check: instanceof may not work across bundled zod instances,
// so we check for safeParse as a function instead.
const schemaMap = new Map<number, { safeParse: (data: unknown) => { success: boolean; error?: { issues: Array<{ message: string }> } } }>()

for (const [name, value] of Object.entries(schemas)) {
  const match = name.match(/^kind(\d+)\w+Schema$/)
  if (match && value && typeof (value as Record<string, unknown>).safeParse === 'function') {
    schemaMap.set(Number(match[1]), value as typeof schemaMap extends Map<number, infer V> ? V : never)
  }
}

export function runSchemaTests(fixtures: Array<EventFixture & { name: string }>): TestResult[] {
  return fixtures.map(fixture => {
    const schema = schemaMap.get(fixture.kind)
    if (!schema) {
      return {
        name: fixture.name,
        status: 'skip' as const,
        expected: fixture.expect,
        message: `No schema for kind ${fixture.kind}`
      }
    }

    const result = schema.safeParse(fixture.event)
    const actual = result.success ? 'pass' : 'fail'

    if (actual === fixture.expect) {
      return { name: fixture.name, status: actual, expected: fixture.expect }
    }

    const message = result.success
      ? 'Expected fail but schema accepted the event'
      : `Expected pass but schema rejected: ${result.error?.issues.map(i => i.message).join('; ')}`

    return { name: fixture.name, status: actual, expected: fixture.expect, message }
  })
}
