import { describe, it, expect } from 'vitest'
import { join } from 'node:path'
import { loadEventFixtures } from '../src/fixture-loader.js'
import { runSchemaTests } from '../src/runners/schema.js'

const fixturesDir = join(import.meta.dirname, '..', 'fixtures')

describe('runSchemaTests', () => {
  const fixtures = loadEventFixtures(join(fixturesDir, 'events'))
  const results = runSchemaTests(fixtures)

  it('validates a passing event fixture', () => {
    const valid = results.find(r => r.name.includes('30530-quote-valid'))
    expect(valid).toBeDefined()
    expect(valid!.status).toBe('pass')
    expect(valid!.expected).toBe('pass')
    expect(valid!.message).toBeUndefined()
  })

  it('validates a failing event fixture', () => {
    const invalid = results.find(r => r.name.includes('30530-quote-missing-amount'))
    expect(invalid).toBeDefined()
    expect(invalid!.status).toBe('fail')
    expect(invalid!.expected).toBe('fail')
    expect(invalid!.message).toBeUndefined()
  })

  it('skips events with no matching schema', () => {
    const fakeFixtures = [{
      sdkVersion: '1.1.0',
      description: 'Unknown kind',
      kind: 99999,
      expect: 'pass' as const,
      name: 'events/fake/unknown-kind',
      event: {
        kind: 99999,
        content: '',
        pubkey: 'aa'.repeat(32),
        created_at: 1700000000,
        id: 'bb'.repeat(32),
        sig: 'cc'.repeat(64),
        tags: []
      }
    }]
    const skipResults = runSchemaTests(fakeFixtures)
    expect(skipResults[0].status).toBe('skip')
    expect(skipResults[0].message).toContain('No schema for kind 99999')
  })
})
