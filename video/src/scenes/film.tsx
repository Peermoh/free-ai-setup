import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Shot} from '../components/Shot';
import {Terminal, Line} from '../components/Terminal';
import {Flow} from '../components/Flow';
import {ShotStack} from '../components/ShotStack';
import {DesignFrame, GREEN, GROTESK, INK, Links, MONO, Node, P3, project, VIOLET} from '../design/world';
import {Fill, Framed, Marked, Measure, Outline, Tag} from '../design/type';
import {CutFlash, Pop, Rise, ShotIn, useCount, useIn, Wipe} from '../design/anim';
import {SceneId} from '../config';

/**
 * The nine scenes of the how-to. Every scene is a list of beats: something
 * arrives roughly every second, so nothing ever sits still long enough to
 * read as a slide.
 *
 * Authored inside <DesignFrame>, i.e. a 1080 square, so no scale factors.
 */

const ROUTER: P3 = {x: 0, y: 30, z: 60};
const NODES: {p: P3; label: string; sub: string}[] = [
  {p: {x: -300, y: -200, z: 420}, label: 'Groq', sub: 'free tier'},
  {p: {x: 300, y: -240, z: 500}, label: 'Gemini', sub: 'free tier'},
  {p: {x: -430, y: 80, z: 760}, label: 'NVIDIA', sub: 'free trial'},
  {p: {x: 430, y: 55, z: 820}, label: 'OpenRouter', sub: 'free + paid'},
  {p: {x: -250, y: 320, z: 1150}, label: 'Kaggle', sub: 'borrowed GPU'},
  {p: {x: 270, y: 340, z: 1250}, label: 'your laptop', sub: 'private, last'},
];

/** A step badge in the corner of a how-to scene. */
const Step: React.FC<{n: number; of?: number; label: string}> = ({n, of = 4, label}) => (
  <Rise delay={2} y={-14}>
    <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
      <div
        style={{
          fontFamily: GROTESK,
          fontWeight: 700,
          fontSize: 44,
          color: '#06040e',
          background: VIOLET,
          borderRadius: 10,
          padding: '2px 16px',
        }}
      >
        {n}
      </div>
      <div style={{fontFamily: MONO, fontSize: 19, letterSpacing: 3, color: 'rgba(236,234,255,.55)'}}>
        {`STEP ${n} OF ${of} · ${label}`}
      </div>
    </div>
  </Rise>
);

const Centre: React.FC<{children: React.ReactNode; bottom?: number}> = ({
  children,
  bottom = 190,
}) => (
  <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
    <div style={{paddingBottom: bottom}}>{children}</div>
  </AbsoluteFill>
);

/* ------------------------------------------------------------------ hook */
const Hook: React.FC = () => (
  <DesignFrame>
    <CutFlash />
    <div style={{position: 'absolute', left: 100, top: 290}}>
      <Rise delay={0} y={30}>
        <div style={{fontFamily: MONO, fontSize: 19, letterSpacing: 5, color: '#c3a4ff'}}>
          [ HOW TO BUILD IT ]
        </div>
      </Rise>
      <div style={{lineHeight: 0.98, marginTop: 18}}>
        <Rise delay={6} y={34}>
          <Outline size={100}>RUN REAL AI</Outline>
        </Rise>
        <Rise delay={14} y={34}>
          <Fill size={100}>ON YOUR LAPTOP</Fill>
        </Rise>
        <div style={{marginTop: 22}}>
          <Wipe delay={26}>
            <Marked size={100}>FOR FREE</Marked>
          </Wipe>
        </div>
      </div>
      <div style={{marginTop: 30, display: 'flex', gap: 10}}>
        {['FREE TIERS', 'LOCAL MODEL', 'FREE GPU'].map((t, i) => (
          <Pop key={t} delay={38 + i * 6}>
            <Tag>{t}</Tag>
          </Pop>
        ))}
      </div>
    </div>
  </DesignFrame>
);

/* ------------------------------------------------------------------ flow */
const FlowScene: React.FC = () => (
  <DesignFrame>
    <CutFlash />
    <div style={{position: 'absolute', left: 100, top: 110}}>
      <Step n={0} of={4} label="WHAT YOU END UP WITH" />
    </div>
    <div style={{position: 'absolute', left: 80, top: 215}}>
      <Flow
        width={920}
        height={640}
        boxes={[
          {id: 'chat', label: 'Open WebUI', sub: 'one chat page', x: 460, y: 60, at: 6},
          {id: 'router', label: 'OmniRoute', sub: 'the router', x: 460, y: 250, at: 30, tone: 'router'},
          {id: 'free', label: 'Free tiers', sub: 'Groq · Gemini · NVIDIA', x: 195, y: 470, w: 280, at: 58},
          {id: 'local', label: 'Your laptop', sub: 'Ollama, private', x: 460, y: 560, w: 260, at: 76, tone: 'green'},
          {id: 'gpu', label: 'Kaggle GPU', sub: '2 × T4, free', x: 725, y: 470, w: 262, at: 94},
        ]}
        arrows={[
          {from: 'chat', to: 'router', at: 22},
          {from: 'router', to: 'free', at: 50},
          {from: 'router', to: 'local', at: 68},
          {from: 'router', to: 'gpu', at: 86},
        ]}
      />
    </div>
  </DesignFrame>
);

