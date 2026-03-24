export interface EventFixture {
  sdkVersion: string
  description: string
  kind: number
  expect: 'pass' | 'fail'
  reason?: string
  event: {
    kind: number
    content: string
    pubkey: string
    created_at: number
    id: string
    sig: string
    tags: string[][]
  }
}

export interface SequenceFixture {
  sdkVersion: string
  description: string
  domain: string
  expect: 'pass' | 'fail'
  reason?: string
  statuses: string[]
}

export interface TestResult {
  name: string
  status: 'pass' | 'fail' | 'skip'
  expected: 'pass' | 'fail'
  message?: string
}
