import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, FONT} from '../config';
import {useScale} from '../layout';
import {Shot} from '../components/Shot';
import {Ring} from '../components/Ring';
import {Card} from '../components/Card';

/**
 * Not part of the film. Four sample frames showing the look we would build
 * the scenes in: type, how a real screenshot is framed, how we point at
 * something inside one, and how drawn cards sit next to real screens.
 * Render stills at frames 15 / 45 / 75 / 105.
 */

const Kicker: React.FC<{children: React.ReactNode}> = ({children}) => {
  const s = useScale();
  return (
    <div
      style={{
        fontFamily: FONT,
        fontSize: 26 * s,
        letterSpacing: 3,
        color: C.muted,
        textTransform: 'uppercase',
        marginBottom: 18 * s,
      }}
    >
      {children}
    </div>
  );
};

const Cap: React.FC<{children: React.ReactNode}> = ({children}) => {
  const s = useScale();
  return (
    <div
      style={{
        position: 'absolute',
        left: '5%',
        right: '5%',
        bottom: 70 * s,
        textAlign: 'center',
        fontFamily: FONT,
        fontSize: 56 * s,
        lineHeight: 1.25,
        fontWeight: 600,
        color: C.text,
        textWrap: 'balance',
      }}
    >
      {children}
    </div>
  );
};

/** A: type only — how a question frame reads. */
const PanelA: React.FC = () => {
  const s = useScale();
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div style={{textAlign: 'center', paddingBottom: 120 * s}}>
        <Kicker>Free AI, three ways</Kicker>
        <div
          style={{
            fontFamily: FONT,
            fontSize: 86 * s,
            fontWeight: 750,
            color: C.text,
            lineHeight: 1.12,
            letterSpacing: -1.5 * s,
            maxWidth: 900 * s,
            textWrap: 'balance',
          }}
        >
          Where can an AI model actually run?
        </div>
      </div>
      <Cap>Three places. Each one costs you something different.</Cap>
    </AbsoluteFill>
  );
};

/** B: a real screenshot as the hero of a scene. */
const PanelB: React.FC = () => {
  const s = useScale();
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div style={{paddingBottom: 120 * s}}>
        <Kicker>The router</Kicker>
        <Shot id="topology" width={880} />
      </div>
      <Cap>One router in front. Every provider behind it.</Cap>
    </AbsoluteFill>
  );
};

/** C: pointing at one thing inside a real screenshot. */
const PanelC: React.FC = () => {
  const s = useScale();
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div style={{position: 'relative', paddingBottom: 120 * s}}>
        <Kicker>The order</Kicker>
        <Shot
          id="combos"
          width={940}
          overlay={
            <Ring
              left="1.5%"
              top="37%"
              width="92%"
              height="55%"
              note="tried in this order"
              noteSide="top"
            />
          }
        />
      </div>
      <Cap>Busy or out of quota? The next one answers.</Cap>
    </AbsoluteFill>
  );
};

/** D: drawn cards and a real screen in the same frame. */
const PanelD: React.FC = () => {
  const s = useScale();
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div style={{paddingBottom: 120 * s, textAlign: 'center'}}>
        <div style={{display: 'flex', gap: 16 * s, marginBottom: 30 * s}}>
          <Card label="Free tiers" sub="fast, capped" width={290} highlight={C.green} />
          <Card label="Your laptop" sub="slow, unlimited" width={290} />
          <Card label="Kaggle GPU" sub="big, hours/week" width={290} />
        </div>
        <Shot id="providerMenu" width={880} />
      </div>
      <Cap>Each one has a catch.</Cap>
    </AbsoluteFill>
  );
};

const PANELS = [PanelA, PanelB, PanelC, PanelD];

export const ThemePreview: React.FC = () => {
  const frame = useCurrentFrame();
  const Panel = PANELS[Math.min(PANELS.length - 1, Math.floor(frame / 30))];
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Panel />
    </AbsoluteFill>
  );
};
