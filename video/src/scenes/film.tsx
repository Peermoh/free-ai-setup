import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Shot} from '../components/Shot';
import {Terminal, Line} from '../components/Terminal';
import {Flow} from '../components/Flow';
import {ShotStack} from '../components/ShotStack';
import {GREEN, GROTESK, INK, MONO, VIOLET} from '../design/world';
import {Fill, Marked, Measure, Outline, Tag} from '../design/type';
import {Beats, Pop, Rise, ShotIn, useCount, Wipe} from '../design/anim';
import {SceneId} from '../config';

/**
 * The ten explanations.
 *
 * There is no subtitle bar: the words on screen are the animation. Each scene
 * is a short sequence of phrases that punctuate the narration, timed so one
 * hands over to the next, with the visual arriving underneath.
 *
 * Authored in a 1080 square via <DesignFrame> in Video.tsx.
 */

const L = 96; // left margin for text blocks

const Lead: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div style={{fontFamily: MONO, fontSize: 20, letterSpacing: 5, color: '#c3a4ff'}}>
    {children}
  </div>
);

const Sub: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div style={{fontFamily: MONO, fontSize: 30, color: 'rgba(236,234,255,.72)', marginTop: 14}}>
    {children}
  </div>
);

const Centre: React.FC<{children: React.ReactNode; bottom?: number}> = ({
  children,
  bottom = 110,
}) => (
  <AbsoluteFill style={{alignItems: 'center', justifyContent: 'flex-end'}}>
    <div style={{paddingBottom: bottom}}>{children}</div>
  </AbsoluteFill>
);

/* ------------------------------------------------------------------ hook */
const Hook: React.FC = () => (
  <Beats
    items={[
      {
        at: 0,
        node: (
          <>
            <Lead>[ HOW TO BUILD IT ]</Lead>
            <div style={{marginTop: 16, lineHeight: 0.98}}>
              <Outline size={104}>BUILD YOUR</Outline>
              <div>
                <Fill size={104}>OWN AI</Fill>
              </div>
            </div>
          </>
        ),
        x: L,
        y: 270,
      },
      {
        at: 44,
        node: (
          <Marked size={54}>ON THE LAPTOP YOU ALREADY HAVE</Marked>
        ),
        x: L,
        y: 520,
      },
      {
        at: 96,
        node: (
          <div style={{display: 'flex', gap: 10}}>
            {['FREE TIERS', 'LOCAL MODEL', 'FREE GPU'].map((t, i) => (
              <Pop key={t} delay={96 + i * 7}>
                <Tag>{t}</Tag>
              </Pop>
            ))}
          </div>
        ),
        x: L,
        y: 620,
      },
    ]}
  />
);

/* ----------------------------------------------------------------- nogpu */
const NoGpu: React.FC = () => (
  <>
    <Beats
      items={[
        {
          at: 0,
          node: (
            <div style={{lineHeight: 0.98}}>
              <Outline size={112}>NO BIG</Outline>
              <div>
                <Fill size={112}>GPU?</Fill>
              </div>
            </div>
          ),
          x: L,
          y: 300,
        },
        {
          at: 46,
          node: <Sub>most laptops don&apos;t have one</Sub>,
          x: L,
          y: 540,
        },
      ]}
    />
    <Centre bottom={150}>
      <Rise delay={70} y={40}>
        <div style={{display: 'flex', gap: 12}}>
          {['8–16 GB RAM', 'NO DEDICATED GPU', 'WINDOWS LAPTOP'].map((t) => (
            <Tag key={t}>{t}</Tag>
          ))}
        </div>
      </Rise>
    </Centre>
  </>
);

/* ----------------------------------------------------------------- still */
const Still: React.FC = () => (
  <Beats
    items={[
      {
        at: 0,
        out: 74,
        node: (
          <div style={{lineHeight: 0.98}}>
            <Fill size={116}>IT STILL</Fill>
            <div>
              <Marked size={116}>WORKS</Marked>
            </div>
          </div>
        ),
        x: L,
        y: 330,
      },
      {
        at: 84,
        node: (
          <div style={{lineHeight: 0.98}}>
            <Outline size={96}>GOT A GPU?</Outline>
            <div style={{marginTop: 20}}>
              <Wipe delay={110}>
                <Marked size={96}>EVEN BETTER</Marked>
              </Wipe>
            </div>
            <Rise delay={128}>
              <Sub>run a much bigger open model, locally</Sub>
            </Rise>
          </div>
        ),
        x: L,
        y: 300,
      },
    ]}
  />
);

