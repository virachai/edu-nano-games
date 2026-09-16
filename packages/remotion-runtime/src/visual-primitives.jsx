import React from 'react';
import { AbsoluteFill, interpolate } from 'remotion';

function displayValue(state) {
  if (state == null) return '';
  if (typeof state === 'object') {
    if (state.text != null) return String(state.text);
    if (state.value != null) return String(state.value);
    return JSON.stringify(state);
  }
  return String(state);
}

export function StateCard({ state, opacity = 1, scale = 1, label = 'State' }) {
  return (
    <div style={{ minWidth: 420, padding: '28px 36px', borderRadius: 24, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)', opacity, transform: `scale(${scale})`, fontFamily: 'Inter, system-ui, sans-serif', textAlign: 'center' }}>
      <div style={{ fontSize: 22, opacity: 0.65, marginBottom: 12 }}>{label}</div>
      <div style={{ fontSize: 72, fontWeight: 700, letterSpacing: '-0.04em' }}>{displayValue(state)}</div>
    </div>
  );
}

export function ChangeList({ changes = [], opacity = 1 }) {
  return (
    <div style={{ opacity, marginTop: 28, fontFamily: 'Inter, system-ui, sans-serif' }}>
      {changes.map((change, index) => {
        const label = typeof change === 'string' ? change : (change?.path ?? 'change');
        const hasDiff = typeof change === 'object' && change !== null && ('before' in change || 'after' in change);
        return (
          <div key={`${label}-${index}`} style={{ fontSize: 24, marginTop: 8, opacity: 0.8 }}>
            {hasDiff ? `${label}: ${displayValue(change.before)} → ${displayValue(change.after)}` : label}
          </div>
        );
      })}
    </div>
  );
}

export function SceneTimeline({ scenes, frame }) {
  const safeScenes = Array.isArray(scenes) ? scenes : [];
  const scene = safeScenes.find((candidate) => frame >= candidate.frame.start && frame < candidate.frame.end) ?? safeScenes[safeScenes.length - 1];
  if (!scene) return null;
  const localFrame = Math.max(0, frame - scene.frame.start);
  const progress = interpolate(localFrame, [0, Math.max(1, scene.frame.duration - 1)], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return { scene, progress };
}

export function SemanticScene({ scene, progress }) {
  const enter = interpolate(progress, [0, 0.22, 1], [0, 1, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const scale = interpolate(progress, [0, 0.35, 1], [0.96, 1, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const state = scene.semantic?.outputState ?? scene.semantic?.inputState;
  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', padding: 80, background: '#101318', color: '#fff' }}>
      <div style={{ width: '100%', textAlign: 'center' }}>
        <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 26, opacity: enter * 0.7, marginBottom: 18 }}>{scene.render?.label ?? scene.id}</div>
        <StateCard state={state} opacity={enter} scale={scale} label={scene.render?.phase ?? 'semantic state'} />
        <ChangeList changes={scene.semantic?.changes} opacity={enter} />
      </div>
    </AbsoluteFill>
  );
}
