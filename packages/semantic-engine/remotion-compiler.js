/**
 * Phase 15 — Remotion compiler target.
 *
 * This module is intentionally dependency-free. It compiles an already validated
 * semantic execution trace into deterministic scene descriptors that a future
 * Remotion React layer can render. No mathematical operation is performed here.
 */

const DEFAULT_FPS = 30;
const DEFAULT_STEP_FRAMES = 30;

function clone(value) {
  if (value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(clone);
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, clone(item)]));
}

function assertTrace(trace) {
  if (!trace || typeof trace !== 'object') throw new Error('Remotion compiler requires an execution trace.');
  if (!trace.recipeId) throw new Error('Execution trace requires recipeId.');
  if (!trace.initialState) throw new Error('Execution trace requires initialState.');
  if (!Array.isArray(trace.steps)) throw new Error('Execution trace requires steps.');
  if (!trace.terminalState) throw new Error('Execution trace requires terminalState.');
}

function sceneFromStep(step, index, stepFrames) {
  const startFrame = index * stepFrames;
  const endFrame = startFrame + stepFrames;
  return {
    id: `scene-${index}`,
    frame: { start: startFrame, end: endFrame, duration: stepFrames },
    semantic: {
      operationId: step.operationId,
      operation: step.operation,
      iteration: step.iteration,
      inputState: clone(step.inputState),
      outputState: clone(step.outputState),
      changes: [...(step.changes ?? [])],
    },
    visualIntent: clone(step.visualIntent ?? {}),
    render: {
      phase: inferPhase(step),
      label: step.operationId,
      value: step.outputState?.text ?? String(step.outputState?.value ?? ''),
    },
  };
}

function inferPhase(step) {
  if (step.operation === 'number/sort') return `sort-${step.parameters?.direction ?? 'ascending'}`;
  if (step.operation === 'number/subtract') return 'subtract';
  if (step.operation === 'number/sum-digits') return 'sum-digits';
  if (step.operation === 'number/iterate') return 'iterate';
  if (step.operation === 'number/converge') return 'converge';
  if (step.operation === 'number/reveal') return 'reveal';
  return 'transition';
}

export function compileRemotionScenes(trace, options = {}) {
  assertTrace(trace);
  const fps = Number.isInteger(options.fps) && options.fps > 0 ? options.fps : DEFAULT_FPS;
  const stepFrames = Number.isInteger(options.stepFrames) && options.stepFrames > 0 ? options.stepFrames : DEFAULT_STEP_FRAMES;
  const initialScene = {
    id: 'scene-initial',
    frame: { start: 0, end: stepFrames, duration: stepFrames },
    semantic: { inputState: clone(trace.initialState) },
    visualIntent: { suggest: ['focus'] },
    render: { phase: 'initial', label: 'Initial state', value: trace.initialState.text ?? String(trace.initialState.value ?? '') },
  };
  const scenes = [initialScene, ...trace.steps.map((step, index) => sceneFromStep(step, index + 1, stepFrames))];
  return {
    schemaVersion: '1.0',
    renderer: 'remotion',
    recipeId: trace.recipeId,
    fps,
    durationInFrames: scenes.length * stepFrames,
    scenes,
    terminalState: clone(trace.terminalState),
  };
}

export function validateRemotionScenes(compilation) {
  const errors = [];
  if (compilation?.schemaVersion !== '1.0') errors.push('Unsupported Remotion compilation schema version.');
  if (compilation?.renderer !== 'remotion') errors.push('Compilation renderer must be remotion.');
  if (!Number.isInteger(compilation?.fps) || compilation.fps < 1) errors.push('Compilation fps must be a positive integer.');
  if (!Number.isInteger(compilation?.durationInFrames) || compilation.durationInFrames < 1) errors.push('Compilation durationInFrames must be a positive integer.');
  if (!Array.isArray(compilation?.scenes) || compilation.scenes.length < 1) errors.push('Compilation requires at least one scene.');
  if (Array.isArray(compilation?.scenes)) {
    const ids = new Set();
    let cursor = 0;
    for (let index = 0; index < compilation.scenes.length; index += 1) {
      const scene = compilation.scenes[index];
      const start = scene?.frame?.start;
      const duration = scene?.frame?.duration;
      const end = scene?.frame?.end;
      if (!Number.isInteger(duration) || duration < 1) errors.push(`Scene ${index} has an invalid duration.`);
      if (start !== cursor) errors.push(`Scene ${index} has a non-contiguous start frame.`);
      if (end !== start + duration) errors.push(`Scene ${index} has an invalid end frame.`);
      if (!scene?.id) errors.push(`Scene ${index} is missing an id.`);
      else if (ids.has(scene.id)) errors.push(`Scene ${index} has a duplicate id.`);
      else ids.add(scene.id);
      if (!scene?.semantic) errors.push(`Scene ${index} is missing semantic state.`);
      if (!scene?.render?.phase) errors.push(`Scene ${index} is missing render phase.`);
      cursor = Number.isInteger(end) ? end : cursor;
    }
    if (compilation.durationInFrames !== cursor) errors.push('Compilation duration does not match scene timeline.');
  }
  if (!compilation?.terminalState || typeof compilation.terminalState !== 'object') errors.push('Compilation is missing terminal semantic state.');
  return errors;
}
