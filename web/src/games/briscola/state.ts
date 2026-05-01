import type { Rank } from "../../engines/deck/index.js";
import { makeHuTrick } from "../_shared/heads-up-trick.js";
import { defaultRankOrder, pinochleRankOrder, tressetteRankOrder } from "../_shared/trick-engine.js";
import type { HuTrickState, HuTrickAction } from "../_shared/heads-up-trick.js";

export type BriscolaState = HuTrickState;
export type BriscolaAction = HuTrickAction;
export interface BriscolaSettings { dummy: boolean }

const RANKS: Rank[] = [1,2,3,4,5,6,7,11,12,13];
const engine = makeHuTrick({
  ranks: RANKS,
  copies: 1,
  perHand: 3,
  hasTrump: true,
  trumpFromStock: true,
  rankOrder: defaultRankOrder,
  cardPoints: (c) => { const v = c.rank as number; if(v===1)return 11; if(v===3)return 10; if(v===13)return 4; if(v===12)return 3; if(v===11)return 2; return 0; },
  pointsPerTrick: 0,
});

export const initialState = (seed: number, _s: BriscolaSettings): BriscolaState => engine.initialState(seed);
export const reducer = engine.reducer;
export const isTerminal = engine.isTerminal;
