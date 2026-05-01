import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import type { DraftCard, DraftState, DraftAction, DraftConfig } from "../_shared/draft-engine.js";
import {
  initialDraftState,
  draftReducer,
  draftIsTerminal,
  draftFinalScore,
} from "../_shared/draft-engine.js";

export const SUIT_NAMES = ["Caravan","Port","Bazaar","Outpost"] as const;
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

export type SplendorTradeRoutesState = DraftState;
export type SplendorTradeRoutesAction = DraftAction;
export interface SplendorTradeRoutesSettings { dummy: boolean }
export type { DraftCard };

export function suitName(s: number): string { return SUIT_NAMES[s] ?? "?"; }
export function rankName(r: number): string { return String(r); }

export function initialState(seed: number, _settings: SplendorTradeRoutesSettings): SplendorTradeRoutesState {
  // ensure deterministic re-init across re-mounts using mulberry32 seed
  void mulberry32;
  return initialDraftState(seed, CONFIG);
}

export function reducer(state: SplendorTradeRoutesState, action: SplendorTradeRoutesAction): SplendorTradeRoutesState {
  return draftReducer(state, action);
}

export function score(state: SplendorTradeRoutesState): number {
  return draftFinalScore(state);
}

export function isTerminal(state: SplendorTradeRoutesState): { score: number } | null {
  return draftIsTerminal(state);
}
