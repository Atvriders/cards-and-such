import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_ROUNDS = 12;
export interface DoubleAttackBjSettings { dummy: boolean; }
export interface DoubleAttackBjState { rngSeed: number; round: number; you: number[]; dealer: number[]; phase: "play" | "scored" | "done"; score: number; pts: number; result: string; yourTotal: number; dealerTotal: number; }
export type DoubleAttackBjAction = { type: "hit" } | { type: "stand" } | { type: "next" };

export function cardName(c: number): string {
  const r = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"]; const s = ["♠","♥","♦","♣"];
  return r[c % 13]! + s[Math.floor(c / 13)]!;
}
export function isRed(c: number): boolean { const s = Math.floor(c / 13); return s === 1 || s === 2; }
function bjValue(c: number): number {
  const r = c % 13;
  if (r === 0) return 11;
  if (r >= 10) return 10;
  return r + 1;
}
function bjTotal(cards: number[]): number {
  let total = 0; let aces = 0;
  for (const c of cards) { total += bjValue(c); if (c % 13 === 0) aces++; }
  while (total > 21 && aces > 0) { total -= 10; aces--; }
  return total;
}
function drawCard(rng: () => number, used: Set<number>): number {
  while (true) { const c = Math.floor(rng() * 52); if (!used.has(c)) { used.add(c); return c; } }
}
function deal(rng: () => number, used: Set<number>): { you: number[]; dealer: number[] } {
  return {
    you: [drawCard(rng, used), drawCard(rng, used)],
    dealer: [drawCard(rng, used), drawCard(rng, used)],
  };
}
function dealerPlay(dealer: number[], rng: () => number, used: Set<number>): number[] {
  const d = [...dealer];
  while (bjTotal(d) < 17) d.push(drawCard(rng, used));
  return d;
}

export function initialState(seed: number, _s: DoubleAttackBjSettings): DoubleAttackBjState {
  const rng = mulberry32(seed); const used = new Set<number>();
  const { you, dealer } = deal(rng, used);
  const next = Math.floor(rng() * 2 ** 31);
  return { rngSeed: next, round: 1, you, dealer, phase: "play", score: 0, pts: 0, result: "", yourTotal: bjTotal(you), dealerTotal: bjTotal(dealer.slice(0, 1)) };
}
export function reducer(state: DoubleAttackBjState, action: DoubleAttackBjAction): DoubleAttackBjState {
  if (state.phase === "done") return state;
  if (action.type === "hit") {
    if (state.phase !== "play") return state;
    const rng = mulberry32(state.rngSeed); const used = new Set<number>([...state.you, ...state.dealer]);
    const c = drawCard(rng, used); const next = Math.floor(rng() * 2 ** 31);
    const you = [...state.you, c]; const yt = bjTotal(you);
    if (yt > 21) {
      const isLast = state.round >= TOTAL_ROUNDS;
      return { ...state, rngSeed: next, you, yourTotal: yt, dealerTotal: bjTotal(state.dealer), pts: 0, result: `Bust! (${yt})`, phase: isLast ? "done" : "scored" };
    }
    return { ...state, rngSeed: next, you, yourTotal: yt };
  }
  if (action.type === "stand") {
    if (state.phase !== "play") return state;
    const rng = mulberry32(state.rngSeed); const used = new Set<number>([...state.you, ...state.dealer]);
    const dealer = dealerPlay(state.dealer, rng, used);
    const next = Math.floor(rng() * 2 ** 31);
    const yt = bjTotal(state.you); const dt = bjTotal(dealer);
    let pts = 0; let result = "";
    if (dt > 21) { pts = 12; result = `Dealer busts (${dt})`; }
    else if (yt > dt) { pts = 12; result = `You win ${yt} vs ${dt}`; }
    else if (yt === dt) { pts = 5; result = `Push (${yt})`; }
    else { pts = 0; result = `Dealer wins ${dt} vs ${yt}`; }
    if (yt === 21 && state.you.length === 2) { pts = 18; result = "Blackjack!"; }
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: next, dealer, yourTotal: yt, dealerTotal: dt, pts, result, score: state.score + pts, phase: isLast ? "done" : "scored" };
  }
  if (action.type === "next") {
    if (state.phase !== "scored") return state;
    const rng = mulberry32(state.rngSeed); const used = new Set<number>();
    const { you, dealer } = deal(rng, used);
    const next = Math.floor(rng() * 2 ** 31);
    return { ...state, rngSeed: next, round: state.round + 1, you, dealer, phase: "play", pts: 0, result: "", yourTotal: bjTotal(you), dealerTotal: bjTotal(dealer.slice(0, 1)) };
  }
  return state;
}
export function isTerminal(state: DoubleAttackBjState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
