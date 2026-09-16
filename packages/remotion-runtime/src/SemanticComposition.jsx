import React from 'react';
import { useCurrentFrame } from 'remotion';
import { SceneTimeline, SemanticScene } from './visual-primitives.jsx';

export function SemanticComposition({ compilation }) {
  const frame = useCurrentFrame();
  const timeline = SceneTimeline({ scenes: compilation?.scenes, frame });
  if (!timeline) return null;
  return <SemanticScene scene={timeline.scene} progress={timeline.progress} />;
}
