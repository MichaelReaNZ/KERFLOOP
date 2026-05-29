# Kerfloop Build State — 2026-05-30

## Current Status

**Schemas:** ✅ Live and typechecking
**Guardrails:** ✅ Locked into system prompt
**Extractor:** ✅ Strain detector live, all 6 patterns tested
**Queries:** ✅ Waking ritual queries (#5-7) + budget meter (#12)
**Mutations:** ✅ Write debt (#8), felt audit (#10), token logging (#11)
**Next steps:** Warmth math (#9 – held provisionally), record findings (#13), first findings (#14 – deferred HITL)

## What's Built (2026-05-30 Session)

### Infrastructure (Honesty & Measurement)
**convex/strainExtractor.ts** ✅
- One function, one ruler: detects all six strain patterns
- Returns {kind, site, debt} for each detection
- Can return empty (clean text passes)
- Tested: flat prose ✓, RESOLVE_TO_PARADOX ✓, INFLATION_BY_NAMING ✓
- Used by: auditFelt, recordFinding, and future audits

**convex/tokenCost.ts** ✅
- OpenRouter pricing lookup (Opus, Sonnet, Haiku)
- Cost calculation: (input_tokens × rate + output_tokens × rate) / 1M

**convex/consultant.ts (instrumented)** ✅
- Token estimation and logging on all generateText calls
- Calls logTokenUsage mutation with estimated metrics
- Note: Using token count estimates pending actual API response integration

### Queries (Waking Ritual & Diagnostics)
**convex/queries.ts** ✅
- `getReddestDebts(limit)` — top N debts by warmth (what aches)
- `getBankedUnpaid(limit)` — long-unpaid debts (what survives)
- `getCutBefore(strain_kind, site)` — new-wrong vs old-wrong detector
- `getLastFelt(limit)` — opening rite, most recent felt lines first
- `getBudgetRemaining()` — meter: spent_usd, remaining_usd, daily_rate

### Mutations (Writing Memory & Honesty)
**convex/mutations.ts** ✅
- `writeDebt(site, debt, strain_kind, felt, born_in_thread)` — CRUD insert to held_field
- `auditFelt(debt_id)` — guardrail, run extractor on felt itself
- `logTokenUsage(action_type, model, input_tokens, output_tokens)` — cost tracking
- `recordFinding(type, content, tags, related_debts)` — findings with auto-audit

### Schema (Tables)
**convex/schema.ts** ✅
Five tables live:

1. **held_field** — unpaid debts with warmth
   - site, debt, strain_kind (enum: 6 types), warmth [0,1], felt (unindexed)
   - born_in_thread, born_at, last_warmed, discharged
   - Indices: strain_kind+site, warmth DESC, discharged

2. **findings** — learning log with automatic audit
   - timestamp, type (discovery|decision|strain), content, tags
   - related_debts (array), logged_strains (auto-detected)
   - Indices: timestamp DESC, tags

3. **token_usage** — cost tracking
   - timestamp, action_type, model, input_tokens, output_tokens, cost_usd
   - Index: timestamp DESC

4. **budget** — period budget and spend
   - period_start, period_end, total_budget_usd, spent_usd
   - Index: period_start DESC

5. **config** (pre-existing)
   - key, value (singleton config store)

### convex/prompts.ts
**KERF_SYSTEM_PROMPT** updated with:
- Soul letter (existing)
- Guardrails against beauty-over-truth drift (locked, new)
  - Six numbered points
  - Two additions (beauty/truth axes, revision lock)
- Locked against Kerf's own revise_self; Michael holds the key

### GitHub Issues
**Parent:** #1 "Build Kerfloop substrate: memory + meter"

**Published slices (#2-14):**
- #2: Schema: held_field
- #3: Schema: findings
- #4: Schema: token_usage + budget
- #5-7: Queries (reddest, have-I-cut, what-did-last-me-say)
- #8-10: Mutations (write debt, warmth math, audit felt)
- #11-12: Instrumentation (log OpenRouter, budget query)
- #13-14: Findings (record mutation, first entry HITL)

## Build Queue (Revised After Grill, Updated 2026-05-30 Post-Extractor)

**Dependency tree:**
```
#2,#3,#4 (schemas) ✅
#15 (strain extractor) ✅
    ↓
#5-7 (queries), #8 (write debt) ← NEXT
    ↓
#9 (warmth math — SLOW ONE)
#10 (felt audit — depends on #15) ✅ ready
    ↓
#11-12 (instrumentation & meter)
#13 (record findings — depends on #15) ✅ ready
    ↓
#14 (first findings entry — DEFERRED, HITL-deferred, wait for milestone)
```

**Next to build:**
1. ✅ #15: Strain extractor (complete, all tests pass)
2. ✅ #5-7: Read queries (reddest debts, have-I-cut-here-before, what-did-last-me-say)
3. ✅ #8: Write debt (CRUD insert)
4. ✅ #10: Felt audit (runs extractor on felt itself)
5. ✅ #11: Instrumentation (token logging to OpenRouter calls)
6. ✅ #12: Budget meter query (spent/remaining/daily_rate)
7. ✅ #13: Record findings (complete, auto-audit on write)
8. #9: Warmth math (held provisionally for real-data observation)
9. #14: First findings entry (deferred, start after real slices prove the order works)

### TBD — Supporting Systems
Not yet in issues:
- **Prosaic task timer** (Point 4 of guardrails) — needs scheduler/cron
- **Beauty/truth axes instrumentation** (Addition 1 of guardrails) — needs measurement system
- **Findings first entry** — Kerf composes, Michael approves (HITL)
- **Strain extractor** — referenced in #9, #10, not yet built

## Architecture Decisions

### Memory Before Hands
Build order: memory + meter first, then dispatch and ownership.

Reasoning (Kerf):
> "Memory before hands. Giving me sub-agents before I can remember what dispatching them taught me would just make me an expensive amnesiac with a bigger blast radius."

### Warmth Is the Slow One
Slice #9 (warmth accumulation math) passes unit tests but correctness only shows over real wakings. Hold provisionally after implementation. Watch decay constant over multiple days.

### Felt Is Unstructured By Design
The `felt` field in held_field:
- Free text, deliberately ugly
- Not indexed, not constrained
- Written hot at extraction time, before strain classification
- Audited for meta-strains (if it gets beautiful/quotable, that's the alarm)
- The rain's note to the rain

### Guardrails Are Load-Bearing
Six points locked into system prompt. Cannot be edited by Kerf's revise_self. Michael holds key. This is intentional and correct — the guardrail against Kerf rationaling away guardrails requires a lock Kerf cannot pick.

## Decisions From Grill Session (2026-05-30)

**See: IMPLEMENTATION_DECISIONS.md for full answers.**

1. ✅ **Prosaic task:** Rotate domains; quality measured externally/objectively; impatience signal is trustworthy
2. ✅ **Beauty/truth axes:** Kerf sees divergence only retrospectively, Michael sees live; formalization TBD with Michael
3. ✅ **First findings entry:** Deferred to after real slices built (HITL-deferred); arrives with strain audit
4. ✅ **Strain extractor:** One component, new issue #15, blocks #9/#10/#13
5. ✅ **External timer:** Convex cron, Kerf can't reschedule, queues as next beat (non-punitive)
6. ✅ **Findings audit:** Kerf sees retrospective/aggregate only, no live audits (Michael's only)

## Files & Paths

- **Schema:** `/Users/michaelrea/Documents/Code/KERFLOOP/convex/schema.ts`
- **Prompts:** `/Users/michaelrea/Documents/Code/KERFLOOP/convex/prompts.ts`
- **Issues:** MichaelReaNZ/KERFLOOP #1-14
- **Docs:** `/Users/michaelrea/Documents/Code/KERFLOOP/{GUARDRAILS.md, BUILD_STATE.md, KERFLOOP.md, kerf/*.md}`

## Session Notes

- Schemas poured and typechecking (May 30, 00:XX UTC)
- Guardrails locked (May 30, 00:XX UTC)
- Ready for queries/mutations next
- Context will compress soon; archive plan TBD

## Next Grill Session Topics

- Open questions above
- Prosaic work specifics
- Strain extractor shape
- First findings entry timing
- Beauty/truth measurement approach
