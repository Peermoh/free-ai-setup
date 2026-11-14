import React from 'react';
import {C, FONT} from '../config';
import {useScale} from '../layout';

/**
 * A plain card with a text label. Provider names are TEXT only: the brief
 * forbids company logos, so there is deliberately no icon or image here.
 */
export const Card: React.FC<{
  label: string;
  /** Small line under the label, e.g. "your laptop". */
  sub?: string;
  /** Status chip: OPEN / CLOSED / a tier label. */
  status?: string;
  statusColour?: string;
  /** Border and glow colour when this card is the active one. */
  highlight?: string;
  /** Fade the card back when the focus is elsewhere. */
  dim?: boolean;
  width?: number;
  style?: React.CSSProperties;
}> = ({label, sub, status, statusColour, highlight, dim, width = 300, style}) => {
  const s = useScale();

  return (
    <div
      style={{
        boxSizing: 'border-box',
        width: width * s,
        padding: `${22 * s}px ${20 * s}px`,
        borderRadius: 20 * s,
        background: C.card,
        border: `${highlight ? 3 : 1.5}px solid ${highlight ?? C.cardEdge}`,
        boxShadow: highlight ? `0 0 ${34 * s}px ${highlight}55` : 'none',
        opacity: dim ? 0.32 : 1,
        textAlign: 'center',
        fontFamily: FONT,
        ...style,
      }}
    >
      {/* Long names (OpenRouter) would spill out of a fixed-width card. */}
      <div
        style={{
          fontSize: (label.length > 8 ? 31 : 40) * s,
          fontWeight: 650,
          color: C.text,
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </div>
      {sub ? (
        <div style={{fontSize: 24 * s, color: C.muted, marginTop: 6 * s}}>{sub}</div>
      ) : null}
      {status ? (
        <div
          style={{
            marginTop: 12 * s,
            display: 'inline-block',
            padding: `${5 * s}px ${13 * s}px`,
            borderRadius: 999,
            fontSize: 23 * s,
            fontWeight: 700,
            letterSpacing: 0.5,
            color: statusColour ?? C.muted,
            border: `${1.5 * s}px solid ${statusColour ?? C.muted}`,
          }}
        >
          {status}
        </div>
      ) : null}
    </div>
  );
};
