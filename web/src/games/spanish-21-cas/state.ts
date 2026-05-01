import {
  bjTotal, bjCardName, bjIsRed, drawCard, dealerPlay, settleHand, makeRng,
} from "../_shared/blackjack-engine.js";

export const TOTAL_ROUNDS = 12;
export interface Spanish21CasSettings { dummy: boolean }
export interface Spanish21CasState {
  rngSeed: number;
  round: number;
  you: number[];
  dealer: number[];
  phase: "play" | "scored" | "done";
  score: number;
  pts: number;
  result: string;
  yourTotal: number;
  dealerTotal: number;
  surrendered: boolean;
}
export type Spanish21CasAction = { type: "hit" } | { type: "stand" } | { type: "double" } | { type: "surrender" } | { type: "next" };

export const cardName = bjCardName;
export const isRed = bjIsRed;

function freshDeal(seed: number): { you: number[]; dealer: number[]; nextSeed: number } {
  const { rng, nextSeed } = makeRng(seed);
  const used = new Set<number>();
  const filterTen = true;
  const draw = () => {
    while (true) {
      const c = drawCard(rng, used);
      if (filterTen && (c % 13) === 9) { used.delete(c); continue; }
      return c;
    }
  };
  const you = [draw(), draw()];
  const dealer = [draw(), draw()];
  return { you, dealer, nextSeed };
}

export function initialState(seed: number, _s: Spanish21CasSettings): Spanish21CasState {
  const { you, dealer, nextSeed } = freshDeal(seed);
  return {
    rngSeed: nextSeed, round: 1, you, dealer, phase: "play",
    score: 0, pts: 0, result: "",
    yourTotal: bjTotal(you), dealerTotal: bjTotal(dealer.slice(0, 1)),
    surrendered: false,
  };
}

export function reducer(state: Spanish21CasState, action: Spanish21CasAction): Spanish21CasState {
  if (state.phase === "done") return state;

  if (action.type === "hit" && state.phase === "play") {
    const { rng, nextSeed } = makeRng(state.rngSeed);
    const used = new Set<number>([...state.you, ...state.dealer]);
    const c = drawCard(rng, used);
    const you = [...state.you, c];
    const yt = bjTotal(you);
    if (yt > 21) {
      const isLast = state.round >= TOTAL_ROUNDS;
      return { ...state, rngSeed: nextSeed, you, yourTotal: yt, dealerTotal: bjTotal(state.dealer), pts: 0, result: `Bust (${yt})`, phase: isLast ? "done" : "scored" };
    }
    return { ...state, rngSeed: nextSeed, you, yourTotal: yt };
  }

  if (action.type === "double" && state.phase === "play" && state.you.length === 2) {
    const { rng, nextSeed } = makeRng(state.rngSeed);
    const used = new Set<number>([...state.you, ...state.dealer]);
    const c = drawCard(rng, used);
    const you = [...state.you, c];
    const yt = bjTotal(you);
    let dealer = state.dealer;
    if (yt <= 21) dealer = dealerPlay(state.dealer, rng, used, true);
    const r = settleHand(you, dealer, { bjPays: 1.5 });
    const pts = r.pts * 2;
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: nextSeed, you, dealer, yourTotal: yt, dealerTotal: bjTotal(dealer), pts, result: "Doubled — " + r.result, score: state.score + pts, phase: isLast ? "done" : "scored" };
  }

  if (action.type === "surrender" && state.phase === "play" && state.you.length === 2 && true) {
    const pts = 5;
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, pts, result: "Surrendered — half back", score: state.score + pts, phase: isLast ? "done" : "scored", surrendered: true, dealerTotal: bjTotal(state.dealer) };
  }

  if (action.type === "stand" && state.phase === "play") {
    const { rng, nextSeed } = makeRng(state.rngSeed);
    const used = new Set<number>([...state.you, ...state.dealer]);
    const dealer = dealerPlay(state.dealer, rng, used, true);
    const r = settleHand(state.you, dealer, { bjPays: 1.5 });
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: nextSeed, dealer, yourTotal: bjTotal(state.you), dealerTotal: bjTotal(dealer), pts: r.pts, result: r.result, score: state.score + r.pts, phase: isLast ? "done" : "scored" };
  }

  if (action.type === "next" && state.phase === "scored") {
    const { you, dealer, nextSeed } = freshDeal(state.rngSeed);
    return { ...state, rngSeed: nextSeed, round: state.round + 1, you, dealer, phase: "play", pts: 0, result: "", yourTotal: bjTotal(you), dealerTotal: bjTotal(dealer.slice(0, 1)), surrendered: false };
  }
  return state;
}

export function isTerminal(state: Spanish21CasState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
