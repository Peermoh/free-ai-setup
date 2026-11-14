import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import '@fontsource/jetbrains-mono/500.css';
import '@fontsource/jetbrains-mono/700.css';
import '@fontsource/space-grotesk/700.css';
import {useScale} from '../layout';
import {Shot} from '../components/Shot';
import {Atmosphere, DesignFrame, Floor, GROTESK, Hud, INK, MONO} from './constellation-lib';
import {Fill, Framed, Marked, Measure, Outline, Tag} from './type-lib';

/**
 * Frame 0: the light Kaggle screenshots as they are, next to the inverted
 * treatment, so the difference can be judged rather than argued about.
 * Frame 1: the Kaggle scene as it would actually appear.
 */

const Shell: React.FC<{children: React.ReactNode}> = ({children}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: '#06040e'}}>
      <Atmosphere />
      <Floor drift={(frame * 0.6) % 118} />
      {children}
    </AbsoluteFill>
  );
};

/** A/B: untouched vs treated. */
const Compare: React.FC = () => {
  const s = useScale();
  const cap = (t: string) => (
    <div
      style={{
        fontFamily: MONO,
        fontSize: 20 * s,
        letterSpacing: 2,
        color: 'rgba(236,234,255,.6)',
        marginBottom: 10 * s,
      }}
    >
      {t}
    </div>
  );
  return (
    <Shell>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', gap: 34 * s}}>
        <div>
          {cap('AS CAPTURED — light theme')}
          <Shot id="kaggleFlow" width={820} showLabel={false} invert={false} />
        </div>
        <div>
          {cap('TREATED — inverted into the palette')}
          <Shot id="kaggleFlow" width={820} showLabel={false} invert />
        </div>
      </AbsoluteFill>
      <Hud tl="TEST" tr="KAGGLE" bl="light-theme fix" br="A / B" />
    </Shell>
  );
};

/** The Kaggle scene, as it would play. */
const Scene: React.FC = () => {
  const s = useScale();
  return (
    <Shell>
      <DesignFrame>
        <div style={{position: 'absolute', left: 104, top: 150}}>
          <Framed label="05 / A BORROWED GPU" pad={28}>
            <div style={{lineHeight: 0.98}}>
              <div>
                <Outline size={88}>KAGGLE LENDS</Outline>
              </div>
              <div style={{marginTop: 26}}>
                <Marked size={88}>TWO GPUs</Marked>{' '}
                <Fill size={88}>FREE</Fill>
              </div>
            </div>
            <div style={{marginTop: 24, display: 'flex', gap: 10}}>
              <Tag>2 × TESLA T4</Tag>
              <Tag>27B MODEL</Tag>
              <Tag>HOURS / WEEK</Tag>
            </div>
            <Measure width={620} label="SESSION: RUN ALL · FIXED ADDRESS" />
          </Framed>
        </div>
      </DesignFrame>

      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'flex-end'}}>
        <div style={{paddingBottom: 232 * s, display: 'flex', flexDirection: 'column', gap: 16 * s}}>
          <Shot id="gpus" width={620} showLabel={false} />
          <Shot id="kaggleFlow" width={820} showLabel={false} />
        </div>
      </AbsoluteFill>

      <div
        style={{
          position: 'absolute',
          left: '6%',
          right: '6%',
          bottom: 72 * s,
          textAlign: 'center',
          fontFamily: GROTESK,
          fontWeight: 700,
          fontSize: 50 * s,
          color: INK,
          textWrap: 'balance',
        }}
      >
        A free GPU, at the same address every time.
      </div>
      <Hud tl="SEQ 05 / 10" tr="KAGGLE" bl="2 × T4 · 15360 MiB" br="camera: settled" />
    </Shell>
  );
};

export const KaggleTest: React.FC = () => {
  const frame = useCurrentFrame();
  return frame < 30 ? <Compare /> : <Scene />;
};
