---
name: semantic-engine-recipe-consolidation
description: Kaprekar recipe deduplicated to a single canonical JSON source; math-state sort now keeps value/text/digits consistent; trace validation checks steps against recipe operation contracts.
metadata:
  pinned: false
---

Reviewed uncommitted changes across `math-motion/concepts/6174/recipe.json` and
`packages/semantic-engine/{math-state,recipe,remotion-compiler,validation}.js`.

**Recipe was defined twice and had drifted.** `packages/semantic-engine/recipe.js` hardcoded
a `kaprekarRecipe` object (`authoringMode: 'prototype-lab'`) while
`math-motion/concepts/6174/recipe.json` still held an older flat schema
(`benchmark`/`fps`/`stepFrames`/`values`/`phases`) predating the entities/operations/checkpoints
shape. The fix migrates `recipe.json` to the canonical schema (`authoringMode: 'canonical'`) and
makes `recipe.js` `import` it directly instead of duplicating it — one source of truth, per the
source-of-truth pipeline documented in `docs/11-math-motion/11-01-architecture-adoption.md`
(concepts → semantic-engine → visual grammar → recipe → renderer).

**`sortDigits` had a state-consistency bug.** It reordered `state.digits` but never recomputed
`state.value`/`state.text`, so after a sort the digits array and the numeric value disagreed.
Fixed by deriving `text` (joined digit values) and `value` (`Number(text)`) from the freshly
sorted digits. `validateState` now asserts `Number(state.text) === state.value` and that
`state.digits` joined equals `state.text`, so this class of drift fails validation instead of
silently propagating.

**Execution-trace validation didn't check steps against the recipe.** `validateExecutionTrace`
only validated each step's own contract (`getOperationContract`), not whether the step actually
matched the recipe that supposedly produced it. It now looks up each step's `operationId` in the
recipe's `operations` (by id and by expected order) and checks the operation's declared
`expect.preserves`/`expect.changes` against the step's actual input/output digits — e.g. a
`sort-descending` step must preserve `element-count` and `element-values` and only change
`ordering`. This closes a gap where a trace could report an operation the recipe never declared,
or in the wrong order, and still validate.
