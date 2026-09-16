import canonicalKaprekarRecipe from '../../math-motion/concepts/6174/recipe.json' with { type: 'json' };

export const kaprekarRecipe = canonicalKaprekarRecipe;

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
