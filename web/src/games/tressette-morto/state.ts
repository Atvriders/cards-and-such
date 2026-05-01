import type { Rank } from "../../engines/deck/index.js";
import { makeHuTrick } from "../_shared/heads-up-trick.js";
import { defaultRankOrder, pinochleRankOrder, tressetteRankOrder } from "../_shared/trick-engine.js";
import type { HuTrickState, HuTrickAction } from "../_shared/heads-up-trick.js";

export type TressetteMortoState = HuTrickState;
export type TressetteMortoAction = HuTrickAction;
export interface TressetteMortoSettings { dummy: boolean }

const RANKS: Rank[] = [1,2,3,4,5,6,7,11,12,13];
const engine = makeHuTrick({
  ranks: RANKS,
  copies: 1,
  perHand: 10,
  hasTrump: false,
  trumpFromStock: false,
  rankOrder: tressetteRankOrder,
  cardPoints: (c) => { const v = c.rank as number; if(v===1)return 1; if(v>=11||v===2||v===3)return 1/3; return 0; },
  pointsPerTrick: 0,
});

export const initialState = (seed: number, _s: TressetteMortoSettings): TressetteMortoState => engine.initialState(seed);
export const reducer = engine.reducer;
export const isTerminal = engine.isTerminal;
