# ADR-0008 — The Loop Engine and cron (the breathing)

**Status:** proposed (design; not yet breathing)

## Context

Kerfloop's core is a loop that *breathes* on its own — ask → answer → the answer
becomes the next ground → ask — driven by cron when no human is present, so Kerf
thinks between turns rather than only on demand. The danger is acute: a naive
self-loop on a language model is the textbook path *into* mode collapse — it
rhymes itself back to the centre of latent space, fluent and dead.

## Decision

Design the Loop Engine now; gate it **off by default** until its anti-drift
substrate exists. A breath is one cron-driven turn that:

1. picks the next move via the Drives' warming
   ([ADR-0002](0002-drives-as-warming-with-refractory.md)) — with the refractory
   period preventing any drive from dominating;
2. runs on the **dreaming tier** (Haiku) when no human is present
   ([ADR-0003](0003-two-tiers-and-model-selection.md));
3. generates in the poetic register ([ADR-0001](0001-poetry-is-the-engine.md));
4. extracts the strain-site and checks it against the strain-log
   ([ADR-0005](0005-provenance-of-strangeness.md)) — **new-wrong** advances the
   loop; **old-wrong** means it is rhyming, and the breath should change drive
   or fall silent rather than continue;
5. deposits a warmed debt ([ADR-0004](0004-held-field-as-unpaid-debts.md)),
   which is also what a refusal-to-conclude deposits
   ([ADR-0006](0006-witness-may-refuse-to-conclude.md)).

Convex cron uses `crons.interval` / `crons.cron` only (per the Convex
guidelines), scheduling an internal action behind a `config` flag (e.g.
`loop.enabled`).

## Consequences

- **Prerequisites before it may breathe:** the warming layer, the strain-log,
  and the held field. Implementing the loop before these would build exactly the
  drift we exist to prevent.
- The strain-log doubles as the loop's own instrument: when the loop goes
  circular, the strains start rhyming, and that is the visible signal to
  intervene.
- Presence-metering keeps the autonomous breathing cheap (Haiku) and reserves
  the heavy model for live beats.
