# trott-conformance

Conformance test suite for TROTT protocol implementations. Validates Nostr events against TROTT schemas and verifies state machine transitions using machine-readable JSON fixtures.

Any language can consume the fixtures; the CLI provides a reference runner with TAP output.

## Quick start

```bash
npx trott-conformance
```

Or install locally:

```bash
pnpm add -D trott-conformance
pnpm trott-conformance
```

## CLI flags

| Flag | Description |
|------|-------------|
| `--schema` | Run schema validation tests only |
| `--state-machine` | Run state machine transition tests only |
| `--domain <name>` | Filter fixtures by domain (e.g. `ridesharing`) |
| `--fixtures <path>` | Load additional fixtures from a custom directory |

Examples:

```bash
# Schema tests only
npx trott-conformance --schema

# Ridesharing state machine tests only
npx trott-conformance --state-machine --domain ridesharing

# Include your own fixtures alongside built-in ones
npx trott-conformance --fixtures ./my-fixtures
```

## Output

The CLI produces [TAP version 14](https://testanything.org/) output, compatible with any TAP consumer:

```
TAP version 14
1..23
ok 1 - events/30530-quote-valid: pass (expected pass)
not ok 2 - events/30530-quote-missing-amount: pass (expected fail)
  ---
  message: Expected fail but schema accepted the event
  ...
```

Exit code is 0 when all expectations match, 1 otherwise.

## Fixture formats

### Event fixtures

Event fixtures live in `fixtures/events/` and test schema validation. Each file is a JSON object:

```json
{
  "sdkVersion": "1.1.0",
  "description": "Valid quote event with all required tags",
  "kind": 30530,
  "expect": "pass",
  "event": {
    "kind": 30530,
    "content": "{\"line_items\":[{\"description\":\"Service fee\",\"amount\":1000}]}",
    "pubkey": "aaaa...64 hex chars",
    "created_at": 1700000000,
    "id": "bbbb...64 hex chars",
    "sig": "cccc...128 hex chars",
    "tags": [
      ["d", "task-id:quote:pubkey"],
      ["amount", "1000"],
      ["currency", "GBP"]
    ]
  }
}
```

For invalid fixtures, add `"expect": "fail"` and optionally a `"reason"` field explaining which validation rule should reject the event.

### Sequence fixtures

Sequence fixtures live in `fixtures/sequences/` and test state machine transitions. Each file is a JSON object:

```json
{
  "sdkVersion": "1.1.0",
  "description": "Full ride lifecycle",
  "domain": "ridesharing",
  "expect": "pass",
  "statuses": [
    "requested",
    "accepted",
    "provider_en_route",
    "provider_arrived",
    "trip_active",
    "completed"
  ]
}
```

Set `"expect": "fail"` for sequences that should be rejected (e.g. invalid transitions, skipped states).

## Using fixtures from other languages

The JSON fixtures are self-contained and language-agnostic. To use them in your own test suite:

1. Copy or reference the `fixtures/` directory.
2. Parse each JSON file.
3. For event fixtures: validate `event` against your schema implementation for the given `kind`. Compare result to `expect`.
4. For sequence fixtures: walk the `statuses` array through your state machine for the given `domain`. Compare result to `expect`.

No dependency on the TypeScript SDK is required; the fixtures define the expected behaviour independently.

## Current coverage

### Schema validation (event fixtures)

| Kind | Name | Valid | Invalid |
|------|------|:-----:|:-------:|
| 30510 | Provider Profile | yes | yes |
| 30520 | Task Rating | yes | yes |
| 30530 | Quote | yes | yes |
| 30535 | Payment Receipt | yes | yes |
| 30600 | Vehicle Details (ridesharing) | yes | yes |
| 30601 | Trip Start (ridesharing) | yes | - |
| 30602 | Trip End (ridesharing) | yes | - |
| 30603 | Fare Calculation (ridesharing) | yes | - |

### State machine transitions (sequence fixtures)

| Domain | Sequences |
|--------|-----------|
| core | basic-lifecycle, cancellation-from-accepted, cancellation-from-requested, dispute-from-completed, invalid-backwards-transition, invalid-skip-accepted, no-show |
| ridesharing | full-ride, invalid-skip-en-route, rider-no-show |

## Licence

MIT
