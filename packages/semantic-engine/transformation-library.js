export const transformationLibrary = {
  'number/sort': { category: 'numeric', description: 'Reorders numeric elements while preserving membership and identity.', reusableAcross: ['Kaprekar numbers', 'ranking', 'ordered statistics'], invariants: ['element-count', 'element-values', 'element-identity'], visualGrammar: ['compare', 'swap', 'move', 'settle'] },
  'number/subtract': { category: 'numeric', description: 'Transforms two ordered numeric representations into their difference.', reusableAcross: ['Kaprekar numbers', 'distance calculations', 'successive differences'], invariants: ['numeric-operation-valid'], visualGrammar: ['align', 'subtract', 'reveal'] },
  'number/sum-digits': { category: 'numeric', description: 'Reduces a number to the sum of its decimal digits.', reusableAcross: ['digital roots', 'digit checks', 'divisibility explanations'], invariants: ['numeric-operation-valid', 'four-digit-format'], visualGrammar: ['compose', 'sum', 'reveal'] },
  'number/iterate': { category: 'process', description: 'Applies a semantic transformation repeatedly under a stopping condition.', reusableAcross: ['Kaprekar numbers', 'digital roots', 'recurrences', 'iterative algorithms', 'dynamical systems'], invariants: ['operation-contract-preserved', 'termination-bound'], visualGrammar: ['repeat', 'step', 'loop'] },
  'number/converge': { category: 'process', description: 'Expresses a state history approaching a stable target or fixed point.', reusableAcross: ['digital roots', 'fixed points', 'numerical methods', 'iterative sequences'], invariants: ['history-preserved'], visualGrammar: ['focus', 'compress', 'reveal'] },
  'number/reveal': { category: 'attention', description: 'Makes an already-computed mathematical result perceptually explicit.', reusableAcross: ['numeric results', 'symbolic simplification', 'proof conclusions', 'geometry', 'digital roots'], invariants: ['mathematical-state-unchanged', 'entity-identity-preserved'], visualGrammar: ['highlight', 'focus', 'pulse'] },
};

export function getTransformation(name) { return transformationLibrary[name] ?? null; }
export function listTransformations() { return Object.keys(transformationLibrary); }
export function validateTransformation(name, operation) {
  const entry = getTransformation(name);
  if (!entry) return [`Unknown transformation: ${name}`];
  if (operation?.operation !== name) return [`Operation ${operation?.operation ?? '(missing)'} does not match transformation ${name}.`];
  return [];
}
