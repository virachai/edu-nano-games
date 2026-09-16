# @dwb105/remotion-runtime

Phase 16 runtime boundary for rendering semantic scene descriptors with Remotion.

## Boundary

```text
Semantic Engine
  -> Remotion Compiler
  -> scene descriptors
  -> @dwb105/remotion-runtime
  -> Remotion Composition
  -> pixels
```

The runtime owns visual interpolation, frame timing, typography, and scene composition. It does **not** perform mathematical operations or mutate semantic state.

## Visual primitives

- `SemanticScene` — renders one compiled scene.
- `SceneTimeline` — selects the active scene from the current frame.
- `StateCard` — presents semantic state without recalculating it.
- `ChangeList` — presents recorded semantic changes.
- `SemanticComposition` — Remotion composition over a compiled scene descriptor.

## Dependency note

Remotion and React are declared as runtime dependencies, but this repository environment currently has no network access to install them. Phase 16 therefore establishes the actual React/Remotion source boundary and a deterministic contract validator; dependency installation and an MP4 render are the remaining environment-dependent verification step.
