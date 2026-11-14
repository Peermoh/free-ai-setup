import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import '@fontsource/space-grotesk/500.css';
import '@fontsource/space-grotesk/700.css';
import '@fontsource/jetbrains-mono/500.css';
import '@fontsource/jetbrains-mono/700.css';
import '@fontsource/bricolage-grotesque/800.css';
import {useScale} from '../layout';
import {Shot} from '../components/Shot';

/**
 * Not part of the film. The same frame in three looks, so the theme can be
 * chosen by eye. Render stills at 15 / 45 / 75.
 *
 * All three are pure CSS: no images, no video textures, nothing to download
 * at render time. The fonts are self-hosted via @fontsource.
 */

const GROTESK = '"Space Grotesk", sans-serif';
const MONO = '"JetBrains Mono", monospace';
const BRICOLAGE = '"Bricolage Grotesque", sans-serif';

/** A — Console: dark grid, orange glow, monospace headings. */
const Console: React.FC = () => {
  const s = useScale();
  return (
    <AbsoluteFill style={{background: '#08090b'}}>
      {/* faint engineering grid */}
      <AbsoluteFill
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(255,255,255,.04) 0 1px, transparent 1px 56px),' +
            'repeating-linear-gradient(90deg, rgba(255,255,255,.04) 0 1px, transparent 1px 56px)',
        }}
      />
      {/* warm glow behind the subject */}
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(60% 42% at 50% 34%, rgba(255,122,24,.20) 0%, transparent 70%)',
        }}
      />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: 60 * s}}>
        <div style={{width: '100%', paddingBottom: 150 * s}}>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 23 * s,
              fontWeight: 700,
              letterSpacing: 3,
              color: '#ff7a18',
              marginBottom: 10 * s,
            }}
          >
            &gt; 02 — THE ROUTER
          </div>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 54 * s,
              fontWeight: 700,
              color: '#eef1f4',
              letterSpacing: -1 * s,
              lineHeight: 1.1,
              marginBottom: 26 * s,
            }}
          >
            One front door,<br />many providers
          </div>
          <Shot id="topology" width={880} showLabel={false} />
        </div>
        <div
          style={{
            position: 'absolute',
            left: '6%',
            right: '6%',
            bottom: 66 * s,
            textAlign: 'center',
            fontFamily: GROTESK,
            fontSize: 54 * s,
            fontWeight: 700,
            color: '#eef1f4',
            textWrap: 'balance',
          }}
        >
          Every provider sits behind one router.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** B — Editorial: calm, warm, huge tight headline, lots of air. */
const Editorial: React.FC = () => {
  const s = useScale();
  return (
    <AbsoluteFill style={{background: 'linear-gradient(180deg,#121214 0%,#0c0c0e 100%)'}}>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: 66 * s}}>
        <div style={{width: '100%', paddingBottom: 150 * s}}>
          <div
            style={{
              width: 70 * s,
              height: 3 * s,
              background: '#e8a33d',
              marginBottom: 20 * s,
            }}
          />
          <div
            style={{
              fontFamily: GROTESK,
              fontSize: 22 * s,
              fontWeight: 500,
              letterSpacing: 4,
              textTransform: 'uppercase',
              color: '#9b948a',
              marginBottom: 16 * s,
            }}
          >
            Part two · the router
          </div>
          <div
            style={{
              fontFamily: BRICOLAGE,
              fontSize: 78 * s,
              fontWeight: 800,
              color: '#f4efe6',
              letterSpacing: -2.6 * s,
              lineHeight: 1.0,
              marginBottom: 32 * s,
            }}
          >
            One front door,<br />many providers.
          </div>
          <Shot id="topology" width={870} showLabel={false} />
        </div>
        <div
          style={{
            position: 'absolute',
            left: '8%',
            right: '8%',
            bottom: 66 * s,
            textAlign: 'center',
            fontFamily: GROTESK,
            fontSize: 52 * s,
            fontWeight: 500,
            color: '#f4efe6',
            textWrap: 'balance',
          }}
        >
          Every provider sits behind one router.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** C — Aurora: deep blue mesh, glass panel, bright type. */
const Aurora: React.FC = () => {
  const s = useScale();
  return (
    <AbsoluteFill style={{background: '#060a14'}}>
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(48% 36% at 18% 12%, rgba(88,64,255,.55) 0%, transparent 68%),' +
            'radial-gradient(44% 34% at 86% 24%, rgba(31,182,255,.40) 0%, transparent 70%),' +
            'radial-gradient(60% 40% at 60% 96%, rgba(190,60,220,.34) 0%, transparent 72%)',
          filter: `blur(${18 * s}px)`,
        }}
      />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: 56 * s}}>
        <div
          style={{
            width: '100%',
            padding: 34 * s,
            paddingBottom: 40 * s,
            borderRadius: 34 * s,
            background: 'rgba(255,255,255,.055)',
            border: `${1.5 * s}px solid rgba(255,255,255,.14)`,
            backdropFilter: `blur(${22 * s}px)`,
            marginBottom: 150 * s,
          }}
        >
          <div
            style={{
              fontFamily: GROTESK,
              fontSize: 22 * s,
              fontWeight: 700,
              letterSpacing: 3.4,
              textTransform: 'uppercase',
              background: 'linear-gradient(90deg,#8ab6ff,#d79bff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: 12 * s,
            }}
          >
            The router
          </div>
          <div
            style={{
              fontFamily: GROTESK,
              fontSize: 60 * s,
              fontWeight: 700,
              color: '#ffffff',
              letterSpacing: -1.6 * s,
              lineHeight: 1.06,
              marginBottom: 26 * s,
            }}
          >
            One front door,<br />many providers
          </div>
          <Shot id="topology" width={830} showLabel={false} />
        </div>
        <div
          style={{
            position: 'absolute',
            left: '6%',
            right: '6%',
            bottom: 62 * s,
            textAlign: 'center',
            fontFamily: GROTESK,
            fontSize: 54 * s,
            fontWeight: 700,
            color: '#ffffff',
            textWrap: 'balance',
          }}
        >
          Every provider sits behind one router.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const LOOKS = [Console, Editorial, Aurora];

export const Themes: React.FC = () => {
  const frame = useCurrentFrame();
  const Look = LOOKS[Math.min(LOOKS.length - 1, Math.floor(frame / 30))];
  return <Look />;
};
