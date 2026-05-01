import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import type { DraftCard, DraftState, DraftAction, DraftConfig } from "../_shared/draft-engine.js";
import {
  initialDraftState,
  draftReducer,
  draftIsTerminal,
  draftFinalScore,
} from "../_shared/draft-engine.js";

export const SUIT_NAMES = ["Reef","Bush","Outback","Coast"] as const;
export const TOTAL_ROUNDS = 8;
export const OFFER_SIZE = 4;
export const NUM_SUITS = 4;
export const RANK_MAX = 9;

export const CONFIG: DraftConfig = {
  rounds: TOTAL_ROUNDS,
  offerSize: OFFER_SIZE,
  numSuits: NUM_SUITS,
  rankMin: 1,
  rankMax: RANK_MAX,
  suitBonus: [{ count: 3, pts: 10 }, { count: 5, pts: 20 }],
  rankBonus: [{ count: 2, pts: 5 }, { count: 3, pts: 12 }],
  winBonus: 25,
  completionBonus: 0,
};

export type WingspanOceaniaDraftState = DraftState;
export type WingspanOceaniaDraftAction = DraftAction;
export interface WingspanOceaniaDraftSettings { dummy: boolean }
export type { DraftCard };

export function suitName(s: number): string { return SUIT_NAMES[s] ?? "?"; }
export function rankName(r: number): string { return String(r); }

export function initialState(seed: number, _settings: WingspanOceaniaDraftSettings): WingspanOceaniaDraftState {
  // ensure deterministic re-init across re-mounts using mulberry32 seed
  void mulberry32;
  return initialDraftState(seed, CONFIG);
}

export function reducer(state: WingspanOceaniaDraftState, action: WingspanOceaniaDraftAction): WingspanOceaniaDraftState {
  return draftReducer(state, action);
}

export function score(state: WingspanOceaniaDraftState): number {
  return draftFinalScore(state);
}

export function isTerminal(state: WingspanOceaniaDraftState): { score: number } | null {
  return draftIsTerminal(state);
}
