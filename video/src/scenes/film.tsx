import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Shot} from '../components/Shot';
import {
  DesignFrame,
  GREEN,
  GROTESK,
  INK,
  Links,
  MONO,
  Node,
  P3,
  project,
} from '../design/world';
import {Fill, Framed, Marked, Measure, Outline, Tag, Underlined} from '../design/type';
import {SceneId} from '../config';

/**
 * The ten scenes. The world (atmosphere, floor, camera drift, caption, HUD)
 * is drawn once by Video.tsx; a scene only draws its own content.
 *
 * Everything here is authored inside <DesignFrame>, i.e. in a 1080 square,
 * so no measurement needs a scale factor.
 */

/** Shared positions, so the constellation stays put between scenes. */
const ROUTER: P3 = {x: 0, y: 30, z: 60};
const NODES: {p: P3; label: string; sub: string}[] = [
  {p: {x: -300, y: -200, z: 420}, label: 'Groq', sub: 'free tier'},
  {p: {x: 300, y: -240, z: 500}, label: 'Gemini', sub: 'free tier'},
  {p: {x: -430, y: 80, z: 760}, label: 'NVIDIA', sub: 'free trial'},
  {p: {x: 430, y: 55, z: 820}, label: 'OpenRouter', sub: 'free + paid'},
  {p: {x: -250, y: 320, z: 1150}, label: 'Kaggle', sub: 'borrowed GPU'},
  {p: {x: 270, y: 340, z: 1250}, label: 'your laptop', sub: 'private, last'},
];

/** Headline block, top-left, inside corner ticks. */
const Head: React.FC<{
  tag: string;
  lines: React.ReactNode;
  tags?: string[];
  rule?: string;
  top?: number;
}> = ({tag, lines, tags, rule, top = 150}) => (
  <div style={{position: 'absolute', left: 104, top}}>
    <Framed label={tag} pad={28}>
      <div style={{lineHeight: 0.98}}>{lines}</div>
      {tags ? (
        <div style={{marginTop: 24, display: 'flex', gap: 10}}>
          {tags.map((t) => (
            <Tag key={t}>{t}</Tag>
          ))}
        </div>
      ) : null}
      {rule ? <Measure width={620} label={rule} /> : null}
    </Framed>
  </div>
);

/** Screenshots stacked above the caption. */
const Plate: React.FC<{children: React.ReactNode; bottom?: number}> = ({
  children,
  bottom = 220,
}) => (
  <AbsoluteFill style={{alignItems: 'center', justifyContent: 'flex-end'}}>
    <div
      style={{
        paddingBottom: bottom,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        alignItems: 'center',
      }}
    >
      {children}
    </div>
  </AbsoluteFill>
);

/* ---------------------------------------------------------------- 1. hook */
const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const rise = interpolate(frame, [0, 20], [22, 0], {extrapolateRight: 'clamp'});
  return (
    <DesignFrame>
      <div style={{transform: `translateY(${rise}px)`}}>
        <Head
          tag="01 / WHERE A MODEL RUNS"
          top={300}
          lines={
            <>
              <div>
                <Outline size={100}>WHERE DOES</Outline>
              </div>
              <div>
                <Fill size={100}>YOUR AI</Fill>
              </div>
              <div style={{marginTop: 24}}>
                <Marked size={100}>ACTUALLY</Marked>{'\u2002'}<Fill size={100}>RUN?</Fill>
              </div>
            </>
          }
          rule="A LEARNING WALKTHROUGH"
        />
      </div>
    </DesignFrame>
  );
};

/* -------------------------------------------------------------- 2. places */
const Places: React.FC = () => {
  const frame = useCurrentFrame();
  const show = (i: number) =>
    interpolate(frame, [i * 16, i * 16 + 18], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
  return (
    <DesignFrame>
      <div style={{opacity: show(0)}}>
        <Node p={{x: -420, y: -340, z: 240}} label="free tiers" sub="someone else's server" />
      </div>
      <div style={{opacity: show(1)}}>
        <Node p={{x: 520, y: -330, z: 520}} label="your laptop" sub="slow, unlimited" />
      </div>
      <div style={{opacity: show(2)}}>
        <Node p={{x: -300, y: 420, z: 760}} label="a borrowed GPU" sub="hours per week" />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 430, textAlign: 'center'}}>
        <Outline size={118}>THREE</Outline>{'\u2002'}<Fill size={118}>PLACES</Fill>
      </div>
    </DesignFrame>
  );
};

