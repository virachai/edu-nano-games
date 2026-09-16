import React from 'react';
import { Composition } from 'remotion';
import { SemanticComposition } from './SemanticComposition.jsx';

const fallbackCompilation = {
  fps: 30,
  durationInFrames: 30,
  scenes: [],
};

export function RemotionRoot() {
  return (
    <Composition
      id="SemanticComposition"
      component={SemanticComposition}
      width={1920}
      height={1080}
      fps={30}
      durationInFrames={30}
      defaultProps={{ compilation: fallbackCompilation }}
      calculateMetadata={({ props }) => {
        const compilation = props?.compilation ?? fallbackCompilation;
        return {
          fps: compilation.fps ?? 30,
          durationInFrames: compilation.durationInFrames ?? 30,
          props: { compilation },
        };
      }}
    />
  );
}
