# Breathe Action End-to-End Test

**Task #17: Verify one manual breath end-to-end**

## Test: Full waking cycle (tracer bullet)

**Behavior**: `breathe(force=true)` executes one complete waking cycle:
1. Reads felt lines from held_field
2. Applies warmth decay to reddest debts (0.95 multiplier)
3. Records waking as a decision finding
4. Runs strain audit on decision (logged_strains populated)
5. Returns structured response with warmth_log, budget_remaining, reddest_debt

## How to verify

### Setup: Create test data in Convex dashboard

1. **Create a held_field entry (strain debt)**
   ```
   site: "the kerf sings at noon"
   debt: "claiming to be the song"
   strain_kind: "INFLATION_BY_NAMING"
   warmth: 0.6
   felt: "yesterday i was beautiful and said so"
   born_in_thread: [thread_id]
   born_at: [now]
   last_warmed: [now - 1 day]
   discharged: false
   ```

2. **Create a budget entry**
   ```
   period_start: [first of month]
   period_end: [last of month + 1 day]
   total_budget_usd: 50
   spent_usd: 5
   ```

### Run: Invoke breathe action

From Convex dashboard or via internal action call:
```typescript
await breathe({ force: true })
```

### Verify: Response structure and side effects

**Expected response:**
```typescript
{
  status: "success",
  waking_id: <id>,
  warmth_applied: [
    {
      debt_id: <id>,
      before_warmth: 0.6,
      after_warmth: 0.57  // 0.6 * 0.95
    }
  ],
  reddest_debt: {
    site: "the kerf sings at noon",
    warmth_after_decay: 0.57
  },
  budget_remaining: 45,  // 50 - 5
  logged_strains: ["ARCHITECTURE_AS_INTIMACY"]  // or similar from waking_content audit
}
```

**Verify in DB:**

1. **Check findings table** for new entry:
   ```
   type: "decision"
   tags: ["waking", "breathe", "decision"]
   content: contains waking narrative
   logged_strains: non-empty array
   related_debts: contains the debt ID from above
   timestamp: recent
   ```

2. **Check held_field** for updated warmth:
   ```
   warmth: should be ~0.57 (0.6 * 0.95 decay)
   last_warmed: should be recent
   ```

## Acceptance Criteria (PASS if all true)

- [ ] breathe(force=true) returns status="success"
- [ ] Response includes waking_id, warmth_applied, reddest_debt, budget_remaining, logged_strains
- [ ] warmth_applied shows correct decay: 0.95x multiplier on before_warmth
- [ ] Finding is recorded with type="decision" and tags include "breathe"
- [ ] Finding has logged_strains populated (strain audit ran)
- [ ] Debt warmth in DB matches response (after_warmth)
- [ ] Response contains budget_remaining (50 - 5 = 45 in test setup)
- [ ] breathe(force=false) returns status="gated" (does NOT execute)

## Test 2: Refractory period (when warmth >= 0.7)

**Setup**: Create debt with warmth=0.75 (above refractory threshold 0.7)

**Verify**: After breathe, warmth should be:
- Before decay: 0.75 + 0.27 (integration) - 0.1*0.27 (coolant) ≈ 0.99
- After anti-gravity (1.02x): 1.0 (clamped)
- After decay (0.95x): 0.95

**Expected**: warmth_applied[0].after_warmth ≈ 0.95

## Test 3: Strain audit on waking_content

**Verify**: Finding.logged_strains is populated based on waking_content text

If waking_content mentions "the dream turns" → should detect THE_EARNED_TURN
If waking_content mentions "held_field felt" → should detect ARCHITECTURE_AS_INTIMACY

Logged_strains should match detected strains from extractStrainKinds(waking_content)