/* --------------------------------------------------------------- 3. tiers */
const Tiers: React.FC = () => (
  <>
    <DesignFrame>
      <Head
        tag="02 / SOMEONE ELSE'S SERVER"
        lines={
          <>
            <div>
              <Fill size={86}>FAST, FREE,</Fill>
            </div>
            <div style={{marginTop: 22}}>
              <Marked size={86}>CAPPED</Marked>
            </div>
          </>
        }
        tags={['FREE', 'FREE TRIAL', 'FREE + PAID']}
        rule="EVERY TIER HAS A LIMIT AND A DATA POLICY"
      />
    </DesignFrame>
    <Plate>
      <Shot id="providerMenu" width={880} showLabel={false} />
    </Plate>
  </>
);

/* -------------------------------------------------------------- 4. laptop */
const Laptop: React.FC = () => (
  <DesignFrame>
    <Links from={ROUTER} to={[NODES[5].p]} dim />
    <Node p={{x: 0, y: -40, z: 120}} label="your laptop" sub="llama3.2:3b, on your own machine" />
    <div style={{position: 'absolute', left: 0, right: 0, top: 560, textAlign: 'center'}}>
      <Outline size={82}>NO LIMIT.</Outline>{'\u2002'}<Fill size={82}>NO SPEED.</Fill>
      <div style={{marginTop: 26, display: 'flex', gap: 10, justifyContent: 'center'}}>
        <Tag>UNLIMITED</Tag>
        <Tag>PRIVATE</Tag>
        <Tag>CPU-SLOW</Tag>
      </div>
    </div>
  </DesignFrame>
);

/* -------------------------------------------------------------- 5. kaggle */
const Kaggle: React.FC = () => (
  <>
    <DesignFrame>
      <Head
        tag="03 / A BORROWED GPU"
        lines={
          <>
            <div>
              <Outline size={86}>KAGGLE LENDS</Outline>
            </div>
            <div style={{marginTop: 26}}>
              <Marked size={86}>TWO GPUs</Marked>{'\u2002'}<Fill size={86}>FREE</Fill>
            </div>
          </>
        }
        tags={['2 × TESLA T4', '27B MODEL', 'HOURS / WEEK']}
        rule="SESSION: RUN ALL · FIXED ADDRESS"
      />
    </DesignFrame>
    <Plate bottom={232}>
      <Shot id="gpus" width={620} showLabel={false} />
      <Shot id="kaggleFlow" width={820} showLabel={false} />
    </Plate>
  </>
);

