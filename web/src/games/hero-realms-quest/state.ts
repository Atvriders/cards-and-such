import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_TURNS = 10;
export const HAND_SIZE = 5;

export interface HeroRealmsQuestSettings { dummy: boolean; }

export interface HeroRealmsQuestCard {
  id: string;
  name: string;
  cost: number;
  coin: number;
  vp: number;
  kind: "treasure" | "victory" | "starter";
}

export const SHOP: readonly HeroRealmsQuestCard[] = [
  { id: "starter1", name: "Squire", cost: 0, coin: 1, vp: 0, kind: "starter" },
  { id: "treasure1", name: "Soldier", cost: 3, coin: 2, vp: 0, kind: "treasure" },
  { id: "treasure2", name: "Knight", cost: 6, coin: 3, vp: 0, kind: "treasure" },
  { id: "victory1", name: "Ranger", cost: 2, coin: 0, vp: 1, kind: "victory" },
  { id: "victory2", name: "Captain", cost: 5, coin: 0, vp: 3, kind: "victory" },
  { id: "victory3", name: "Hero", cost: 8, coin: 0, vp: 6, kind: "victory" },
];

const STARTING_DECK: string[] = [
  "starter1","starter1","starter1","starter1","starter1","starter1","starter1",
  "victory1","victory1","victory1",
];

export interface HeroRealmsQuestState {
  rngSeed: number;
  turn: number;
  deck: string[];
  discard: string[];
  hand: string[];
  played: string[];
  coin: number;
  bought: string | null;
  vpGained: number;
  vpTotal: number;
  phase: "play" | "buy" | "done";
}

export type HeroRealmsQuestAction =
  | { type: "playAll" }
  | { type: "buy"; cardId: string }
  | { type: "endTurn" };

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function cardById(id: string): HeroRealmsQuestCard {
  return SHOP.find(c => c.id === id)!;
}

function drawN(deck: string[], discard: string[], n: number, rng: () => number): { deck: string[]; discard: string[]; drawn: string[] } {
  const drawn: string[] = [];
  let d = [...deck];
  let dis = [...discard];
  for (let i = 0; i < n; i++) {
    if (d.length === 0) { d = shuffle(dis, rng); dis = []; }
    if (d.length === 0) break;
    drawn.push(d.shift()!);
  }
  return { deck: d, discard: dis, drawn };
}

export function initialState(seed: number, _s: HeroRealmsQuestSettings): HeroRealmsQuestState {
  const rng = mulberry32(seed);
  const startDeck = shuffle(STARTING_DECK, rng);
  const { deck, discard, drawn } = drawN(startDeck, [], HAND_SIZE, rng);
  return {
    rngSeed: Math.floor(rng() * 2 ** 31),
    turn: 1,
    deck, discard,
    hand: drawn, played: [],
    coin: 0, bought: null,
    vpGained: 0, vpTotal: 0,
    phase: "play",
  };
}

export function reducer(state: HeroRealmsQuestState, action: HeroRealmsQuestAction): HeroRealmsQuestState {
  if (state.phase === "done") return state;
  if (action.type === "playAll") {
    if (state.phase !== "play") return state;
    const coin = state.hand.reduce((a, id) => a + cardById(id).coin, 0);
    return { ...state, coin, played: state.hand, hand: [], phase: "buy" };
  }
  if (action.type === "buy") {
    if (state.phase !== "buy") return state;
    const card = cardById(action.cardId);
    if (state.coin < card.cost) return state;
    if (state.bought) return state;
    return { ...state, bought: action.cardId, coin: state.coin - card.cost, vpGained: state.vpGained + card.vp };
  }
  if (action.type === "endTurn") {
    if (state.phase !== "buy") return state;
    const rng = mulberry32(state.rngSeed);
    let newDiscard = [...state.discard, ...state.played];
    if (state.bought) newDiscard.push(state.bought);
    const { deck, discard, drawn } = drawN(state.deck, newDiscard, HAND_SIZE, rng);
    const vpTotal = state.vpTotal + state.vpGained;
    const nextSeed = Math.floor(rng() * 2 ** 31);
    if (state.turn >= TOTAL_TURNS) {
      return { ...state, vpTotal, phase: "done", rngSeed: nextSeed };
    }
    return {
      ...state, rngSeed: nextSeed,
      turn: state.turn + 1,
      deck, discard, hand: drawn, played: [],
      coin: 0, bought: null, vpGained: 0, vpTotal,
      phase: "play",
    };
  }
  return state;
}

export function totalScore(state: HeroRealmsQuestState): number {
  if (state.phase === "done") {
    const all = [...state.deck, ...state.discard, ...state.hand, ...state.played];
    return all.reduce((a, id) => a + cardById(id).vp, 0);
  }
  return state.vpTotal;
}

export function isTerminal(state: HeroRealmsQuestState): { score: number } | null {
  return state.phase === "done" ? { score: totalScore(state) * 5 } : null;
}
