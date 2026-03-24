import { describe, it, expect } from 'vitest'
import { join } from 'node:path'
import { loadSequenceFixtures } from '../src/fixture-loader.js'
import { runStateMachineTests } from '../src/runners/state-machine.js'

const fixturesDir = join(import.meta.dirname, '..', 'fixtures')

describe('runStateMachineTests', () => {
  const fixtures = loadSequenceFixtures(join(fixturesDir, 'sequences'))
  const results = runStateMachineTests(fixtures)

  describe('core sequences', () => {
    it('validates basic lifecycle (pass)', () => {
      const r = results.find(r => r.name.includes('basic-lifecycle'))
      expect(r).toBeDefined()
      expect(r!.status).toBe('pass')
      expect(r!.expected).toBe('pass')
    })

    it('validates cancellation from requested (pass)', () => {
      const r = results.find(r => r.name.includes('cancellation-from-requested'))
      expect(r).toBeDefined()
      expect(r!.status).toBe('pass')
    })

    it('validates cancellation from accepted (pass)', () => {
      const r = results.find(r => r.name.includes('cancellation-from-accepted'))
      expect(r).toBeDefined()
      expect(r!.status).toBe('pass')
    })

    it('validates dispute from completed (pass)', () => {
      const r = results.find(r => r.name.includes('dispute-from-completed'))
      expect(r).toBeDefined()
      expect(r!.status).toBe('pass')
    })

    it('validates no-show (pass)', () => {
      const r = results.find(r => r.name.includes('no-show'))
      expect(r).toBeDefined()
      expect(r!.status).toBe('pass')
    })

    it('rejects invalid skip to accepted (fail)', () => {
      const r = results.find(r => r.name.includes('invalid-skip-accepted'))
      expect(r).toBeDefined()
      expect(r!.status).toBe('fail')
      expect(r!.expected).toBe('fail')
      // status matches expected, so no error message
      expect(r!.message).toBeUndefined()
    })

    it('rejects invalid backwards transition (fail)', () => {
      const r = results.find(r => r.name.includes('invalid-backwards-transition'))
      expect(r).toBeDefined()
      expect(r!.status).toBe('fail')
      expect(r!.expected).toBe('fail')
    })
  })

  describe('ridesharing sequences', () => {
    it('validates full ride (pass)', () => {
      const r = results.find(r => r.name.includes('full-ride'))
      expect(r).toBeDefined()
      expect(r!.status).toBe('pass')
      expect(r!.expected).toBe('pass')
    })

    it('validates rider no-show (pass)', () => {
      const r = results.find(r => r.name.includes('rider-no-show'))
      expect(r).toBeDefined()
      expect(r!.status).toBe('pass')
    })

    it('rejects invalid skip of en-route (fail)', () => {
      const r = results.find(r => r.name.includes('invalid-skip-en-route'))
      expect(r).toBeDefined()
      expect(r!.status).toBe('fail')
      expect(r!.expected).toBe('fail')
    })
  })

  it('skips unknown domains', () => {
    const fakeFixtures = [{
      sdkVersion: '1.1.0',
      description: 'Unknown domain',
      domain: 'nonexistent-domain',
      expect: 'pass' as const,
      name: 'sequences/fake/unknown',
      statuses: ['requested', 'accepted']
    }]
    const skipResults = runStateMachineTests(fakeFixtures)
    expect(skipResults[0].status).toBe('skip')
    expect(skipResults[0].message).toContain('No state machine definition')
  })
})
