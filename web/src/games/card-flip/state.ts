import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const PAIR_COUNT = 8;
export const CARD_COUNT = 16;
export interface CardFlipSettings { dummy: boolean; }
export interface CardFlipCard { id: number; value: number; revealed: boolean; matched: boolean; }
export interface CardFlipState {
  rngSeed: number;
  cards: CardFlipCard[];
  firstPick: number | null; // index of first revealed card this turn
  attempts: number;
  matches: number;
  score: number;
  phase: "playing" | "done";
}
export type CardFlipAction = { type: "flip"; index: number } | { type: "hide" };
function shuffleArr<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
function makeCards(seed: number): CardFlipCard[] {
  const rng = mulberry32(seed);
  const values: number[] = [];
  for (let i = 1; i <= PAIR_COUNT; i++) { values.push(i); values.push(i); }
  const shuffled = shuffleArr(values, rng);
  return shuffled.map((v, i) => ({ id: i, value: v, revealed: false, matched: false }));
}
export function initialState(seed: number, _s: CardFlipSettings): CardFlipState {
  return { rngSeed: seed, cards: makeCards(seed), firstPick: null, attempts: 0, matches: 0, score: 0, phase: "playing" };
}
export function reducer(state: CardFlipState, action: CardFlipAction): CardFlipState {
  if (state.phase === "done") return state;
  if (action.type === "hide") {
    const cards = state.cards.map(c => c.matched ? c : { ...c, revealed: false });
    return { ...state, cards, firstPick: null };
  }
  if (action.type === "flip") {
    const i = action.index;
    const c = state.cards[i]; if (!c || c.revealed || c.matched) return state;
    const cards = state.cards.map((cc, k) => k === i ? { ...cc, revealed: true } : cc);
    if (state.firstPick === null) {
      return { ...state, cards, firstPick: i };
    }
    // second pick
    const a = cards[state.firstPick]!;
    const b = cards[i]!;
    const attempts = state.attempts + 1;
    if (a.value === b.value) {
      const updated = cards.map(cc => (cc.id === a.id || cc.id === b.id) ? { ...cc, matched: true, revealed: true } : cc);
      const matches = state.matches + 1;
      const score = state.score + 20;
      const phase = matches >= PAIR_COUNT ? "done" : "playing";
      return { ...state, cards: updated, firstPick: null, attempts, matches, score, phase };
    } else {
      // remain revealed; user must call hide to flip back
      return { ...state, cards, firstPick: null, attempts, score: Math.max(0, state.score - 2) };
    }
  }
  return state;
}
export function isTerminal(state: CardFlipState): { score: number } | null {
  if (state.phase !== "done") return null;
  const bonus = Math.max(0, 200 - state.attempts * 5);
  return { score: state.score + bonus };
}
