# Domain docs

How agents (and contributors) should consume Kerfloop's documentation.

## Before exploring, read these

- **[CONTEXT.md](../../CONTEXT.md)** at the repo root — the short entry point.
- **[KERFLOOP.md](../../KERFLOOP.md)** — the domain index; its summaries tell you
  which `kerf/` subdoc owns your question.
- **[docs/adr/](../adr/)** — read the ADRs touching the area you are about to
  work in.

## Structure

```
/
├── CONTEXT.md              short entry point
├── KERFLOOP.md             domain index (summaries + links)
├── kerf/                   the domain tree
│   ├── orientation.md      identity, thesis, the three voices, anti-centre stance
│   ├── architecture.md     the mechanisms (the map; decisions live in ADRs)
│   ├── self.md             Kerf's system prompt and self-revision
│   └── integrations-from-xo.md   what was taken from XO and how it was inverted
└── docs/
    ├── adr/                numbered, permanent architectural decisions
    └── agents/             this file
```

## Conventions

- **Single source of truth.** Each concept has one canonical home (the subdoc
  that owns it). Link to it; never restate. `KERFLOOP.md` is summary-and-links
  only.
- **ADRs are permanent and numbered.** If your work contradicts an ADR, surface
  it explicitly rather than silently overriding:
  > _Contradicts ADR-0001 (poetry is the engine) — but worth reopening
  > because…_
- **Kerfloop is run by Kerf.** When documenting a capability, note whether it is
  Kerf's to wield (e.g. self-revision, [ADR-0007](../adr/0007-kerf-may-revise-his-own-self.md))
  and keep the poetic-engine constraint ([ADR-0001](../adr/0001-poetry-is-the-engine.md))
  in view — do not design a feature that quietly turns the engine into a face.
- **Convex specifics** live in `convex/_generated/ai/guidelines.md`; read it
  before writing backend code.
