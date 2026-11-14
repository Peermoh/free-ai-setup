import React from 'react';
import {C} from '../config';
import {Terminal, TermLine} from '../components/Terminal';
import {Stage} from './Stage';

/**
 * Scene 6 (50-66 s): the scripts do the work.
 *
 * The provider menu rows below use the REAL tier labels printed by
 * scripts/add-provider.ps1 and the colours from its $costColour table, so a
 * viewer who runs the script sees exactly this. Do not simplify them to
 * FREE / PAID: OpenRouter is "FREE + PAID" and Mistral is "CHECK".
 */
const pad = (label: string) => `[${label}]`.padEnd(15, ' ');

const YELLOW = '#eab308';

const LINES: TermLine[] = [
  {at: 10, text: 'PS> .\\setup-ai.ps1 -Install'},
  {
    at: 80,
    instant: true,
    text: '    Ollama, Python, OmniRoute, WebUI  OK',
    colour: C.green,
  },
  {at: 120, text: 'PS> .\\setup-ai.ps1 -Configure'},
  {
    at: 190,
    instant: true,
    text: '    Providers added, combos tested  OK',
    colour: C.green,
  },
  {at: 230, text: 'PS> .\\add-provider.ps1'},
  {at: 290, instant: true, text: '  1. ' + pad('FREE') + 'Groq', colour: C.green},
  {at: 300, instant: true, text: '  2. ' + pad('FREE') + 'Google Gemini', colour: C.green},
  {at: 310, instant: true, text: '  3. ' + pad('FREE TRIAL') + 'NVIDIA NIM', colour: C.green},
  {at: 320, instant: true, text: '  4. ' + pad('FREE + PAID') + 'OpenRouter', colour: YELLOW},
  {at: 330, instant: true, text: '  5. ' + pad('CHECK') + 'Mistral', colour: YELLOW},
];

export const Scripts: React.FC = () => (
  <Stage>
    <Terminal lines={LINES} />
  </Stage>
);