/* ----------------------------------------------------------------- three */
const Three: React.FC = () => {
  const items = [
    {n: '1', t: 'LOCAL MODEL', at: 28},
    {n: '2', t: 'FREE TIERS', at: 46},
    {n: '3', t: 'FREE GPU', at: 64},
  ];
  return (
    <>
      <Beats
        items={[
          {
            at: 0,
            node: (
              <div style={{lineHeight: 0.98}}>
                <Outline size={110}>THREE</Outline>{'\u2002'}
                <Fill size={110}>THINGS</Fill>
              </div>
            ),
            x: L,
            y: 250,
          },
        ]}
      />
      <div style={{position: 'absolute', left: L, top: 430}}>
        {items.map((it) => (
          <Rise key={it.n} delay={it.at} y={26}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 22,
                borderTop: '1.4px solid rgba(190,165,255,.3)',
                padding: '16px 0',
              }}
            >
              <div
                style={{
                  fontFamily: GROTESK,
                  fontWeight: 700,
                  fontSize: 64,
                  color: '#06040e',
                  background: VIOLET,
                  borderRadius: 12,
                  padding: '0 20px',
                }}
              >
                {it.n}
              </div>
              <div style={{fontFamily: GROTESK, fontWeight: 700, fontSize: 56, color: INK}}>
                {it.t}
              </div>
            </div>
          </Rise>
        ))}
      </div>
    </>
  );
};

/* ----------------------------------------------------------------- local */
const LOCAL_LINES: Line[] = [
  {at: 58, kind: 'cmd', text: 'ollama run llama3.2:3b'},
  {at: 104, kind: 'out', text: 'thinking...'},
  {at: 126, kind: 'ok', text: 'answered on your own machine'},
];

const Local: React.FC = () => (
  <>
    <Beats
      items={[
        {
          at: 0,
          node: (
            <>
              <Lead>[ 1 OF 3 ]</Lead>
              <div style={{marginTop: 14, lineHeight: 0.98}}>
                <Outline size={100}>A MODEL ON</Outline>
                <div>
                  <Fill size={100}>YOUR MACHINE</Fill>
                </div>
              </div>
            </>
          ),
          x: L,
          y: 190,
        },
        {at: 38, node: <Marked size={58}>OLLAMA</Marked>, x: L, y: 440},
      ]}
    />
    <Centre bottom={120}>
      <Rise delay={50} y={42}>
        <Terminal lines={LOCAL_LINES} width={800} title="PowerShell · local" />
      </Rise>
    </Centre>
  </>
);

/* ----------------------------------------------------------------- tiers */
const PROVIDERS = ['GROQ', 'GEMINI', 'NVIDIA', 'OPENROUTER'];

const Tiers: React.FC = () => (
  <>
    <Beats
      items={[
        {
          at: 0,
          node: (
            <>
              <Lead>[ 2 OF 3 ]</Lead>
              <div style={{marginTop: 14, lineHeight: 0.98}}>
                <Outline size={100}>FREE TIERS,</Outline>
                <div>
                  <Fill size={100}>FOUR OF THEM</Fill>
                </div>
              </div>
            </>
          ),
          x: L,
          y: 165,
        },
      ]}
    />
    <div style={{position: 'absolute', left: L, top: 415, display: 'flex', gap: 12}}>
      {PROVIDERS.map((p, i) => (
        <Pop key={p} delay={34 + i * 11}>
          <div
            style={{
              fontFamily: GROTESK,
              fontWeight: 700,
              fontSize: 34,
              color: INK,
              border: `1.8px solid ${VIOLET}`,
              borderRadius: 10,
              padding: '8px 16px',
              background: 'rgba(10,8,22,.7)',
            }}
          >
            {p}
          </div>
        </Pop>
      ))}
    </div>
    <Centre bottom={105}>
      <ShotIn delay={92}>
        <Shot id="providerMenu" width={880} showLabel={false} />
      </ShotIn>
    </Centre>
  </>
);