/* -------------------------------------------------------------- 6. router */
const Router: React.FC = () => {
  const frame = useCurrentFrame();
  const show = (i: number) =>
    interpolate(frame, [30 + i * 10, 48 + i * 10], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
  return (
    <DesignFrame>
      <Links from={ROUTER} to={NODES.map((n) => n.p)} />
      {NODES.map((n, i) => (
        <div key={n.label} style={{opacity: show(i)}}>
          <Node p={n.p} label={n.label} sub={n.sub} />
        </div>
      ))}
      <Node p={ROUTER} label="one router" sub="every provider behind it" tone="router" />
    </DesignFrame>
  );
};

/* --------------------------------------------------------------- 7. order */
const Order: React.FC = () => {
  const frame = useCurrentFrame();
  // The request leaves the router and reaches the second provider.
  const t = interpolate(frame, [40, 110], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const a = project(ROUTER);
  const b = project(NODES[1].p);
  const out = frame > 30;
  const answered = frame > 112;

  return (
    <>
      <DesignFrame>
        <Links from={ROUTER} to={NODES.map((n) => n.p)} highlight={1} dim />
        {NODES.map((n, i) => (
          <Node
            key={n.label}
            p={n.p}
            label={n.label}
            sub={n.sub}
            tone={i === 0 && out ? 'closed' : i === 1 && answered ? 'open' : 'ink'}
            state={
              i === 0 && out ? 'OUT OF QUOTA' : i === 1 && answered ? 'ANSWERED' : undefined
            }
          />
        ))}
        <Node p={ROUTER} label="one router" tone="router" />
        <div
          style={{
            position: 'absolute',
            left: a.x + (b.x - a.x) * t,
            top: a.y + (b.y - a.y) * t,
            width: 15,
            height: 15,
            marginLeft: -7.5,
            marginTop: -7.5,
            borderRadius: 999,
            background: '#fff',
            boxShadow: '0 0 26px 7px #8b5cff',
            opacity: frame > 36 ? 1 : 0,
          }}
        />
      </DesignFrame>
      <Plate bottom={210}>
        <Shot id="combos" width={900} showLabel={false} />
      </Plate>
    </>
  );
};

/* ------------------------------------------------------------- 8. privacy */
const Privacy: React.FC = () => (
  <DesignFrame>
    {NODES.slice(0, 4).map((n) => (
      <div key={n.label} style={{opacity: 0.22}}>
        <Node p={n.p} label={n.label} sub={n.sub} />
      </div>
    ))}
    <Node
      p={{x: 0, y: 210, z: 150}}
      label="your laptop"
      sub="nothing leaves the machine"
      tone="open"
      state="PRIVATE"
    />
    <div style={{position: 'absolute', left: 0, right: 0, top: 170, textAlign: 'center'}}>
      <Outline size={78}>WORK QUESTIONS</Outline>
      <div style={{marginTop: 18}}>
        <Marked size={78}>STAY HOME</Marked>
      </div>
    </div>
  </DesignFrame>
);

/* -------------------------------------------------------------- 9. honest */
const Honest: React.FC = () => (
  <>
    <DesignFrame>
      <div style={{position: 'absolute', left: 104, top: 190, width: 880}}>
        <Framed label="WHAT THIS ACTUALLY IS" pad={30}>
          <div style={{fontFamily: MONO, fontSize: 38, lineHeight: 1.8, color: INK}}>
            <span style={{color: '#b79aff'}}>&gt; </span>
            <Underlined size={38}>Open WebUI</Underlined> for the chat page.
            <br />
            <Underlined size={38}>OmniRoute</Underlined> for the routing.
            <br />
            <Underlined size={38}>Ollama</Underlined> on the laptop.
            <br />
            <Marked size={38}>Scripts</Marked> just wire them together.
          </div>
          <Measure width={820} count={38} label="NOTHING HERE IS NEW" />
        </Framed>
      </div>
    </DesignFrame>
    <Plate bottom={200}>
      <Shot id="sync" width={760} showLabel={false} />
    </Plate>
  </>
);

/* ------------------------------------------------------------ 10. explore */
const Explore: React.FC = () => (
  <>
    <DesignFrame>
      <div style={{position: 'absolute', left: 0, right: 0, top: 170, textAlign: 'center'}}>
        <div>
          <Outline size={92}>TAKE IT</Outline>{'\u2002'}<Fill size={92}>APART</Fill>
        </div>
        <div style={{marginTop: 26, display: 'flex', gap: 10, justifyContent: 'center'}}>
          <Tag>GUIDE</Tag>
          <Tag>POWERSHELL SCRIPTS</Tag>
          <Tag tone={GREEN}>KAGGLE NOTEBOOK</Tag>
        </div>
        <div
          style={{
            marginTop: 40,
            fontFamily: MONO,
            fontSize: 34,
            letterSpacing: 1,
            color: '#b79aff',
          }}
        >
          github.com/Peermoh/free-ai-setup
        </div>
      </div>
    </DesignFrame>
    <Plate bottom={210}>
      <Shot id="models" width={820} showLabel={false} />
    </Plate>
  </>
);

export const SCENES_BY_ID: Record<SceneId, React.FC> = {
  hook: Hook,
  places: Places,
  tiers: Tiers,
  laptop: Laptop,
  kaggle: Kaggle,
  router: Router,
  order: Order,
  privacy: Privacy,
  honest: Honest,
  explore: Explore,
};
