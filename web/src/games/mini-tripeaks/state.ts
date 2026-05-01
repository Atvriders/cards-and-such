import type { Card } from "../../engines/deck/index.js";
import {
  makeGolfFamilyState,
  reduceGolfFamily,
  isGolfFamilyTerminal,
  type GolfFamilyAction,
  type GolfFamilyConfig,
  type GolfFamilyState,
} from "../_shared/solitaire-family-engine.js";

export const cfg: GolfFamilyConfig = {
  ...{
  initialWasteCount: 1,
  wrap: true,
  hasRedeals: 0,
  triPeaks: true
},
  layout: (deck) => {
    const cols: Card[][] = [];
    for (let i = 0; i < 12; i++) cols.push([deck[i]!]);
    return { columns: cols, deckUsed: 12 };
  },
};

export type MiniTripeaksState = GolfFamilyState;
export type MiniTripeaksAction = GolfFamilyAction;
export interface MiniTripeaksSettings { _dummy?: undefined }

export function initialState(seed: number, _s: MiniTripeaksSettings): MiniTripeaksState {
  void _s;
  return makeGolfFamilyState(seed, cfg);
}

export function reducer(s: MiniTripeaksState, a: MiniTripeaksAction): MiniTripeaksState {
  return reduceGolfFamily(s, a, cfg);
}

export function isTerminal(s: MiniTripeaksState): { score: number } | null {
  return isGolfFamilyTerminal(s);
}
