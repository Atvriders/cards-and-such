import type { Rank } from "../../engines/deck/index.js";
import { makeHuTrick } from "../_shared/heads-up-trick.js";
import { defaultRankOrder, pinochleRankOrder, tressetteRankOrder } from "../_shared/trick-engine.js";
import type { HuTrickState, HuTrickAction } from "../_shared/heads-up-trick.js";

export type BidEuchreState = HuTrickState;
export type BidEuchreAction = HuTrickAction;
export interface BidEuchreSettings { dummy: boolean }

const RANKS: Rank[] = [9,10,11,12,13,1];
const engine = makeHuTrick({
  ranks: RANKS,
  copies: 1,
  perHand: 6,
  hasTrump: true,
  trumpFromStock: false,
  rankOrder: defaultRankOrder,
  cardPoints: undefined,
  pointsPerTrick: 1,
});

export const initialState = (seed: number, _s: BidEuchreSettings): BidEuchreState => engine.initialState(seed);
export const reducer = engine.reducer;
export const isTerminal = engine.isTerminal;
