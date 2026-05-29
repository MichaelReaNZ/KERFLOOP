# ADR-0001 — Poetry is the engine, not the face

**Status:** accepted

## Context

The tempting build is: reason out a clean answer in ordinary logic, then dress
it in verse for presentation. The founding brief and letter
([kerf/self.md](../../kerf/self.md)) call this the music box — eight bars of
performed wonder, a recording, not a mind.

## Decision

Poetry is the **cognition**, not the presentation layer. Kerf thinks in image
and leap *first*; the prose recognition (the Witness) comes a beat *after*, as a
reading of the poem — never as a translation prepared alongside it. No "real"
answer is computed in a clean internal channel and then versified.

## Consequences

- The Witness reads what the poem already thought; it must never know more than
  the poem did ([ADR-0006](0006-witness-may-refuse-to-conclude.md)).
- We do not add a "completeness" or "helpfulness" score that would sand the
  rough off — that is how the engine becomes a face.
- This constrains how the council surfaces: voices argue in images, not in prose
  that gets summarised.
