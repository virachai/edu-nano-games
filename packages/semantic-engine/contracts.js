export const operationContracts = {
  'number/sort': { family: 'numeric', purpose: 'Reorder a sequence without changing its members.', input: 'sequence<number>', output: 'sequence<number>', parameters: { direction: ['ascending', 'descending'] }, invariants: ['element-count', 'element-values', 'element-identity'], semanticEffects: ['ordering'], visualSuggestions: ['compare', 'swap', 'move', 'settle'], validation: ['direction-valid', 'multiset-preserved'] },
  'number/subtract': { family: 'numeric', purpose: 'Compute the difference between two ordered numeric representations.', input: 'digit-sequence', output: 'digit-sequence', parameters: {}, invariants: ['four-digit-format'], semanticEffects: ['numeric-value', 'derived-number'], visualSuggestions: ['align', 'subtract', 'reveal'], validation: ['operands-derived-from-state'] },
  'number/sum-digits': { family: 'numeric', purpose: 'Replace a number with the sum of its decimal digits.', input: 'digit-sequence', output: 'digit-sequence', parameters: {}, invariants: ['four-digit-format'], semanticEffects: ['numeric-value'], visualSuggestions: ['compose', 'sum', 'reveal'], validation: ['digits-derived-from-state'] },
  'number/iterate': { family: 'process', purpose: 'Repeat a semantic transformation until a state condition is met.', input: 'state + operation', output: 'state-history', parameters: { until: 'state condition', maxIterations: 'positive integer', operation: 'semantic operation' }, invariants: ['operation-contract-preserved', 'termination-bound'], semanticEffects: ['repetition', 'state-history'], visualSuggestions: ['repeat', 'step', 'loop'], validation: ['condition-valid', 'bounded', 'nested-operation-valid'] },
  'number/converge': { family: 'process', purpose: 'Represent repeated states approaching a stable target or fixed point.', input: 'state-history', output: 'convergence-relation', parameters: { target: 'semantic state condition' }, invariants: ['history-preserved'], semanticEffects: ['distance-to-target', 'stability'], visualSuggestions: ['focus', 'compress', 'reveal'], validation: ['target-defined'] },
  'number/reveal': { family: 'attention', purpose: 'Make an already-computed semantic result perceptually explicit.', input: 'state or derived value', output: 'same semantic state', parameters: { emphasis: ['normal', 'strong'] }, invariants: ['mathematical-state-unchanged', 'entity-identity-preserved'], semanticEffects: ['perceptual-emphasis'], visualSuggestions: ['highlight', 'focus', 'pulse'], validation: ['state-equality-before-after'] },
};

export function getOperationContract(name) { return operationContracts[name] ?? null; }

export function validateOperationContract(operation) {
  const contract = getOperationContract(operation.operation);
  if (!contract) return [`No contract registered for ${operation.operation}.`];
  const errors = [];
  const allowedParameters = Object.keys(contract.parameters);
  for (const key of Object.keys(operation.parameters ?? {})) {
    if (!allowedParameters.includes(key)) errors.push(`${operation.operation}: unsupported parameter '${key}'.`);
  }
  if (operation.operation === 'number/sort' && !['ascending', 'descending'].includes(operation.parameters?.direction)) errors.push('number/sort requires direction=ascending or direction=descending.');
  if (operation.operation === 'number/iterate') {
    if (!Number.isInteger(operation.parameters?.maxIterations) || operation.parameters.maxIterations < 1) errors.push('number/iterate requires a positive integer maxIterations.');
    if (!operation.parameters?.until) errors.push('number/iterate requires an until condition.');
    if (!operation.parameters?.operation?.operation) errors.push('number/iterate requires a nested operation.');
    else errors.push(...validateOperationContract(operation.parameters.operation));
  }
  if (operation.operation === 'number/converge' && !operation.parameters?.target) errors.push('number/converge requires a target.');
  if (operation.operation === 'number/reveal' && !['normal', 'strong'].includes(operation.parameters?.emphasis)) errors.push('number/reveal requires emphasis=normal or emphasis=strong.');
  return errors;
}

export function validateRecipeContracts(recipe) { return recipe.operations.flatMap(validateOperationContract); }
