import { resolveBaccarat, makeRng } from "../_shared/baccarat-engine.js";
import { bjCardName, bjIsRed } from "../_shared/blackjack-engine.js";

export const TOTAL_ROUNDS = 12;
export interface MiniBaccaratCasSettings { dummy: boolean }
export interface MiniBaccaratCasState {
  rngSeed: number;
  round: number;
  bet: "player" | "banker" | "tie" | null;
  player: number[];
  banker: number[];
  pTotal: number;
  bTotal: number;
  outcome: "player" | "banker" | "tie" | null;
  phase: "bet" | "scored" | "done";
  score: number;
  pts: number;
  result: string;
}
export type MiniBaccaratCasAction = { type: "bet"; on: "player" | "banker" | "tie" } | { type: "next" };

export const cardName = bjCardName;
export const isRed = bjIsRed;

export function initialState(seed: number, _s: MiniBaccaratCasSettings): MiniBaccaratCasState {
  return {
    rngSeed: seed, round: 1, bet: null,
    player: [], banker: [], pTotal: 0, bTotal: 0, outcome: null,
    phase: "bet", score: 0, pts: 0, result: "",
  };
}

export function reducer(state: MiniBaccaratCasState, action: MiniBaccaratCasAction): MiniBaccaratCasState {
  if (state.phase === "done") return state;
  if (action.type === "bet" && state.phase === "bet") {
    const { rng, nextSeed } = makeRng(state.rngSeed);
    const used = new Set<number>();
    const r = resolveBaccarat(rng, used);
    let pts = 0; let result = "";
    if (action.on === r.outcome) {
      if (action.on === "player") { pts = 20; result = `Player wins ${r.pTotal}-${r.bTotal} (+${pts})`; }
      else if (action.on === "banker") { pts = 19; result = `Banker wins ${r.bTotal}-${r.pTotal} (+${pts})`; }
      else { pts = 80; result = `Tie at ${r.pTotal} (+${pts})`; }
    } else {
      // Tie returns bets on player/banker bets
      if (r.outcome === "tie" && (action.on === "player" || action.on === "banker")) {
        pts = 5; result = `Tie at ${r.pTotal} — push (+5)`;
      } else {
        pts = 0; result = `${r.outcome === "player" ? "Player" : r.outcome === "banker" ? "Banker" : "Tie"} won ${r.pTotal}-${r.bTotal}`;
      }
    }
    const isLast = state.round >= TOTAL_ROUNDS;
    return {
      ...state, rngSeed: nextSeed, bet: action.on,
      player: r.player, banker: r.banker, pTotal: r.pTotal, bTotal: r.bTotal,
      outcome: r.outcome, phase: isLast ? "done" : "scored",
      score: state.score + pts, pts, result,
    };
  }
  if (action.type === "next" && state.phase === "scored") {
    return { ...state, round: state.round + 1, bet: null, player: [], banker: [], pTotal: 0, bTotal: 0, outcome: null, phase: "bet", pts: 0, result: "" };
  }
  return state;
}

export function isTerminal(state: MiniBaccaratCasState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