/* ------------------------------------------------------------------- gpu */
const Gpu: React.FC = () => {
  const n = useCount(2, 22, 18);
  return (
    <>
      <Beats
        items={[
          {
            at: 0,
            node: (
              <>
                <Lead>[ 3 OF 3 ]</Lead>
                <div style={{marginTop: 14, lineHeight: 0.98}}>
                  <Outline size={100}>A FREE GPU,</Outline>
                  <div>
                    <Fill size={100}>FROM KAGGLE</Fill>
                  </div>
                </div>
              </>
            ),
            x: L,
            y: 150,
          },
        ]}
      />
      <div style={{position: 'absolute', left: L, top: 400}}>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 18}}>
          <div
            style={{
              fontFamily: GROTESK,
              fontWeight: 700,
              fontSize: 104,
              color: GREEN,
              letterSpacing: -4,
            }}
          >
            {n}×
          </div>
          <Rise delay={40}>
            <div style={{fontFamily: GROTESK, fontWeight: 700, fontSize: 56, color: INK}}>
              TESLA T4
            </div>
          </Rise>
        </div>
        <Rise delay={52}>
          <div style={{marginTop: 10}}>
            <Measure width={540} label="FREE · HOURS PER WEEK · FIXED ADDRESS" />
          </div>
        </Rise>
      </div>
      <Centre bottom={95}>
        <ShotStack
          items={[
            {id: 'gpus', at: 64, width: 520, rot: -2.5, dx: -160, dy: -150},
            {id: 'kaggleFlow', at: 92, width: 800, rot: 1.4, dx: 10, dy: 60},
          ]}
        />
      </Centre>
    </>
  );
};

/* ----------------------------------------------------------------- route */
const Route: React.FC = () => (
  <>
    <Beats
      items={[
        {
          at: 0,
          node: (
            <>
              <Marked size={76}>OMNIROUTE</Marked>
              <Sub>an open-source router, in front of all three</Sub>
            </>
          ),
          x: L,
          y: 150,
        },
      ]}
    />
    <div style={{position: 'absolute', left: 80, top: 330}}>
      <Flow
        width={920}
        height={560}
        boxes={[
          {id: 'router', label: 'OmniRoute', sub: 'the router', x: 460, y: 60, at: 10, tone: 'router'},
          {id: 'free', label: 'Free tiers', sub: 'Groq · Gemini · NVIDIA', x: 190, y: 300, w: 280, at: 44},
          {id: 'local', label: 'Your laptop', sub: 'Ollama', x: 460, y: 400, w: 250, at: 62, tone: 'green'},
          {id: 'gpu', label: 'Kaggle GPU', sub: '2 × T4', x: 730, y: 300, w: 250, at: 80},
        ]}
        arrows={[
          {from: 'router', to: 'free', at: 36},
          {from: 'router', to: 'local', at: 54},
          {from: 'router', to: 'gpu', at: 72},
        ]}
      />
    </div>
  </>
);

/* ------------------------------------------------------------------ chat */
const Chat: React.FC = () => (
  <>
    <Beats
      items={[
        {
          at: 0,
          node: (
            <>
              <Marked size={76}>OPEN WEBUI</Marked>
              <Sub>one chat page for all of it</Sub>
            </>
          ),
          x: L,
          y: 150,
        },
      ]}
    />
    <Centre bottom={150}>
      <ShotIn delay={34}>
        <Shot id="topology" width={930} showLabel={false} />
      </ShotIn>
    </Centre>
  </>
);

/* ------------------------------------------------------------------- cta */
const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const blink = Math.floor(frame / 10) % 2 === 0;
  const typed = 'ai-local'.slice(0, Math.max(0, Math.floor((frame - 52) / 3)));
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div style={{textAlign: 'center', paddingBottom: 60}}>
        <Rise delay={0} y={32}>
          <Outline size={94}>WANT THE</Outline>
        </Rise>
        <Rise delay={9} y={32}>
          <div>
            <Fill size={94}>SCRIPTS?</Fill>
          </div>
        </Rise>
        <div style={{marginTop: 40}}>
          <Wipe delay={26}>
            <Marked size={50}>COMMENT BELOW</Marked>
          </Wipe>
        </div>
        <Rise delay={46}>
          <div
            style={{
              marginTop: 44,
              display: 'inline-block',
              padding: '18px 30px',
              borderRadius: '20px 20px 20px 6px',
              border: `1.8px solid ${VIOLET}`,
              background: 'rgba(10,8,22,.88)',
              fontFamily: MONO,
              fontSize: 44,
              fontWeight: 700,
              color: INK,
              letterSpacing: 1,
            }}
          >
            {typed}
            {blink ? <span style={{color: VIOLET}}>▌</span> : <span>&nbsp;</span>}
          </div>
        </Rise>
      </div>
    </AbsoluteFill>
  );
};

export const SCENES_BY_ID: Record<SceneId, React.FC> = {
  hook: Hook,
  nogpu: NoGpu,
  still: Still,
  three: Three,
  local: Local,
  tiers: Tiers,
  gpu: Gpu,
  route: Route,
  chat: Chat,
  cta: Cta,
};
