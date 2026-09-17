import test from "node:test";
import assert from "node:assert/strict";
import canonicalRecipe from "../math-motion/concepts/6174/recipe.json" with { type: "json" };
import {
  executeRecipe,
  kaprekarRecipe,
  validateRecipe,
  validateRecipeContracts,
  validateExecutionTrace,
  compileRemotionScenes,
  validateRemotionScenes,
} from "../packages/semantic-engine/index.js";

test("6174 canonical recipe satisfies recipe and operation contracts", () => {
  assert.deepEqual(validateRecipe(canonicalRecipe), []);
  assert.deepEqual(validateRecipeContracts(canonicalRecipe), []);
  assert.deepEqual(kaprekarRecipe, canonicalRecipe);
});

test("6174 canonical recipe executes to terminal state 6174", () => {
  const result = executeRecipe(canonicalRecipe);

  assert.equal(result.ok, true);
  assert.equal(result.trace.terminalState.value, 6174);
  assert.equal(result.trace.steps.length, 9);
  assert.deepEqual(result.trace.checkpoints, [
    { id: "initial", reached: false },
    { id: "fixed-point", reached: true },
  ]);
});

test("6174 execution is deterministic", () => {
  const first = executeRecipe(canonicalRecipe);
  const second = executeRecipe(canonicalRecipe);

  assert.deepEqual(first, second);
});

test("execution trace conforms to the canonical recipe contract", () => {
  const result = executeRecipe(canonicalRecipe);

  assert.equal(result.ok, true);
  assert.deepEqual(validateExecutionTrace(canonicalRecipe, result.trace), []);
});

test("6174 execution compiles to deterministic valid Remotion scenes", () => {
  const result = executeRecipe(canonicalRecipe);
  const compilation = compileRemotionScenes(result.trace, {
    fps: 30,
    stepFrames: 15,
  });

  assert.deepEqual(validateRemotionScenes(compilation), []);
  assert.equal(compilation.recipeId, canonicalRecipe.id);
  assert.equal(compilation.scenes.length, result.trace.steps.length + 1);
  assert.equal(compilation.durationInFrames, compilation.scenes.length * 15);
  assert.equal(compilation.scenes[0].frame.start, 0);
  assert.equal(
    compilation.scenes.at(-1).frame.end,
    compilation.durationInFrames
  );
  assert.deepEqual(compilation.terminalState, result.trace.terminalState);
  assert.deepEqual(
    compilation.scenes.slice(1).map((scene) => scene.semantic.operationId),
    result.trace.steps.map((step) => step.operationId)
  );

  const replay = compileRemotionScenes(result.trace, {
    fps: 30,
    stepFrames: 15,
  });
  assert.deepEqual(replay, compilation);
});

test("trace validation rejects a canonical operation order mismatch", () => {
  const result = executeRecipe(canonicalRecipe);
  const invalidTrace = structuredClone(result.trace);
  invalidTrace.steps[1].operationId = "subtract";

  assert.ok(
    validateExecutionTrace(canonicalRecipe, invalidTrace).includes(
      "step 1: operation order does not match the canonical recipe."
    )
  );
});

test("operation contract rejects unsupported sort direction", () => {
  const invalidRecipe = structuredClone(canonicalRecipe);
  invalidRecipe.operations[0].parameters.direction = "random";

  assert.ok(
    validateRecipeContracts(invalidRecipe).includes(
      "number/sort requires direction=ascending or direction=descending."
    )
  );
});
