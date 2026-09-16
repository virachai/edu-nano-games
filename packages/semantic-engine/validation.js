import { getOperationContract, validateRecipeContracts } from './contracts.js';
import { validateState } from './math-state.js';
import { validateRecipe } from './recipe.js';

export function validateExecutionTrace(recipe, trace) {
  const errors = [];
  if (!trace) return ['Execution trace is missing.'];
  errors.push(...validateState({ value: trace.initialState.value, text: trace.initialState.text, digits: trace.initialState.digits.map((value, index) => ({ id: `digit-${index}`, value, position: index })) }).map(error => `initialState: ${error}`));

  const operationsById = new Map((recipe.operations ?? []).map(operation => [operation.id, operation]));
  let previous = trace.initialState;
  for (const step of trace.steps) {
    const recipeOperation = operationsById.get(step.operationId);
    const expectedOperation = recipe.operations?.[step.index % (recipe.operations?.length ?? 1)];
    const contract = getOperationContract(step.operation);
    if (!contract) {
      errors.push(`step ${step.index}: unknown operation contract ${step.operation}.`);
      continue;
    }
    if (!recipeOperation) errors.push(`step ${step.index}: operation id ${step.operationId} is not defined by the recipe.`);
    if (expectedOperation && expectedOperation.id !== step.operationId) errors.push(`step ${step.index}: operation order does not match the canonical recipe.`);
    if (step.inputState.text !== previous.text) errors.push(`step ${step.index}: input state does not match previous output.`);
    if (!step.outputState || typeof step.outputState.text !== 'string') {
      errors.push(`step ${step.index}: output state is missing.`);
      continue;
    }
    if (!Array.isArray(step.visualIntent?.suggest)) errors.push(`step ${step.index}: visual intent suggestions are missing.`);

    for (const preserved of recipeOperation?.expect?.preserves ?? []) {
      if (preserved === 'element-count' && step.inputState.digits.length !== step.outputState.digits.length) errors.push(`step ${step.index}: expected element-count to be preserved.`);
      if (preserved === 'element-values') {
        const before = [...step.inputState.digits].sort().join('');
        const after = [...step.outputState.digits].sort().join('');
        if (before !== after) errors.push(`step ${step.index}: expected element-values to be preserved.`);
      }
    }
    for (const change of recipeOperation?.expect?.changes ?? []) {
      if (!step.changes.includes(change)) errors.push(`step ${step.index}: expected change ${change} was not observed.`);
    }
    previous = step.outputState;
  }
  if (trace.terminalState?.text !== previous.text) errors.push('terminalState does not match the final step.');
  return errors;
}

export function validateVisualFrame(frame) {
  const errors = [];
  if (!frame || typeof frame !== 'object') return ['Visual frame is missing.'];
  if (!frame.phase) errors.push('Visual frame phase is missing.');
  if (!frame.label) errors.push('Visual frame label is missing.');
  if (typeof frame.number !== 'string') errors.push('Visual frame number must be a string.');
  if (!Array.isArray(frame.intent)) errors.push('Visual frame intent must be an array.');
  return errors;
}

export function validateRecipeSystem(recipe, execute, render) {
  const errors = [...validateRecipe(recipe), ...validateRecipeContracts(recipe)];
  const execution = execute(recipe);
  if (!execution.ok && !execution.trace) return { ok: false, errors: [...errors, ...(execution.errors ?? [])], execution };
  errors.push(...(execution.trace ? validateExecutionTrace(recipe, execution.trace) : ['No execution trace returned.']));
  if (execution.trace) {
    errors.push(...validateVisualFrame(render(null, execution.trace)).map(error => `initial frame: ${error}`));
    for (const step of execution.trace.steps) errors.push(...validateVisualFrame(render(step, execution.trace)).map(error => `step ${step.index}: ${error}`));
  }
  return { ok: errors.length === 0 && execution.ok, errors, execution };
}
