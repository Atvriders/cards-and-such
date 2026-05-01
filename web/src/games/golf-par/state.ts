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
  hasRedeals: 0
},
  layout: (deck) => {
    const cols: Card[][] = [];
    for (let i = 0; i < 7; i++) {
      cols.push(deck.slice(i * 5, i * 5 + 5));
    }
    return { columns: cols, deckUsed: 35 };
  },
};

export type GolfParState = GolfFamilyState;
export type GolfParAction = GolfFamilyAction;
export interface GolfParSettings { _dummy?: undefined }

export function initialState(seed: number, _s: GolfParSettings): GolfParState {
  void _s;
  return makeGolfFamilyState(seed, cfg);
}

export function reducer(s: GolfParState, a: GolfParAction): GolfParState {
  return reduceGolfFamily(s, a, cfg);
}

export function isTerminal(s: GolfParState): { score: number } | null {
  return isGolfFamilyTerminal(s);
}
