import type { Rank } from "../../engines/deck/index.js";
import { makeHuTrick } from "../_shared/heads-up-trick.js";
import { defaultRankOrder, pinochleRankOrder, tressetteRankOrder } from "../_shared/trick-engine.js";
import type { HuTrickState, HuTrickAction } from "../_shared/heads-up-trick.js";

export type UltiHungarianState = HuTrickState;
export type UltiHungarianAction = HuTrickAction;
export interface UltiHungarianSettings { dummy: boolean }

const RANKS: Rank[] = [7,8,9,10,11,12,13,1];
const engine = makeHuTrick({
  ranks: RANKS,
  copies: 1,
  perHand: 10,
  hasTrump: true,
  trumpFromStock: true,
  rankOrder: defaultRankOrder,
  pointsPerTrick: 1,
});

export const initialState = (seed: number, _s: UltiHungarianSettings): UltiHungarianState => engine.initialState(seed);
export const reducer = engine.reducer;
export const isTerminal = engine.isTerminal;
