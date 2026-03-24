#!/usr/bin/env node
import { join, dirname } from 'node:path'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { loadEventFixtures, loadSequenceFixtures } from './fixture-loader.js'
import { runSchemaTests } from './runners/schema.js'
import { runStateMachineTests } from './runners/state-machine.js'
import type { TestResult } from './types.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const args = process.argv.slice(2)

const schemaOnly = args.includes('--schema')
const smOnly = args.includes('--state-machine')
const domainIdx = args.indexOf('--domain')
const domainFlag = domainIdx >= 0 ? args[domainIdx + 1] : undefined
const fixturesIdx = args.indexOf('--fixtures')
const fixturesFlag = fixturesIdx >= 0 ? args[fixturesIdx + 1] : undefined

const builtinFixtures = join(__dirname, '..', 'fixtures')
const fixturesDirs = [builtinFixtures]
if (fixturesFlag && existsSync(fixturesFlag)) {
  fixturesDirs.push(fixturesFlag)
}

const allResults: TestResult[] = []

if (!smOnly) {
  for (const dir of fixturesDirs) {
    const eventsDir = join(dir, 'events')
    if (!existsSync(eventsDir)) continue
    let fixtures = loadEventFixtures(eventsDir)
    if (domainFlag) {
      fixtures = fixtures.filter(f => f.name.includes(domainFlag))
    }
    allResults.push(...runSchemaTests(fixtures))
  }
}

if (!schemaOnly) {
  for (const dir of fixturesDirs) {
    const seqDir = join(dir, 'sequences')
    if (!existsSync(seqDir)) continue
    let fixtures = loadSequenceFixtures(seqDir)
    if (domainFlag) {
      fixtures = fixtures.filter(f => f.domain === domainFlag || f.name.includes(domainFlag))
    }
    allResults.push(...runStateMachineTests(fixtures))
  }
}

// TAP output
console.log('TAP version 14')
console.log(`1..${allResults.length}`)

let failures = 0
allResults.forEach((r, i) => {
  const num = i + 1
  if (r.status === 'skip') {
    console.log(`ok ${num} # skip - ${r.name}: ${r.message}`)
    return
  }

  const match = r.status === r.expected
  if (match) {
    console.log(`ok ${num} - ${r.name}: ${r.status} (expected ${r.expected})`)
  } else {
    failures++
    console.log(`not ok ${num} - ${r.name}: ${r.status} (expected ${r.expected})`)
    if (r.message) {
      console.log('  ---')
      console.log(`  message: ${r.message}`)
      console.log('  ...')
    }
  }
})

process.exit(failures > 0 ? 1 : 0)
