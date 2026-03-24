import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import type { EventFixture, SequenceFixture } from './types.js'

function findJsonFiles(dir: string): Array<{ path: string; name: string }> {
  const results: Array<{ path: string; name: string }> = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      results.push(...findJsonFiles(full))
    } else if (entry.endsWith('.json')) {
      const relative = full.replace(dir + '/', '')
      results.push({ path: full, name: relative.replace('.json', '') })
    }
  }
  return results
}

export function loadEventFixtures(dir: string): Array<EventFixture & { name: string }> {
  return findJsonFiles(dir).map(({ path, name }) => {
    const data = JSON.parse(readFileSync(path, 'utf-8')) as EventFixture
    return { ...data, name: `events/${name}` }
  })
}

export function loadSequenceFixtures(dir: string): Array<SequenceFixture & { name: string }> {
  return findJsonFiles(dir).map(({ path, name }) => {
    const data = JSON.parse(readFileSync(path, 'utf-8')) as SequenceFixture
    return { ...data, name: `sequences/${name}` }
  })
}
