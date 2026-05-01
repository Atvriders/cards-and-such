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
  hasRedeals: 1
},
  layout: (deck) => {
    const cols: Card[][] = [];
    for (let i = 0; i < 7; i++) {
      cols.push(deck.slice(i * 5, i * 5 + 5));
    }
    return { columns: cols, deckUsed: 35 };
  },
};

export type GolfParVariantState = GolfFamilyState;
export type GolfParVariantAction = GolfFamilyAction;
export interface GolfParVariantSettings { _dummy?: undefined }

export function initialState(seed: number, _s: GolfParVariantSettings): GolfParVariantState {
  void _s;
  return makeGolfFamilyState(seed, cfg);
}

export function reducer(s: GolfParVariantState, a: GolfParVariantAction): GolfParVariantState {
  return reduceGolfFamily(s, a, cfg);
}

export function isTerminal(s: GolfParVariantState): { score: number } | null {
  return isGolfFamilyTerminal(s);
}