/* --------------------------------------------------------------- install */
const INSTALL: Line[] = [
  {at: 4, kind: 'cmd', text: '.\\setup-ai.ps1 -Install'},
  {at: 36, kind: 'bar', text: 'installing  ', frames: 62},
  {at: 100, kind: 'ok', text: 'Ollama'},
  {at: 110, kind: 'ok', text: 'Node.js  ·  Python 3.11'},
  {at: 120, kind: 'ok', text: 'OmniRoute'},
  {at: 130, kind: 'ok', text: 'Open WebUI'},
  {at: 146, kind: 'cmd', text: '.\\setup-ai.ps1 -Configure'},
  {at: 186, kind: 'ok', text: 'All done. Refresh Open WebUI.'},
];

const Install: React.FC = () => (
  <>
    <DesignFrame>
      <CutFlash />
      <div style={{position: 'absolute', left: 100, top: 130}}>
        <Step n={1} of={4} label="INSTALL" />
      </div>
    </DesignFrame>
    <Centre bottom={150}>
      <Rise delay={2} y={40}>
        <Terminal lines={INSTALL} width={880} />
      </Rise>
    </Centre>
  </>
);

/* ------------------------------------------------------------------ keys */
const Keys: React.FC = () => (
  <>
    <DesignFrame>
      <CutFlash />
      <div style={{position: 'absolute', left: 100, top: 130}}>
        <Step n={2} of={4} label="FREE PROVIDERS" />
      </div>
      <div style={{position: 'absolute', left: 100, top: 232, display: 'flex', gap: 10}}>
        {['FREE', 'FREE TRIAL', 'FREE + PAID', 'CHECK'].map((t, i) => (
          <Pop key={t} delay={20 + i * 7}>
            <Tag>{t}</Tag>
          </Pop>
        ))}
      </div>
    </DesignFrame>
    <Centre bottom={130}>
      <ShotIn delay={46}>
        <Shot id="providerMenu" width={880} showLabel={false} />
      </ShotIn>
    </Centre>
  </>
);

/* ----------------------------------------------------------------- local */
const LOCAL: Line[] = [
  {at: 50, kind: 'cmd', text: 'ollama run llama3.2:3b'},
  {at: 92, kind: 'out', text: 'thinking...'},
  {at: 112, kind: 'ok', text: 'answered on your own machine'},
];

const Local: React.FC = () => (
  <>
    <DesignFrame>
      <CutFlash />
      <div style={{position: 'absolute', left: 100, top: 130}}>
        <Step n={3} of={4} label="A MODEL ON YOUR MACHINE" />
      </div>
      <Node
        p={{x: 0, y: -120, z: 150}}
        label="your laptop"
        sub="llama3.2:3b"
        tone="open"
        state="PRIVATE"
      />
    </DesignFrame>
    <Centre bottom={140}>
      <Rise delay={40} y={40}>
        <Terminal lines={LOCAL} width={760} title="PowerShell · local" />
      </Rise>
    </Centre>
  </>
);

/* ------------------------------------------------------------------- gpu */
const Gpu: React.FC = () => {
  const n = useCount(2, 14, 20);
  return (
    <>
      <DesignFrame>
        <CutFlash />
        <div style={{position: 'absolute', left: 100, top: 120}}>
          <Step n={4} of={4} label="BORROW A GPU" />
        </div>
        <div style={{position: 'absolute', left: 100, top: 212}}>
          <div style={{display: 'flex', alignItems: 'baseline', gap: 20}}>
            <div
              style={{
                fontFamily: GROTESK,
                fontWeight: 700,
                fontSize: 120,
                color: INK,
                letterSpacing: -4,
              }}
            >
              {n}×
            </div>
            <Rise delay={30}>
              <div style={{fontFamily: GROTESK, fontWeight: 700, fontSize: 60, color: GREEN}}>
                TESLA T4
              </div>
            </Rise>
          </div>
          <Rise delay={40}>
            <Measure width={560} label="FREE · HOURS PER WEEK · FIXED ADDRESS" />
          </Rise>
        </div>
      </DesignFrame>
      <Centre bottom={125}>
        <ShotStack
          items={[
            {id: 'gpus', at: 58, width: 620, rot: -2.5, dx: -40, dy: -110},
            {id: 'kaggleFlow', at: 86, width: 820, rot: 1.6, dx: 20, dy: 70},
          ]}
        />
      </Centre>
    </>
  );
};

