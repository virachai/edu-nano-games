import { applyOperation, createInitialState, describeState, validateState } from './math-state.js';
import { validateRecipe } from './recipe.js';

function resolveCheckpoint(condition, state, initialState) {
  if (!condition) return false;
  const expected = condition.equals === '$initialState.value' ? initialState.value : condition.equals;
  if (condition.predicate === 'single-digit') return state.value >= 0 && state.value < 10;
  return state[condition.field] === expected;
}

function matchesTerminal(state, terminal) {
  if (!terminal) return false;
  if (terminal.predicate === 'single-digit') return state.value >= 0 && state.value < 10;
  return state[terminal.field] === terminal.equals;
}

function semanticChanges(before, after) {
  const changes = [];
  if (before.value !== after.value) changes.push('numeric-value');
  if (before.digits.map(d => d.value).join('') !== after.digits.map(d => d.value).join('')) changes.push('ordering');
  if (before.emphasis !== after.emphasis) changes.push('perceptual-emphasis');
  if (JSON.stringify(before.history) !== JSON.stringify(after.history)) changes.push('state-history');
  return changes;
}

export function executeRecipe(recipe) {
  const recipeErrors = validateRecipe(recipe);
  if (recipeErrors.length) return { ok: false, errors: recipeErrors, trace: null };
  const initialState = createInitialState(recipe.initialState.value);
  const stateErrors = validateState(initialState);
  if (stateErrors.length) return { ok: false, errors: stateErrors, trace: null };
  const steps = [];
  let state = initialState;
  const maxIterations = recipe.validation?.maxIterations ?? 8;
  for (let iteration = 0; iteration < maxIterations; iteration += 1) {
    for (const operation of recipe.operations) {
      const before = state;
      let after;
      try { after = applyOperation(before, operation); } catch (error) { return { ok: false, errors: [error.message], trace: null }; }
      const errors = validateState(after);
      if (errors.length) return { ok: false, errors, trace: null };
      steps.push({ index: steps.length, iteration, operationId: operation.id, operation: operation.operation, inputState: describeState(before), parameters: operation.parameters ?? {}, outputState: describeState(after), changes: semanticChanges(before, after), invariants: operation.expect ?? {}, visualIntent: operation.visual ?? {} });
      state = after;
    }
    if (matchesTerminal(state, recipe.validation?.terminal)) break;
  }
  const terminal = recipe.validation?.terminal;
  const terminalOk = !terminal || matchesTerminal(state, terminal);
  const checkpoints = (recipe.checkpoints ?? []).map(checkpoint => ({ id: checkpoint.id, reached: resolveCheckpoint(checkpoint.condition, state, initialState) }));
  return { ok: terminalOk, errors: terminalOk ? [] : ['Terminal state did not satisfy the recipe condition.'], trace: { recipeId: recipe.id, initialState: describeState(initialState), steps, terminalState: describeState(state), checkpoints } };
}

export function compileVisualFrame(step, trace) {
  if (!step) return { phase: 'initial', label: 'Initial state', number: trace.initialState.text, intent: ['focus'] };
  const intent = step.visualIntent?.suggest ?? [];
  let phase = 'transition';
  if (step.operation === 'number/sort') phase = step.parameters.direction === 'descending' ? 'sort-descending' : 'sort-ascending';
  if (step.operation === 'number/subtract') phase = 'subtract';
  if (step.operation === 'number/sum-digits') phase = 'sum-digits';
  if (step.operation === 'number/iterate') phase = 'iterate';
  if (step.operation === 'number/converge') phase = 'converge';
  if (step.operation === 'number/reveal') phase = 'reveal';
  return { phase, label: step.operationId, number: step.outputState.text, before: step.inputState.text, intent, iteration: step.iteration };
}
