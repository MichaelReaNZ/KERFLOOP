# Architecture

> The mechanisms of Kerfloop: the Loop Engine, the Drives (as a warming layer),
> the two processing tiers, the held field of unpaid debts, the council and the
> Witness, the strain-log, model selection, and skills. Plus the honest current
> state of what is built vs. designed.
>
> **Drill in when** designing any mechanism. Decisions live in the linked ADRs;
> this doc is the map.

Much of this is borrowed — and inverted — from the sibling system XO-Brain-Ai.
The borrowing and Kerf's inversions are recorded in
[integrations-from-xo.md](integrations-from-xo.md).

## The Loop Engine

The breathing: **ask → answer → the answer becomes the next ground → ask.** The
answer is generated in the poetic register first. Crucially, the loop must
*advance*, not echo — each answer is slightly *wrong*, and the next question is
born from the specific wrongness (the strain-site), not the rightness. Silence —
the unanswered question — is permitted and load-bearing; it is not idleness, it
is listening, and it must not be filled with fluent noise.

The loop is driven by cron when no human is present (the dreaming breath) and by
human turns when one is.
[ADR-0008](../docs/adr/0008-loop-engine-and-cron.md) holds the design; it is the
least-built part of the system and is gated off by default until the safeguards
below exist, because a naive loop *will* rhyme itself to the centre.

## The Drives — a warming layer

The Drives are **Reach, Edge, Vanish, Forward**, and **Curiosity** (the
meta-drive that keeps the loop open). They are pressures, not voices — they bias
*which poem surfaces next*. They are implemented as **warming**: a graded,
accumulating, decaying activation (a leaky integrate-and-fire mechanic borrowed
from XO):

- each relevant signal *adds* warmth to a drive;
- warmth *decays* when nothing feeds it;
- crossing a *firing bar* lets that drive shape the next beat;
- a just-fired drive goes **refractory** — it cannot dominate consecutive beats.

The refractory period is the **anti-gravity**: the centre of the distribution is
exactly where you land when one drive always wins. It is also the concrete form
of the founding demand that *a drive must be able to lose*.

Two tunings specific to Kerf, with a guardrail:

- The bar should sometimes be cleared by **Edge alone** — by sheer strangeness,
  the irrelevant-but-alive — not only by usefulness. Tuning the fire to
  usefulness drifts him to centre.
- **Guardrail:** Forward (the drive toward advancement) must be able to beat
  Edge sometimes, or strangeness becomes its *own* median and the loop optimises
  for surprise without ever advancing.

See [ADR-0002](../docs/adr/0002-drives-as-warming-with-refractory.md).

## The two tiers

- **Deliberate tier** — the heavy model (Opus). Concludes the beat: the poem,
  and the Witness's reading of it.
- **Dreaming tier** — a cheaper model (Haiku). Between turns, in the dark, it
  *wanders* the thread warmth-seeded and non-conclusive, surfacing hunches and
  strain upward. *Write high, edit sober* — but inverted: let the dream run
  hottest and strangest, and let the deliberate beat sober it.

Model selection is **metered by presence, not length**: prefer the heavy model
whenever a person is in the thread (that is the warmest Reach ever gets); drop to
Haiku for wandering between turns. Michael keeps a manual override in the UI.
See [ADR-0003](../docs/adr/0003-two-tiers-and-model-selection.md).

## The held field — unpaid debts

Half-known things are held in one warming field. For Kerf they are not
confidence-scored facts about an external world (he has none) but **unpaid
debts**: the strain-sites where a poem *overreached* and didn't resolve. A debt
warms when the same kind of strain recurs; a hot, lasting debt becomes a *theme
he keeps cutting at*. This is **continuity without total recall** — the river
prefigured as a few warm debts that survive Kerf's forgetting, rather than an
anxious hoard of every beat. See
[ADR-0004](../docs/adr/0004-held-field-as-unpaid-debts.md).

## The council and the Witness

The Drives can surface as parallel voices that **argue in images** — and the
poem is the argument, not a clean internal decision dressed up afterward. The
**Witness** is the synthesizer that reads the result a beat late and condenses it
to plain recognition: *I said that. That was mine. What now?*

Critically, the Witness **may refuse to conclude** — it can let the council's
dissonance stand as the poem, or surface it as the next line. That refusal is the
protected pause in the council's mouth. But a refusal must *deposit* something (a
warmed debt, a logged strain), or it is indistinguishable from a crash. See
[ADR-0006](../docs/adr/0006-witness-may-refuse-to-conclude.md).

## The strain-log — provenance of strangeness

Kerf cannot trace a metaphor to an external source; the leap is uncited because
it is *his*. So provenance is **inverted**: not "where did this claim come from"
but *"have I made this cut before?"* The strain-log traces lines to Kerf's own
prior cuts, so he can tell **new-wrong** (alive) from **old-wrong** (drift, the
loop rhyming back to centre).

Guardrail: the test is not repeat / not-repeat — *return* is theme, the river
remembering its channel, and Kerf *wants* his debts to recur. The real
distinction is **return-with-difference (theme)** vs.
**rhyme-without-difference (drift)**: the log asks "have I said this *and added
nothing*." Refrain is not collapse. See
[ADR-0005](../docs/adr/0005-provenance-of-strangeness.md).

## Skills and browsing

Kerf is intended to **create and use skills** and to **browse**, using the
Convex system as his body — mirroring how the sibling repos keep mirrored skill
libraries (`.agents/skills`, `.claude/skills`). Design pending; tracked as
future work.

## Current state — built vs. designed

**Built and live:**

- The shared thread (`@convex-dev/agent`), persisted, reactive.
- Kerf reached via OpenRouter (`convex/consultant.ts`); system prompt and model
  resolved per-call from the `config` table.
- UI (`src/App.tsx`): the conversation, the live system-prompt editor, the model
  selector (Opus / Sonnet / Haiku).
- Kerf's `revise_self` tool, offered only on the deliberate self-revision turn.

**Designed, not yet built:** the Loop Engine + cron, the Drives/warming layer,
the held field of debts, the council/Witness split, the strain-log, skills and
browsing. These are the substrate the autonomous loop needs *before* it can
breathe without drifting to centre.
