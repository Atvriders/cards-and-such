import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Hachi-Hachi (88) — Hanafuda capture: each round you choose 1 of 2 hand cards
// to play against 2 field cards; you take the best field card. CPU plays remaining.
// Hikari = 20pts, tane = 10pts, tan = 5pts, kasu = 1pt. 8 rounds.

export const TOTAL_ROUNDS = 8;

export type CardCategory = "hikari" | "tane" | "tan" | "kasu";
export interface HHCard { id: number; month: number; category: CardCategory; }

const MONTH_CATS: CardCategory[][] = [
  ["hikari","tan","kasu","kasu"],
  ["tane","tan","kasu","kasu"],
  ["hikari","tan","kasu","kasu"],
  ["tane","tan","kasu","kasu"],
  ["tane","tan","kasu","kasu"],
  ["tane","tan","kasu","kasu"],
  ["tane","tan","kasu","kasu"],
  ["hikari","tane","kasu","kasu"],
  ["tane","tan","kasu","kasu"],
  ["tane","tan","kasu","kasu"],
  ["hikari","tane","tan","kasu"],
  ["hikari","tane","kasu","kasu"],
];

export const DECK: HHCard[] = (() => {
  const out: HHCard[] = [];
  let id = 0;
  for (let m = 0; m < 12; m++) {
    for (let i = 0; i < 4; i++) out.push({ id: id++, month: m + 1, category: MONTH_CATS[m]![i]! });
  }
  return out;
})();

export function cardOf(id: number): HHCard { return DECK[id]!; }
export function cardName(id: number): string { const c = cardOf(id); return `M${c.month} ${c.category}`; }
export function pointsOf(cat: CardCategory): number {
  return cat === "hikari" ? 20 : cat === "tane" ? 10 : cat === "tan" ? 5 : 1;
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j]!, a[i]!]; }
  return a;
}

export interface HachiHachiSettings { dummy: boolean; }
export type Phase = "choose" | "result" | "done";

export interface HachiHachiState {
  rngSeed: number;
  round: number;
  hand: number[];
  cpuHand: number[];
  field: number[];
  log: string;
  score: number;
  cpuScore: number;
  phase: Phase;
}
export type HachiHachiAction = { type: "play"; cardId: number } | { type: "next" };

function dealRound(seed: number, round: number, score: number, cpuScore: number): HachiHachiState {
  const rng = mulberry32(seed);
  const ids = shuffle(DECK.map(c => c.id), rng);
  return {
    rngSeed: Math.floor(rng() * 2 ** 31),
    round,
    hand: ids.slice(0, 2),
    cpuHand: ids.slice(2, 4),
    field: ids.slice(4, 6),
    log: `Round ${round}: pick a card to play.`,
    score, cpuScore, phase: "choose",
  };
}

export function initialState(seed: number, _s: HachiHachiSettings): HachiHachiState {
  return dealRound(seed, 1, 0, 0);
}

export function reducer(state: HachiHachiState, action: HachiHachiAction): HachiHachiState {
  if (state.phase === "done") return state;
  if (action.type === "play" && state.phase === "choose") {
    if (!state.hand.includes(action.cardId)) return state;
    const yourCard = action.cardId;
    const fieldSorted = [...state.field].sort((a, b) => pointsOf(cardOf(b).category) - pointsOf(cardOf(a).category));
    const yourTarget = fieldSorted[0]!;
    const yourGain = pointsOf(cardOf(yourCard).category) + pointsOf(cardOf(yourTarget).category);
    const cpuCard = state.cpuHand[0]!;
    const cpuTarget = fieldSorted[1] ?? fieldSorted[0]!;
    const cpuGain = pointsOf(cardOf(cpuCard).category) + pointsOf(cardOf(cpuTarget).category);
    const score = state.score + yourGain;
    const cpuScore = state.cpuScore + cpuGain;
    const log = `You +${yourGain} | CPU +${cpuGain}`;
    return { ...state, score, cpuScore, log, phase: state.round >= TOTAL_ROUNDS ? "done" : "result" };
  }
  if (action.type === "next" && state.phase === "result") {
    return dealRound(state.rngSeed, state.round + 1, state.score, state.cpuScore);
  }
  return state;
}

export function isTerminal(s: HachiHachiState): { score: number } | null {
  return s.phase === "done" ? { score: s.score } : null;
}
