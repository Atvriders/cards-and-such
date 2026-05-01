import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import type { DraftCard, DraftState, DraftAction, DraftConfig } from "../_shared/draft-engine.js";
import {
  initialDraftState,
  draftReducer,
  draftIsTerminal,
  draftFinalScore,
} from "../_shared/draft-engine.js";

export const SUIT_NAMES = ["One","Two","Three","Four","Five","Six"] as const;
export const TOTAL_ROUNDS = 8;
export const OFFER_SIZE = 4;
export const NUM_SUITS = 6;
export const RANK_MAX = 6;

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

export type BibliosDiceDraftState = DraftState;
export type BibliosDiceDraftAction = DraftAction;
export interface BibliosDiceDraftSettings { dummy: boolean }
export type { DraftCard };

export function suitName(s: number): string { return SUIT_NAMES[s] ?? "?"; }
export function rankName(r: number): string { return String(r); }

export function initialState(seed: number, _settings: BibliosDiceDraftSettings): BibliosDiceDraftState {
  // ensure deterministic re-init across re-mounts using mulberry32 seed
  void mulberry32;
  return initialDraftState(seed, CONFIG);
}

export function reducer(state: BibliosDiceDraftState, action: BibliosDiceDraftAction): BibliosDiceDraftState {
  return draftReducer(state, action);
}

export function score(state: BibliosDiceDraftState): number {
  return draftFinalScore(state);
}

export function isTerminal(state: BibliosDiceDraftState): { score: number } | null {
  return draftIsTerminal(state);
}
