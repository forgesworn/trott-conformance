import { describe, it, expect } from 'vitest'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadEventFixtures, loadSequenceFixtures } from '../src/fixture-loader.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const fixturesDir = join(__dirname, '..', 'fixtures')

describe('loadEventFixtures', () => {
  it('loads all event fixture JSON files', () => {
    const fixtures = loadEventFixtures(join(fixturesDir, 'events'))
    expect(fixtures.length).toBeGreaterThanOrEqual(2)

    const valid = fixtures.find(f => f.name.includes('30530-quote-valid'))
    expect(valid).toBeDefined()
    expect(valid!.kind).toBe(30530)
    expect(valid!.expect).toBe('pass')
    expect(valid!.event.tags.length).toBeGreaterThan(0)

    const invalid = fixtures.find(f => f.name.includes('30530-quote-missing-amount'))
    expect(invalid).toBeDefined()
    expect(invalid!.expect).toBe('fail')
  })
})

describe('loadSequenceFixtures', () => {
  it('loads all sequence fixture JSON files', () => {
    const fixtures = loadSequenceFixtures(join(fixturesDir, 'sequences'))
    expect(fixtures.length).toBeGreaterThanOrEqual(1)

    const lifecycle = fixtures.find(f => f.name.includes('basic-lifecycle'))
    expect(lifecycle).toBeDefined()
    expect(lifecycle!.domain).toBe('core')
    expect(lifecycle!.statuses).toEqual([
      'requested', 'offers_open', 'accepted', 'in_progress', 'completed', 'confirmed'
    ])
  })
})
