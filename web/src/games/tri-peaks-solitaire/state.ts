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
    // 18 cards in three peaks; flatten into one column per index 0..17.
    for (let i = 0; i < 18; i++) cols.push([deck[i]!]);
    // 10 cards in the bottom row (idx 18..27)
    for (let i = 0; i < 10; i++) cols.push([deck[18 + i]!]);
    return { columns: cols, deckUsed: 28 };
  },
};

export type TriPeaksSolitaireState = GolfFamilyState;
export type TriPeaksSolitaireAction = GolfFamilyAction;
export interface TriPeaksSolitaireSettings { _dummy?: undefined }

export function initialState(seed: number, _s: TriPeaksSolitaireSettings): TriPeaksSolitaireState {
  void _s;
  return makeGolfFamilyState(seed, cfg);
}

export function reducer(s: TriPeaksSolitaireState, a: TriPeaksSolitaireAction): TriPeaksSolitaireState {
  return reduceGolfFamily(s, a, cfg);
}

export function isTerminal(s: TriPeaksSolitaireState): { score: number } | null {
  return isGolfFamilyTerminal(s);
}
