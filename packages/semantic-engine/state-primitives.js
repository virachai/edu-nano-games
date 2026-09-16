/**
 * Renderer-independent generic state mechanics.
 * Domain operations remain responsible for mathematical meaning.
 */

export function cloneState(state) {
  if (state === null || typeof state !== 'object') return state;
  if (Array.isArray(state)) return state.map(cloneState);
  return Object.fromEntries(Object.entries(state).map(([key, value]) => [key, cloneState(value)]));
}

export function getStateValue(state, path) {
  if (!path) return state;
  return String(path).split('.').reduce((value, key) => value?.[key], state);
}

export function setStateValue(state, path, value) {
  const keys = String(path).split('.');
  const result = cloneState(state);
  let cursor = result;
  keys.slice(0, -1).forEach(key => {
    if (cursor[key] === null || typeof cursor[key] !== 'object') cursor[key] = {};
    cursor = cursor[key];
  });
  cursor[keys[keys.length - 1]] = value;
  return result;
}

export function appendHistory(state, entry) {
  return setStateValue(state, 'history', [
    ...(Array.isArray(state?.history) ? state.history : []),
    cloneState(entry),
  ]);
}

export function mapStateCollection(state, path, mapper) {
  const collection = getStateValue(state, path);
  if (!Array.isArray(collection)) throw new Error(`State collection '${path}' must be an array.`);
  return setStateValue(state, path, collection.map((item, index) => mapper(cloneState(item), index)));
}

export function stateEquals(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

export function evaluateCondition(state, condition) {
  if (!condition) return false;
  const value = getStateValue(state, condition.field ?? condition.path);
  if (condition.predicate === 'single-digit') return Number.isFinite(value) && value >= 0 && value < 10;
  if (condition.predicate === 'zero') return value === 0;
  if (Object.prototype.hasOwnProperty.call(condition, 'equals')) return stateEquals(value, condition.equals);
  if (condition.predicate === 'non-negative-integer') return Number.isInteger(value) && value >= 0;
  return false;
}

export function executeUntil(initialState, step, condition, maxIterations = 10) {
  if (!Number.isInteger(maxIterations) || maxIterations < 1) throw new Error('maxIterations must be a positive integer.');
  let state = cloneState(initialState);
  const states = [cloneState(state)];
  for (let iteration = 0; iteration < maxIterations && !evaluateCondition(state, condition); iteration += 1) {
    state = cloneState(step(state, iteration));
    states.push(cloneState(state));
  }
  return { state, states, reached: evaluateCondition(state, condition) };
}

export function createTransition({ id, before, after, operation, iteration = 0, parameters = {}, changes = [] }) {
  return {
    id,
    iteration,
    operation,
    parameters: cloneState(parameters),
    inputState: cloneState(before),
    outputState: cloneState(after),
    changes: [...changes],
  };
}
