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
    // Black Hole deals the 51 non-Ace cards into 17 fans of three; the lone
    // Ace anchors the centre (the "black hole") as the initial waste card.
    const ace = deck.findIndex((c) => c.rank === 1);
    const aceCard = deck[ace]!;
    const others = [...deck.slice(0, ace), ...deck.slice(ace + 1)];
    for (let i = 0; i < 17; i++) {
      cols.push(others.slice(i * 3, i * 3 + 3));
    }
    void aceCard;
    return { columns: cols, deckUsed: 52 };
  },
};

export type BlackHoleState = GolfFamilyState;
export type BlackHoleAction = GolfFamilyAction;
export interface BlackHoleSettings { _dummy?: undefined }

export function initialState(seed: number, _s: BlackHoleSettings): BlackHoleState {
  void _s;
  return makeGolfFamilyState(seed, cfg);
}

export function reducer(s: BlackHoleState, a: BlackHoleAction): BlackHoleState {
  return reduceGolfFamily(s, a, cfg);
}

export function isTerminal(s: BlackHoleState): { score: number } | null {
  return isGolfFamilyTerminal(s);
}
