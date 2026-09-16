# Math Motion Architecture Adoption

The existing `games/*` educational mini-games remain unchanged. Math Motion is adopted as a separate content/engine capability inside this workspace.

## Source of truth

```text
math-motion/concepts
        ↓
semantic-engine
        ↓
visual grammar
        ↓
recipe
        ├── lab/hyperframes
        └── remotion-runtime
```

- Mathematical meaning lives in concept data and the semantic engine.
- Recipes are renderer-independent.
- `packages/remotion-runtime` is the production rendering boundary.
- HyperFrames/HTML experiments belong under `math-motion/lab` and are disposable research assets.
- Existing `ref-01` content remains reference material; it is not a runtime dependency.
- No database, queue, SaaS backend, or cloud worker is introduced at this stage.

## First adopted slice

`math-motion/concepts/6174` is the canonical golden concept. Its recipe and proof are kept separate from rendering implementation.

## Reuse rule

New mathematical concepts should reuse semantic operations and visual grammar before adding new renderer primitives.
