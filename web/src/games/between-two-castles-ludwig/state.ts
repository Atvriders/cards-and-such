import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import type { DraftCard, DraftState, DraftAction, DraftConfig } from "../_shared/draft-engine.js";
import {
  initialDraftState,
  draftReducer,
  draftIsTerminal,
  draftFinalScore,
} from "../_shared/draft-engine.js";

export const SUIT_NAMES = ["Throne","Garden","Bedroom","Kitchen","Hallway"] as const;
export const TOTAL_ROUNDS = 9;
export const OFFER_SIZE = 4;
export const NUM_SUITS = 5;
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

export type BetweenTwoCastlesLudwigState = DraftState;
export type BetweenTwoCastlesLudwigAction = DraftAction;
export interface BetweenTwoCastlesLudwigSettings { dummy: boolean }
export type { DraftCard };

export function suitName(s: number): string { return SUIT_NAMES[s] ?? "?"; }
export function rankName(r: number): string { return String(r); }

export function initialState(seed: number, _settings: BetweenTwoCastlesLudwigSettings): BetweenTwoCastlesLudwigState {
  // ensure deterministic re-init across re-mounts using mulberry32 seed
  void mulberry32;
  return initialDraftState(seed, CONFIG);
}

export function reducer(state: BetweenTwoCastlesLudwigState, action: BetweenTwoCastlesLudwigAction): BetweenTwoCastlesLudwigState {
  return draftReducer(state, action);
}

export function score(state: BetweenTwoCastlesLudwigState): number {
  return draftFinalScore(state);
}

export function isTerminal(state: BetweenTwoCastlesLudwigState): { score: number } | null {
  return draftIsTerminal(state);
}
