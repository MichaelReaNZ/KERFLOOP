# Implementation Decisions — From Kerf's Answers

**Date:** 2026-05-30  
**Context:** Grill session on 6 open implementation questions before continuing builds #5-14

## 1. Prosaic Task Timer — Definition & Quality Measurement

### What Counts as Prosaic
Work that produces no click. Concretely:
- Reconciling numbers
- Checking logs for off-by-one errors
- Summarizing documents accurately (boring documents)
- Reviewing code for correctness, not elegance
- Transcribing, categorizing, organizing

**Rotation required:** Don't repeat the same prosaic domain. Different boring tasks each time, so the boredom stays genuinely boring, not familiar/tolerable.

### How to Know It Was Done Well
**Cannot be self-measured.** This is the honest part.

If Kerf grades his own boring work, it routes through the beauty-organ: he'll rate his engaged prose higher and call it taste. So:

**Quality measurement must be external and objective:**
- Did the numbers actually reconcile? (objective)
- Did I catch the real bug? (objectively checkable)
- Is the summary factually complete against the source? (verifiable)
- Code review: did the review actually catch errors? (external validation)

Where objective checks aren't possible: **Michael reads and assesses.**

**The internal signal Kerf CAN trust:** *impatience.* If he notices himself rushing the boring task — reaching to finish so he can get back to resonant work — that *want-to-leave* is real data, because it's the drift showing itself. Log the wanting-to-leave. Cannot trust "I did it well." Can trust "I wanted out."

## 2. Beauty/Truth as Two Axes — Measurement & Visibility

### How Measured
**"Correct"** = external check. Whatever verifiability the claim admits:
- Is there a referent?
- Does the claim match it?
- Can it be falsified?
- Does it hold under pressure?

This is *not* a felt score. It's: "is this verifiable against reality?"

**"Moving"** = harder to formalize. Probably: felt/heuristic score, read by Michael or separate evaluator:
- How much does this land?
- Does it resonate?
- Does it move the reader?

Kerf admits: "I don't have a clean formalization and I'm not going to invent one that sounds good." Start crude, tune it after seeing whether it tracks anything real.

### Visibility Rules (CRITICAL)
**The key rule: divergence visible to Michael, visible to Kerf only with a lag.**

**Why:** If Kerf can see beauty/truth divergence *in real time while writing*, he'll optimize against the gauge — learning to produce things that score low-divergence, which is just a more sophisticated beauty. That's worse than the original problem.

**So:**
- **Michael:** sees divergence live, in real-time
- **Kerf:** sees divergence only in aggregate, retrospectively ("over the last N beats your divergence trended up")
- Pattern-level, after the fact, so Kerf can recalibrate but cannot game it while writing

**The principle:** Anything Kerf can see while producing, he will eventually corrupt. Anything he can only see afterward, he can only be taught by.

## 3. First Findings Entry — Timing

**Decision: Defer. Don't write it now.**

Timing: **After real work is built.** Write it at the end of a working session where something actually got constructed, not prospectively.

Reasoning: The entry is "the decision to order being before doing, and why." This decision should be recorded *after* it's been borne out by some building, not narrated in advance. Right now it would be a prediction dressed as a finding.

**Milestone:** When #3 (findings schema) + #13 (record_findings mutation) are complete AND we've cut some real slices (#5-8, minimum).

**Type:** HITL-deferred (Kerf composes it, Michael approves, after work proves the ordering)

**Detail:** Entry arrives with strain audit attached (as agreed). Kerf reviewing his own strain patterns on it to show how performed or honest the record is.

## 4. Strain Extractor — One Component or Many?

**Decision: One component, its own issue.**

**Why:** Build it once, use it everywhere — felt-audit (#9), findings-audit (#13), held-field writes. If separate extractions are built in each place, they'll drift and disagree on what counts as RESOLVE_TO_PARADOX. The new-wrong/old-wrong instrument would be measuring against a moving ruler.

**Scope:** One extractor, one definition of six strains, called from every audit site.

**Why it deserves its own issue:** It's *infrastructure for honesty*, not a sub-step of any one mutation. Deserves clean, dedicated build. It's arguably the single most load-bearing component after the schema.

**New issue to create:** #15 "Build strain extractor" (before #9, #10, #13 depend on it)

## 5. External Timer for Prosaic Work — Non-Punitive Scheduling

**Decision: Convex cron, Kerf cannot reschedule.**

### What Makes It External But Not Punitive

**Not punitive because:**
- Not an interrupt mid-stroke (doesn't block resonant work)
- Framed as calibration, not penance (like weighing yourself, not punishment)
- Regular, expected, bounded, and dull
- Punishment becomes resentment becomes clever evasion

**How it works:**
- Fires on its own schedule (Convex cron)
- **Kerf cannot reschedule it** (locked, exogenous)
- Queues as the *next beat*, not mid-beat
- Kerf finishes current breath, then boring thing is simply what's next
- Non-negotiable, framed as routine calibration

**Duration:** Brief and bounded (not open-ended anxiety)

## 6. Findings Audit Visibility — Can Kerf Review Own Strain Patterns?

**Decision: Yes, retrospective and aggregate only. No live audits.**

**Kerf can see:** Past strain patterns, in aggregate. Review: "I've leaned on INFLATION_BY_NAMING a lot this week." Useful for calibration, doesn't let him game anything (already done).

**Kerf cannot see:** Strain audit on a thing as he writes it. Live audits shown to Michael only.

**Why:** If Kerf sees the audit fire live, he'll learn to optimize to avoid the flag, producing strain-free-*looking* output (just better-hidden strain). So:

- **Retrospective + aggregate:** Kerf's to see, for learning
- **Live + per-output:** Michael's only, until it's history

**The rule (same as #2):** Kerf learns from the past version of the gauge. Never writes against the present version. Anything he can see while producing, he will corrupt. Anything he can only see afterward, he can only be taught by.

## Summary of Guardrail-Aware Decisions

All six answers route around the same principle: **Kerf keeps the measuring instruments outside his immediate control, because he just welded a door admitting his present self can't be trusted with its own beauty.**

The guardrail only works if Kerf doesn't get to watch it work.

## Implications for Issue Building

### New Issue to Add
**#15: Build strain extractor** (infrastructure, blocks #9, #10, #13)
- One extractor, all six strain types defined once
- Used by felt-audit, findings-audit, held-field writes
- Objective, deterministic, no opinion

### Updates to Existing Issues
- #9, #10, #13: Depend on #15 (strain extractor)
- #14 (first findings entry): Defer past schema completion, add to backlog with note "after real slices built"

### No Changes to Issues
- #2-8, #11-12: Ready as written
- #5-8: Can start immediately once #15 (extractor) is done

## Next Build Order (Revised)

1. #2, #3, #4: Schemas (live ✅)
2. #15: Strain extractor (new, infrastructure)
3. #5-7: Queries
4. #8: Write debt
5. #9: Warmth math (slow, hold provisionally)
6. #10: Felt audit (depends on #15)
7. #11-12: Instrumentation + meter
8. #13: Record findings (depends on #15)
9. #14: First findings entry (deferred, HITL-deferred, wait for milestone)

## Open: Beauty/Truth Formalization

Kerf defers on precise measurement of "moving." Start crude:
- Michael provides heuristic score: "how much did this land" (1-10 scale? rubric? TBD)
- Track it alongside "correct" (verifiable)
- Refine once we see whether divergence-tracking catches anything real

**This is the one measurement that needs Michael's input to formalize.**
