export const kaprekarRecipe = {
  schemaVersion: '1.0', id: 'kaprekar-6174', title: "Kaprekar's Constant", domain: 'number',
  description: 'Repeatedly sort four digits in opposite directions and subtract until 6174.',
  initialState: { value: 3524 },
  entities: [{ id: 'digits', type: 'digit-sequence', role: 'input' }, { id: 'result', type: 'number', role: 'derived-output' }],
  operations: [
    { id: 'sort-descending', operation: 'number/sort', target: 'digits', parameters: { direction: 'descending' }, expect: { preserves: ['element-values', 'element-count'], changes: ['ordering'] }, visual: { suggest: ['compare', 'swap', 'move', 'settle'] } },
    { id: 'sort-ascending', operation: 'number/sort', target: 'digits', parameters: { direction: 'ascending' }, expect: { preserves: ['element-values', 'element-count'], changes: ['ordering'] }, visual: { suggest: ['compare', 'swap', 'move', 'settle'] } },
    { id: 'subtract', operation: 'number/subtract', target: 'digits', expect: { changes: ['numeric-value'] }, visual: { suggest: ['align', 'subtract', 'reveal'] } },
  ],
  checkpoints: [{ id: 'initial', condition: { field: 'value', equals: '$initialState.value' } }, { id: 'fixed-point', condition: { field: 'value', equals: 6174 } }],
  validation: { terminal: { field: 'value', equals: 6174 }, maxIterations: 8 }, metadata: { authoringMode: 'prototype-lab', deterministic: true },
};

export function cloneRecipe(recipe, initialValue) {
  return { ...recipe, initialState: { value: Number(initialValue) }, operations: recipe.operations.map(operation => ({ ...operation, parameters: operation.parameters ? { ...operation.parameters } : undefined, expect: operation.expect ? { ...operation.expect } : undefined, visual: operation.visual ? { ...operation.visual } : undefined })) };
}

const rendererParameterNames = new Set(['x', 'y', 'frame', 'duration', 'easing', 'position', 'scale']);
export function validateRecipe(recipe) {
  const errors = [];
  if (recipe.schemaVersion !== '1.0') errors.push('Unsupported Recipe schema version.');
  if (!recipe.id) errors.push('Recipe id is required.');
  if (!recipe.domain) errors.push('Recipe domain is required.');
  if (!recipe.initialState) errors.push('Recipe initialState is required.');
  if (!Array.isArray(recipe.operations) || recipe.operations.length === 0) errors.push('Recipe needs operations.');
  if (new Set((recipe.operations ?? []).map(op => op.id)).size !== (recipe.operations ?? []).length) errors.push('Operation ids must be unique.');
  for (const operation of recipe.operations ?? []) {
    if (!operation.id || !operation.operation) errors.push('Every operation needs id and operation.');
    if (operation.parameters && Object.keys(operation.parameters).some(key => rendererParameterNames.has(key))) errors.push(`Operation ${operation.id} contains renderer-oriented parameters.`);
  }
  return errors;
}
