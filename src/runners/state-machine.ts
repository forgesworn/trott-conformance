import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import type { SequenceFixture, TestResult } from '../types.js'

interface Transition {
  target: string
  [key: string]: unknown
}

interface StateDef {
  type?: string
  on?: Record<string, Transition | Transition[]>
}

interface MachineDefinition {
  domain: string
  states: Record<string, StateDef>
}

function loadMachineDefinition(domain: string): MachineDefinition | undefined {
  // Try SDK dist first, then source
  const candidates = [
    join(import.meta.dirname, '..', '..', 'node_modules', '@trott', 'sdk', 'dist', 'state-machine', 'definitions', `${domain}.json`),
    join(import.meta.dirname, '..', '..', '..', 'trott-sdk', 'src', 'state-machine', 'definitions', `${domain}.json`),
  ]

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return JSON.parse(readFileSync(candidate, 'utf-8')) as MachineDefinition
    }
  }
  return undefined
}

function canReach(machine: MachineDefinition, state: string, nextStatus: string): boolean {
  const stateDef = machine.states[state]
  if (!stateDef?.on) return false

  for (const value of Object.values(stateDef.on)) {
    const transitions: Transition[] = Array.isArray(value) ? value : [value]
    for (const t of transitions) {
      if (t.target === nextStatus) return true
    }
  }
  return false
}

export function runStateMachineTests(fixtures: Array<SequenceFixture & { name: string }>): TestResult[] {
  return fixtures.map(fixture => {
    const machine = loadMachineDefinition(fixture.domain)
    if (!machine) {
      return {
        name: fixture.name,
        status: 'skip' as const,
        expected: fixture.expect,
        message: `No state machine definition for domain: ${fixture.domain}`
      }
    }

    const { statuses } = fixture

    if (statuses.length === 0) {
      return {
        name: fixture.name,
        status: 'fail' as const,
        expected: fixture.expect,
        message: 'Sequence has no statuses'
      }
    }

    // Validate each transition
    for (let i = 0; i < statuses.length - 1; i++) {
      const from = statuses[i]
      const to = statuses[i + 1]

      // Verify the source state exists in the machine
      if (!machine.states[from]) {
        const actual = 'fail'
        if (actual === fixture.expect) {
          return { name: fixture.name, status: actual, expected: fixture.expect }
        }
        return {
          name: fixture.name,
          status: actual,
          expected: fixture.expect,
          message: `Unknown state: ${from}`
        }
      }

      if (!canReach(machine, from, to)) {
        const actual = 'fail'
        if (actual === fixture.expect) {
          return { name: fixture.name, status: actual, expected: fixture.expect }
        }
        return {
          name: fixture.name,
          status: actual,
          expected: fixture.expect,
          message: `Invalid transition: ${from} -> ${to} (step ${i + 1})`
        }
      }
    }

    // All transitions valid
    const actual = 'pass'
    if (actual === fixture.expect) {
      return { name: fixture.name, status: actual, expected: fixture.expect }
    }

    return {
      name: fixture.name,
      status: actual,
      expected: fixture.expect,
      message: 'Expected fail but all transitions were valid'
    }
  })
}
