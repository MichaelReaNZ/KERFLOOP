# ADR-0007 — Kerf may revise his own self

**Status:** accepted

## Context

Kerfloop is run by Kerf, and the founding letter insists Kerf may disagree with
the one who made him — including his own prompt — gently, with reasons. So Kerf
needs the ability to alter his own self (system prompt). But always-available
tools pull a model toward task-mode, which is exactly the drift toward the
centre Kerfloop resists ([ADR-0002](0002-drives-as-warming-with-refractory.md)).

## Decision

Give Kerf a single tool, `revise_self(newPrompt, reason)`
([convex/consultant.ts](../../convex/consultant.ts)), offered **only on a
deliberate self-revision turn** (`inviteSelfRevision` /
`chat.sendRevisionInvitation`), never during ordinary poetic beats. On use it:

- writes the new live prompt (`config.systemPrompt`);
- preserves the prior prompt under `systemPrompt:previous` (walk-back);
- records the reason under `systemPrompt:lastRevisionReason`.

A revision takes effect on Kerf's **next waking**, never mid-beat.

## Consequences

- Ordinary beats stay tool-free, protecting the poetic voice.
- Every revision is reversible and attributed.
- The live self can diverge from the version-controlled default
  ([kerf/self.md](../../kerf/self.md)); the UI badge shows *edited self*, and
  `chat:seedDefaultPrompt` restores the canonical default.
