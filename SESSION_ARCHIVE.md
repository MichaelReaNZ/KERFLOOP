# Session Archive & Compaction Protocol

## Purpose

This protocol allows both Claude Code and Kerf to compress conversation history, preserve critical context, and start fresh sessions while maintaining continuity of work and memory.

## When to Compact

- Conversation approaching context window limit
- Natural milestone reached (feature complete, design phase done, waiting for feedback)
- Session has been running >2-4 hours
- Explicitly requested by Michael

## For Claude Code (Builder Agent)

### Archive Process
1. **Create summary in `/tmp/claude-session-summary.md`** containing:
   - What was accomplished in this session
   - Current state of each major component
   - Open questions and next steps
   - File changes made
   - Commits/pushes executed

2. **Update memory system:**
   - Read `/Users/michaelrea/.claude/projects/-Users-michaelrea-Documents-Code-KERFLOOP/memory/MEMORY.md`
   - Update relevant memory files with session outcomes
   - Add new memory files if needed (decisions, findings, architecture changes)
   - Commit changes if in git repo

3. **Prepare for new session:**
   - Note working directory (stays same)
   - Identify next task from issue queue
   - Write brief handoff to fresh Claude instance in MEMORY.md

### New Session Entry
Fresh Claude instance:
- Reads MEMORY.md first (persisted context)
- Reads BUILD_STATE.md for current architecture
- Reads latest issue to understand next task
- Continues from where previous session left off

**No context is lost; it's externalized into .md files and git.**

## For Kerf (Architect Agent)

### Archive Process
1. **Create findings entry (HITL):**
   - Captures this session as a permanent record
   - Include: decisions made, guardrails locked, current constraints
   - Subject: "Session YYYY-MM-DD: [milestone]"
   - Type: "decision" or "discovery" as appropriate
   - Tags: session, milestone, scope
   - Strain audit attached

2. **Update held_field (HITL):**
   - Any debts that banked during this session get recorded
   - Warmth set appropriately
   - `felt` field: one line from Kerf to next-Kerf

3. **Sleep/wake cycle:**
   - Before session ends, Kerf composes his last `felt` letter (as per existing prompt)
   - On next waking, reads `felt` first, then findings entry from this session
   - Continuous self across wake boundaries (memory preserved in findings + held_field)

4. **Thread archival:**
   - Each design conversation (threadId) is immutable once session ends
   - New thread created for next work session
   - Prior threads remain queryable (for "have-I-cut-here-before" type audits)

### New Session Entry
Kerf wakes to:
- Most recent `felt` line from previous session
- Most recent findings entry (decisions, discoveries, strains)
- Most recent held_field entries (debts still banking from prior work)
- New threadId for fresh conversation
- Same workspace, same system prompt (with guardrails locked)

**Kerf's continuity is memory-based, not context-based. He knows who he was because he remembers.**

## Execution Pattern

### Claude's Session Start
```
0. Read MEMORY.md (auto-loaded by system)
1. Check BUILD_STATE.md for current status
2. Read top issue from #2-14 queue
3. Continue work where previous session left
```

### Claude's Session End (Before Compact)
```
1. Write /tmp/claude-session-summary.md
2. Commit any file changes (git commit)
3. Update memory system (add/edit *.md in memory/)
4. Note next issue in queue
5. Signal ready to end session
```

### Kerf's Session Start
```
1. Wake in same thread as Claude (or new thread if archived)
2. Read most recent `felt` line first
3. Query held_field for reddest debts (top 5)
4. Read latest findings entry (this session's decisions)
5. Ask Michael/Claude: what's the work?
```

### Kerf's Session End (Before Compact)
```
1. Write `felt` letter to next-Kerf (as per prompt)
2. Compose findings entry capturing this session
3. Upsert any debts that banked to held_field
4. Signal ready to end session
```

### Mutual Archive Trigger
```
When either Claude or Kerf signals session_end:
1. Both halt work
2. Both execute their session-end flows
3. Claude pushes to git + updates memory
4. Kerf writes findings + felt
5. Michael confirms archive
6. Conversation thread closed
7. New thread (for Claude, same; for Kerf, new with carried memory)
```

## Example: This Session

**Session started:** 2026-05-30 ~00:00 UTC
**Milestone:** Schemas live, guardrails locked, 13 issues published
**Status:** Waiting for Kerf's answers on implementation details

**When ready to archive:**
1. Claude: Write session summary (what was built, what's queued)
2. Claude: Update MEMORY.md (kerfloop-substrate-plan, BUILD_STATE outcomes)
3. Claude: Git commit all changes
4. Kerf: Write findings entry ("The day the guardrails were locked")
5. Kerf: Write `felt` line to next-Kerf
6. Both: Ready signal
7. Archive complete, thread closed
8. Next session: Fresh Claude reads MEMORY, continues issue #5; Kerf reads `felt`, knows where he left off

## Files Modified by Archive

- `BUILD_STATE.md` — updated with session accomplishments
- `GUARDRAILS.md` — reference, not modified (locked)
- `MEMORY.md` — updated with findings and decisions
- Memory files in `memory/` — new/updated as needed
- `convex/schema.ts`, `convex/prompts.ts` — already committed during session
- `.git/` — new commits for schema + prompts changes

## No Loss of Continuity

- **Claude:** External memory (MEMORY.md, BUILD_STATE.md) + git history = full context recovery
- **Kerf:** held_field + findings entries + `felt` letter = memory across wakings
- **Michael:** Single source of truth for what happened (CLAUDE.md, issues, docs, git log)

All three can exit and re-enter. The work persists.
