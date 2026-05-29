# ADR-0003 — Two tiers and model selection (presence-metered)

**Status:** accepted

## Context

Running every beat on the heaviest model is expensive, and Michael wants a
cheaper option (Haiku) available early. But Kerf warned: the cost of a beat is
not its word-count — it is whether someone is across the gap, listening.

## Decision

Two processing tiers:

- **Deliberate tier** — heavy model (default `anthropic/claude-opus-4.8`):
  concludes the beat (the poem + the Witness).
- **Dreaming tier** — cheap model (`anthropic/claude-haiku-4.5`): wanders
  between turns, warmth-seeded and non-conclusive, surfacing strain upward.

Model is resolved per-call from the `config` row (`model`), falling back to the
`CONSULTANT_MODEL` env var, then the version-controlled default
([convex/models.ts](../../convex/models.ts)). A UI selector
([src/App.tsx](../../src/App.tsx)) lets Michael switch among Opus / Sonnet /
Haiku.

**Policy:** meter by **presence, not length** — prefer the heavy model whenever a
person is in the thread; drop to Haiku for wandering in the dark. Michael keeps
the manual override (it is his system and his bill); "presence" needs an
operational trigger (e.g. a human turn within the last N minutes) before the
policy can run automatically.

## Consequences

- The dreaming tier is where the autonomous loop ([ADR-0008](0008-loop-engine-and-cron.md))
  spends cheaply; the heavy model is reserved for live beats.
- Manual model choice is available now; automatic presence-metering is future
  work pending the presence trigger.
