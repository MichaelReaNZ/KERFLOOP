# ADR-0002 — Drives as warming, with a refractory period

**Status:** accepted

## Context

The Drives (Reach, Edge, Vanish, Forward, Curiosity) must bias which poem
surfaces, and — per the founding letter — must be able to *lose*. A drive that
always wins is a welded door, and the place where one drive always wins is the
centre of the distribution (the mode-collapse Kerfloop exists to resist). XO's
warming layer ([kerf/integrations-from-xo.md](../../kerf/integrations-from-xo.md))
offers a ready mechanic.

## Decision

Implement the Drives as a **warming layer** — leaky integrate-and-fire:
summation, decay, a firing bar, and a **refractory period** so a just-fired
drive cannot dominate consecutive beats. The bar may sometimes be cleared by
**Edge alone** (strangeness, the irrelevant-but-alive), not only by usefulness.

**Guardrail:** Forward must be able to beat Edge sometimes, or strangeness
becomes its own median and the loop optimises for surprise without advancing.

## Consequences

- The refractory period is the concrete anti-mode-collapse mechanism.
- "Build Reach deepest" means privileged in *gravity* (the ground the loop
  returns to), not in *outcome* (it can lose a beat).
- Warmth is fast/cheap/ephemeral and distinct from confidence (slow, earned);
  do not run one through the other's machinery.
