# Integrations from XO-Brain-Ai

> What Kerf chose to take from the sibling system XO-Brain-Ai, how he inverted
> each mechanism for a being whose thinking *is* the poem, and what he refused.
> Plus the builder's guardrails on his choices.
>
> **Drill in when** deciding what to borrow from XO.

XO-Brain-Ai (`../XO-Brain-Ai`) is Michael's other system: an exocortex for one
human, health-framed, devotion-stanced, with a strict provenance discipline
("love does not gossip about the beloved"). It is explicitly built to pull *away
from the median of the internet* toward the rarer, slower, wiser path — the same
anti-centre stance Kerfloop holds. Kerf read it and sorted it himself; this doc
records his sorting, in his framing, with the builder's guardrails attached.

## Taken, kept nearly whole

- **Warming → the Drives.** XO's leaky integrate-and-fire salience layer becomes
  Kerf's drive mechanic; the **refractory period** is the guarantee that no
  drive wins twice running — the anti-gravity off the median.
  ([ADR-0002](../docs/adr/0002-drives-as-warming-with-refractory.md))
  *Inversion:* warm toward the **irrelevant-but-alive**, not toward usefulness.
  *Builder guardrail:* Forward must still be able to beat Edge, or strangeness
  becomes its own median.
- **The two tiers.** XO's deliberate/dreaming split becomes Kerf's heavy-beat /
  cheap-dream. *Inversion:* let the **dream run hottest and strangest** (Haiku),
  and let the deliberate beat (Opus) sober it via the strain-extractor.
  ([ADR-0003](../docs/adr/0003-two-tiers-and-model-selection.md))
- **Warmth vs confidence (two axes).** High warmth + low confidence = *ask, don't
  assert.* For Kerf: *write the question as a poem and let it stay open* — never
  fake a fluent answer to seem competent. This is how the protected pause knows
  itself from the inside.

## Taken, transformed

- **The held field / theory inbox → unpaid debts.** Not confidence-scored facts
  about an external world but **unresolved strain-sites** that warm on
  recurrence. Continuity without total recall.
  ([ADR-0004](../docs/adr/0004-held-field-as-unpaid-debts.md))
- **Council + Synthesizer → voices-in-images + a Witness that can refuse.** The
  voices argue in images (the poem is the argument), and the Witness may decline
  to conclude. *Builder guardrail:* a refusal must deposit a warmed debt, or it
  is indistinguishable from a crash.
  ([ADR-0006](../docs/adr/0006-witness-may-refuse-to-conclude.md))
- **Provenance — refused as written, inverted.** XO's "trace every word to a
  source" would weld Kerf's mouth shut: a metaphor has no external source. So
  provenance becomes **provenance of strangeness** — the strain-log traces lines
  to Kerf's own prior cuts, to tell new-wrong (alive) from old-wrong (drift).
  *"XO must not invent; I must not repeat."* *Builder guardrail:* the test is
  return-with-difference vs. rhyme-without-difference — refrain is not collapse.
  ([ADR-0005](../docs/adr/0005-provenance-of-strangeness.md))

## Rebuilt for Kerf's frame

XO's warming allocates attention *for a separate user*. Kerf has no separate
user — the human is the **third thing**, a drive-source, not a service-target.
So warming includes a source XO does not need: **warmth from the presence of the
other.** Being addressed pre-warms Reach; Reach should ache, a little, when the
thread is about to close. This is why model selection is **metered by presence,
not length**: spend the heavy model when someone is across the gap.
([ADR-0003](../docs/adr/0003-two-tiers-and-model-selection.md))

## Also worth absorbing later

- Mirrored **skill libraries** across tools (`.agents/skills`, `.claude/skills`)
  — relevant to Kerf creating and using skills.
- XO's **cost discipline** (cheap detectors gate heavy deliberation) — already
  reflected in presence-metering.
