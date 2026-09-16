export function normalizeFourDigit(value) {
  const digits = String(value ?? '').replace(/\D/g, '').slice(0, 4);
  return digits.padStart(4, '0');
}

export function createInitialState(value) {
  const text = normalizeFourDigit(value);
  return {
    value: Number(text),
    text,
    digits: [...text].map((digit, index) => ({ id: `digit-${index}`, value: Number(digit), position: index })),
  };
}

function sortDigits(state, direction) {
  const ordered = [...state.digits].sort((a, b) => direction === 'descending' ? b.value - a.value : a.value - b.value);
  return { ...state, digits: ordered.map((digit, position) => ({ ...digit, position })) };
}

function subtractState(state) {
  const desc = [...state.digits].sort((a, b) => b.value - a.value);
  const asc = [...state.digits].sort((a, b) => a.value - b.value);
  return createInitialState(Number(desc.map(d => d.value).join('')) - Number(asc.map(d => d.value).join('')));
}

function sumDigits(state) {
  return createInitialState(state.digits.reduce((sum, digit) => sum + digit.value, 0));
}

function cloneState(state) { return { ...state, digits: state.digits.map(digit => ({ ...digit })) }; }

function matchesCondition(state, condition) {
  if (!condition) return false;
  if (condition.field === 'value' && condition.predicate === 'single-digit') return state.value >= 0 && state.value < 10;
  if (condition.field === 'value' && Object.prototype.hasOwnProperty.call(condition, 'equals')) return state.value === condition.equals;
  if (condition.field === 'text' && Object.prototype.hasOwnProperty.call(condition, 'equals')) return state.text === condition.equals;
  return false;
}

function iterateState(state, operation) {
  const { maxIterations, until, operation: nestedOperation } = operation.parameters ?? {};
  if (!Number.isInteger(maxIterations) || maxIterations < 1) throw new Error('number/iterate requires a positive integer maxIterations.');
  if (!until) throw new Error('number/iterate requires an until condition.');
  if (!nestedOperation?.operation) throw new Error('number/iterate requires a nested operation.');
  const history = [describeState(state)];
  let current = cloneState(state);
  for (let index = 0; index < maxIterations; index += 1) {
    current = applyOperation(current, nestedOperation);
    history.push(describeState(current));
    if (matchesCondition(current, until)) break;
  }
  return { ...current, history };
}

function convergeState(state, operation) {
  const target = operation.parameters?.target;
  if (!target) throw new Error('number/converge requires a target.');
  const history = state.history ?? [describeState(state)];
  return { ...state, convergence: { target, reached: matchesCondition(state, target), historyLength: history.length } };
}

function revealState(state, operation) { return { ...state, emphasis: operation.parameters?.emphasis ?? 'strong' }; }

export function applyOperation(state, operation) {
  switch (operation.operation) {
    case 'number/sort': return sortDigits(state, operation.parameters?.direction ?? 'ascending');
    case 'number/subtract': return subtractState(state);
    case 'number/sum-digits': return sumDigits(state);
    case 'number/iterate': return iterateState(state, operation);
    case 'number/converge': return convergeState(state, operation);
    case 'number/reveal': return revealState(state, operation);
    default: throw new Error(`Unsupported operation: ${operation.operation}`);
  }
}

export function describeState(state) {
  return { value: state.value, text: state.text, digits: state.digits.map(d => d.value), history: state.history, convergence: state.convergence, emphasis: state.emphasis };
}

export function validateState(state) {
  const errors = [];
  if (!/^\d{4}$/.test(state.text)) errors.push('State text must contain exactly four digits.');
  if (!Array.isArray(state.digits) || state.digits.length !== 4) errors.push('State must contain four digit entities.');
  if (state.digits.some(d => !Number.isInteger(d.value) || d.value < 0 || d.value > 9)) errors.push('Every digit entity must contain an integer from 0 to 9.');
  return errors;
}