/* ----------------------------------------------------------------- order */
const Order: React.FC = () => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [52, 122], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const a = project(ROUTER);
  const b = project(NODES[1].p);
  const out = frame > 40;
  const answered = frame > 124;

  return (
    <>
      <DesignFrame>
        <CutFlash />
        <Links from={ROUTER} to={NODES.map((n) => n.p)} highlight={1} dim />
        {NODES.map((nd, i) => (
          <div key={nd.label} style={{opacity: useIn(4 + i * 4)}}>
            <Node
              p={nd.p}
              label={nd.label}
              sub={nd.sub}
              tone={i === 0 && out ? 'closed' : i === 1 && answered ? 'open' : 'ink'}
              state={i === 0 && out ? 'OUT OF QUOTA' : i === 1 && answered ? 'ANSWERED' : undefined}
            />
          </div>
        ))}
        <Node p={ROUTER} label="OmniRoute" tone="router" />
        <div
          style={{
            position: 'absolute',
            left: a.x + (b.x - a.x) * t,
            top: a.y + (b.y - a.y) * t,
            width: 16,
            height: 16,
            marginLeft: -8,
            marginTop: -8,
            borderRadius: 999,
            background: '#fff',
            boxShadow: `0 0 30px 8px ${VIOLET}`,
            opacity: frame > 48 ? 1 : 0,
          }}
        />
      </DesignFrame>
      <Centre bottom={120}>
        <ShotIn delay={150}>
          <Shot id="combos" width={900} showLabel={false} />
        </ShotIn>
      </Centre>
    </>
  );
};

/* ----------------------------------------------------------------- proof */
const Proof: React.FC = () => {
  const p = useCount(6, 8, 18);
  const m = useCount(15, 20, 22);
  return (
    <>
      <DesignFrame>
        <CutFlash />
        <div style={{position: 'absolute', left: 0, right: 0, top: 120, textAlign: 'center'}}>
          <div style={{display: 'flex', justifyContent: 'center', gap: 70}}>
            {[
              {n: p, u: 'providers'},
              {n: m, u: 'models'},
              {n: 1, u: 'chat page'},
            ].map((s) => (
              <div key={s.u}>
                <div
                  style={{
                    fontFamily: GROTESK,
                    fontWeight: 700,
                    fontSize: 96,
                    color: INK,
                    letterSpacing: -3,
                  }}
                >
                  {s.n}
                </div>
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: 22,
                    letterSpacing: 3,
                    color: 'rgba(236,234,255,.55)',
                    textTransform: 'uppercase',
                  }}
                >
                  {s.u}
                </div>
              </div>
            ))}
          </div>
        </div>
      </DesignFrame>
      <Centre bottom={120}>
        <ShotStack
          items={[
            {id: 'sync', at: 34, width: 700, rot: -3, dx: -60, dy: -60},
            {id: 'models', at: 58, width: 760, rot: 2.2, dx: 40, dy: 40},
          ]}
        />
      </Centre>
    </>
  );
};

/* ------------------------------------------------------------------- cta */
const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const blink = Math.floor(frame / 10) % 2 === 0;
  return (
    <DesignFrame>
      <CutFlash />
      <div style={{position: 'absolute', left: 0, right: 0, top: 230, textAlign: 'center'}}>
        <Rise delay={2} y={30}>
          <Outline size={92}>WANT THE</Outline>
        </Rise>
        <Rise delay={10} y={30}>
          <div style={{marginTop: 8}}>
            <Fill size={92}>SCRIPTS?</Fill>
          </div>
        </Rise>
        <div style={{marginTop: 44}}>
          <Wipe delay={26}>
            <Marked size={56}>TELL ME IN THE COMMENTS</Marked>
          </Wipe>
        </div>
        <Rise delay={46}>
          <div
            style={{
              marginTop: 46,
              display: 'inline-block',
              padding: '16px 26px',
              borderRadius: '18px 18px 18px 5px',
              border: `1.6px solid ${VIOLET}`,
              background: 'rgba(10,8,22,.85)',
              fontFamily: MONO,
              fontSize: 30,
              color: INK,
            }}
          >
            send me the setup{blink ? <span style={{color: VIOLET}}>▌</span> : <span>&nbsp;</span>}
          </div>
        </Rise>
      </div>
    </DesignFrame>
  );
};

export const SCENES_BY_ID: Record<SceneId, React.FC> = {
  hook: Hook,
  flow: FlowScene,
  install: Install,
  keys: Keys,
  local: Local,
  gpu: Gpu,
  order: Order,
  proof: Proof,
  cta: Cta,
};
