/**
 * The real screenshots, with the crop that makes each one readable at phone
 * size. Cropping happens in CSS from these numbers, so the original PNGs stay
 * untouched and a crop can be re-tuned without re-exporting anything.
 *
 * `nw`/`nh` are the file's real pixel size; `crop` is the region we keep,
 * in those same pixels.
 */
export type Shot = {
  file: string;
  nw: number;
  nh: number;
  crop: {x: number; y: number; w: number; h: number};
  /** Small label shown under the shot, so a viewer knows what they're seeing. */
  label: string;
};

export const SHOTS = {
  /** OmniRoute's own provider graph: the router with every provider around it. */
  topology: {
    file: 'shots/1_omniroute.png',
    nw: 1879,
    nh: 865,
    crop: {x: 395, y: 195, w: 940, h: 650},
    label: 'OmniRoute — provider topology',
  },
  /** my-free and my-coding, with the PRIORITY badge and the real model chain. */
  combos: {
    file: 'shots/3_omniroute.png',
    nw: 1915,
    nh: 876,
    crop: {x: 445, y: 575, w: 680, h: 115},
    label: 'The fallback order, as configured',
  },
  /** The provider menu: tier, limits and data use, in the tool's own words. */
  providerMenu: {
    file: 'shots/1_script.png',
    nw: 1702,
    nh: 871,
    crop: {x: 0, y: 62, w: 1120, h: 288},
    label: 'add-provider.ps1',
  },
  /** Proof the combos and models are live. */
  sync: {
    file: 'shots/3_script.png',
    nw: 1344,
    nh: 432,
    crop: {x: 0, y: 0, w: 1344, h: 432},
    label: 'ai-sync.ps1',
  },
  /** Open WebUI's model list, with the combos sitting among the providers. */
  models: {
    file: 'shots/3_openweb.png',
    nw: 1498,
    nh: 724,
    crop: {x: 62, y: 22, w: 1400, h: 660},
    label: 'Open WebUI — models',
  },
  /** The routing strategies, with Priority chosen. */
  strategy: {
    file: 'shots/4_omniroute.png',
    nw: 1774,
    nh: 819,
    crop: {x: 278, y: 380, w: 1270, h: 340},
    label: 'Routing strategy',
  },
} as const satisfies Record<string, Shot>;

export type ShotId = keyof typeof SHOTS;
