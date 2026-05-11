import type { Rank } from "../../engines/deck/index.js";
import { makeHuTrick } from "../_shared/heads-up-trick.js";
import { defaultRankOrder, pinochleRankOrder, tressetteRankOrder } from "../_shared/trick-engine.js";
import type { HuTrickState, HuTrickAction } from "../_shared/heads-up-trick.js";

export type HoneymoonBridgeState = HuTrickState;
export type HoneymoonBridgeAction = HuTrickAction;
export interface HoneymoonBridgeSettings { dummy: boolean }

const RANKS: Rank[] = [1,2,3,4,5,6,7,8,9,10,11,12,13];
const engine = makeHuTrick({
  ranks: RANKS,
  copies: 1,
  perHand: 13,
  hasTrump: true,
  trumpFromStock: true,
  rankOrder: defaultRankOrder,
  pointsPerTrick: 1,
});

export const initialState = (seed: number, _s: HoneymoonBridgeSettings): HoneymoonBridgeState => engine.initialState(seed);
export const reducer = engine.reducer;
export const isTerminal = engine.isTerminal;
