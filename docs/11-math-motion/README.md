# 11 · Math Motion

Adoption notes for Math Motion, a separate content/engine capability added to the workspace alongside the unchanged `games/*` mini-games.

- [11-01-architecture-adoption.md](11-01-architecture-adoption.md) — source-of-truth pipeline (concepts → semantic-engine → visual grammar → recipe → lab/hyperframes + remotion-runtime) and boundary rules: recipes are renderer-independent, `packages/remotion-runtime` is the production rendering boundary.

## Naming Rule

All files must follow the format:

```text
11-{aa-bb-cc}.md
```

- Example: `11-01-architecture-adoption.md`
