import test from 'node:test';
import assert from 'node:assert/strict';
import canonicalRecipe from '../math-motion/concepts/6174/recipe.json' with { type: 'json' };
import { executeRecipe } from '../packages/semantic-engine/index.js';

test('6174 semantic execution derives the canonical state sequence', () => {
  const result = executeRecipe(canonicalRecipe);

  assert.equal(result.ok, true);
  assert.equal(result.trace.initialState.value, 3524);
  assert.deepEqual(
    result.trace.steps.map(step => [step.operationId, step.outputState.text]),
    [
      ['sort-descending', '5432'],
      ['sort-ascending', '2345'],
      ['subtract', '3087'],
      ['sort-descending', '8730'],
      ['sort-ascending', '0378'],
      ['subtract', '8352'],
      ['sort-descending', '8532'],
      ['sort-ascending', '2358'],
      ['subtract', '6174'],
    ],
  );
  assert.equal(result.trace.terminalState.text, '6174');
});

test('6174 sorting preserves the digit multiset across semantic transitions', () => {
  const result = executeRecipe(canonicalRecipe);
  const sortSteps = result.trace.steps.filter(step => step.operation === 'number/sort');

  for (const step of sortSteps) {
    assert.deepEqual([...step.inputState.digits].sort(), [...step.outputState.digits].sort());
  }
});

test('6174 execution replay produces an identical semantic trace', () => {
  const first = executeRecipe(canonicalRecipe);
  const second = executeRecipe(structuredClone(canonicalRecipe));

  assert.deepEqual(first.trace, second.trace);
});
