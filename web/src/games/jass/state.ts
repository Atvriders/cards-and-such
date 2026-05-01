import type { Rank } from "../../engines/deck/index.js";
import { makeHuTrick } from "../_shared/heads-up-trick.js";
import { defaultRankOrder, pinochleRankOrder, tressetteRankOrder } from "../_shared/trick-engine.js";
import type { HuTrickState, HuTrickAction } from "../_shared/heads-up-trick.js";

export type JassState = HuTrickState;
export type JassAction = HuTrickAction;
export interface JassSettings { dummy: boolean }

const RANKS: Rank[] = [9,10,11,12,13,1];
const engine = makeHuTrick({
  ranks: RANKS,
  copies: 1,
  perHand: 9,
  hasTrump: true,
  trumpFromStock: false,
  rankOrder: pinochleRankOrder,
  cardPoints: (c) => { const v = c.rank as number; if(v===1)return 11; if(v===10)return 10; if(v===13)return 4; if(v===12)return 3; if(v===11)return 2; return 0; },
  pointsPerTrick: 1,
});

export const initialState = (seed: number, _s: JassSettings): JassState => engine.initialState(seed);
export const reducer = engine.reducer;
export const isTerminal = engine.isTerminal;
