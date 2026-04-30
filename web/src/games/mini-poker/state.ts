import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { newDeck, shuffle, type Card } from "../../engines/deck/index.js";

export const STARTING_BANKROLL = 200;
export const ANTE = 5;

export interface MiniPokerSettings { dummy: boolean; }

export type Phase = "ante" | "draw" | "showdown" | "done";

export interface MiniPokerState {
  rngSeed: number;
  deck: Card[];
  player: Card[];
  cpu: Card[];
  selected: readonly string[];   // cards player has selected to discard
  bankroll: number;
  cpuBank: number;
  pot: number;
  phase: Phase;
  round: number;
  bet: number;
  log: string[];
  result: string;
  cpuRevealed: boolean;
}

export type MiniPokerAction =
  | { type: "deal" }
  | { type: "toggle"; cardId: string }
  | { type: "draw" }
  | { type: "raise"; amount: number }
  | { type: "fold" }
  | { type: "next" };

const RANK_NAMES = [
  "High Card",         // 0
  "Pair",              // 1
  "Two Pair",          // 2
  "Three of a Kind",   // 3
  "Straight",          // 4
  "Flush",             // 5
  "Full House",        // 6
  "Four of a Kind",    // 7
  "Straight Flush",    // 8
];

export function rankHand(hand: Card[]): { rank: number; name: string; tiebreak: number[] } {
  if (hand.length !== 5) return { rank: 0, name: "—", tiebreak: [] };
  // Use Ace high (rank 1 -> 14)
  const ranks = hand.map(c => c.rank === 1 ? 14 : c.rank).sort((a, b) => b - a);
  const suits = hand.map(c => c.suit);
  const counts = new Map<number, number>();
  for (const r of ranks) counts.set(r, (counts.get(r) ?? 0) + 1);
  const flush = suits.every(s => s === suits[0]);

  // straight detection
  const sortedAsc = [...ranks].sort((a, b) => a - b);
  let straight = true;
  for (let i = 1; i < 5; i++) if (sortedAsc[i] !== sortedAsc[i - 1]! + 1) { straight = false; break; }
  // ace-low straight A-2-3-4-5 (5,4,3,2,14 → treat ace as 1)
  if (!straight && sortedAsc[0] === 2 && sortedAsc[1] === 3 && sortedAsc[2] === 4 && sortedAsc[3] === 5 && sortedAsc[4] === 14) {
    straight = true;
    sortedAsc[4] = 5;
  }

  const groups = [...counts.entries()].sort((a, b) => b[1] - a[1] || b[0] - a[0]);
  const cv = groups.map(g => g[1]);
  const tiebreak = groups.map(g => g[0]);

  if (straight && flush) return { rank: 8, name: RANK_NAMES[8]!, tiebreak: [Math.max(...sortedAsc)] };
  if (cv[0] === 4) return { rank: 7, name: RANK_NAMES[7]!, tiebreak };
  if (cv[0] === 3 && cv[1] === 2) return { rank: 6, name: RANK_NAMES[6]!, tiebreak };
  if (flush) return { rank: 5, name: RANK_NAMES[5]!, tiebreak: ranks };
  if (straight) return { rank: 4, name: RANK_NAMES[4]!, tiebreak: [Math.max(...sortedAsc)] };
  if (cv[0] === 3) return { rank: 3, name: RANK_NAMES[3]!, tiebreak };
  if (cv[0] === 2 && cv[1] === 2) return { rank: 2, name: RANK_NAMES[2]!, tiebreak };
  if (cv[0] === 2) return { rank: 1, name: RANK_NAMES[1]!, tiebreak };
  return { rank: 0, name: RANK_NAMES[0]!, tiebreak: ranks };
}

export function compareHands(a: Card[], b: Card[]): number {
  const ra = rankHand(a);
  const rb = rankHand(b);
  if (ra.rank !== rb.rank) return ra.rank - rb.rank;
  for (let i = 0; i < Math.max(ra.tiebreak.length, rb.tiebreak.length); i++) {
    const av = ra.tiebreak[i] ?? 0;
    const bv = rb.tiebreak[i] ?? 0;
    if (av !== bv) return av - bv;
  }
  return 0;
}

function freshDeck(seed: number): { deck: Card[]; nextSeed: number } {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(1), rng);
  return { deck, nextSeed: Math.floor(rng() * 2 ** 31) };
}

function appendLog(log: string[], msg: string): string[] {
  const out = [...log, msg];
  if (out.length > 40) out.shift();
  return out;
}

export function initialState(seed: number, _s: MiniPokerSettings): MiniPokerState {
  const { deck, nextSeed } = freshDeck(seed);
  return {
    rngSeed: nextSeed,
    deck,
    player: [],
    cpu: [],
    selected: [],
    bankroll: STARTING_BANKROLL,
    cpuBank: STARTING_BANKROLL,
    pot: 0,
    phase: "ante",
    round: 0,
    bet: 0,
    log: [`Welcome — bankroll $${STARTING_BANKROLL}. Ante $${ANTE} to deal.`],
    result: "",
    cpuRevealed: false,
  };
}

/** CPU choose which cards to discard (greedy). Returns set of ids. */
export function cpuChooseDiscards(hand: Card[]): Set<string> {
  const r = rankHand(hand);
  // If already 4-kind, full house, flush, straight or better — keep all
  if (r.rank >= 4) return new Set();
  // If three-of-a-kind: keep the three
  if (r.rank === 3) {
    const kept = new Set<number>();
    const targetRank = r.tiebreak[0]!;
    return new Set(hand.filter(c => (c.rank === 1 ? 14 : c.rank) !== targetRank && !kept.has(c.rank)).map(c => c.id));
  }
  // Two pair: discard the kicker
  if (r.rank === 2) {
    const keep = new Set<number>([r.tiebreak[0]!, r.tiebreak[1]!]);
    return new Set(hand.filter(c => !keep.has(c.rank === 1 ? 14 : c.rank)).map(c => c.id));
  }
  // Pair: keep the pair, discard rest (3 cards)
  if (r.rank === 1) {
    const keep = r.tiebreak[0]!;
    return new Set(hand.filter(c => (c.rank === 1 ? 14 : c.rank) !== keep).map(c => c.id));
  }
  // High card: keep the two highest, discard the other 3
  const sorted = [...hand].sort((a, b) => (b.rank === 1 ? 14 : b.rank) - (a.rank === 1 ? 14 : a.rank));
  return new Set(sorted.slice(2).map(c => c.id));
}

function drawReplacement(deck: Card[], hand: Card[], discardIds: Set<string>): { hand: Card[]; deck: Card[] } {
  const kept = hand.filter(c => !discardIds.has(c.id));
  const need = hand.length - kept.length;
  const drawn = deck.slice(0, need);
  const newDeck = deck.slice(need);
  return { hand: [...kept, ...drawn], deck: newDeck };
}

export function reducer(state: MiniPokerState, action: MiniPokerAction): MiniPokerState {
  if (state.phase === "done") return state;

  if (action.type === "deal") {
    if (state.phase !== "ante") return state;
    if (state.bankroll < ANTE || state.cpuBank < ANTE) {
      return { ...state, phase: "done", log: appendLog(state.log, "Not enough chips to ante.") };
    }
    let { deck, rngSeed } = state;
    if (deck.length < 20) {
      const f = freshDeck(state.rngSeed);
      deck = f.deck;
      rngSeed = f.nextSeed;
    }
    const player = deck.slice(0, 5);
    const cpu = deck.slice(5, 10);
    deck = deck.slice(10);
    const round = state.round + 1;
    return {
      ...state,
      rngSeed,
      deck,
      player,
      cpu,
      selected: [],
      pot: ANTE * 2,
      bankroll: state.bankroll - ANTE,
      cpuBank: state.cpuBank - ANTE,
      bet: 0,
      phase: "draw",
      round,
      result: "",
      cpuRevealed: false,
      log: appendLog(state.log, `--- Hand ${round}: ante $${ANTE * 2}.`),
    };
  }

  if (action.type === "toggle") {
    if (state.phase !== "draw") return state;
    const sel = state.selected;
    if (sel.includes(action.cardId)) return { ...state, selected: sel.filter(id => id !== action.cardId) };
    return { ...state, selected: [...sel, action.cardId] };
  }

  if (action.type === "draw") {
    if (state.phase !== "draw") return state;
    const playerDiscardIds = new Set(state.selected);
    const cpuDiscardIds = cpuChooseDiscards(state.cpu);
    const after1 = drawReplacement(state.deck, state.player, playerDiscardIds);
    const after2 = drawReplacement(after1.deck, state.cpu, cpuDiscardIds);
    const player = after1.hand;
    const cpu = after2.hand;
    return {
      ...state,
      deck: after2.deck,
      player,
      cpu,
      selected: [],
      phase: "showdown",
      log: appendLog(state.log, `Draw: you swap ${playerDiscardIds.size}, CPU swaps ${cpuDiscardIds.size}.`),
    };
  }

  if (action.type === "raise") {
    if (state.phase !== "draw") return state;
    const amt = Math.min(action.amount, state.bankroll, state.cpuBank);
    if (amt <= 0) return state;
    return {
      ...state,
      bet: state.bet + amt,
      pot: state.pot + amt * 2,
      bankroll: state.bankroll - amt,
      cpuBank: state.cpuBank - amt,
      log: appendLog(state.log, `Raise $${amt}. Pot $${state.pot + amt * 2}.`),
    };
  }

  if (action.type === "fold") {
    if (state.phase !== "draw" && state.phase !== "showdown") return state;
    return {
      ...state,
      phase: "showdown",
      result: `You folded. CPU takes pot $${state.pot}.`,
      cpuBank: state.cpuBank + state.pot,
      pot: 0,
      cpuRevealed: true,
      log: appendLog(state.log, `You folded.`),
    };
  }

  if (action.type === "next") {
    if (state.phase === "draw") {
      // resolve via showdown if user clicks "next"
      const cmp = compareHands(state.player, state.cpu);
      const playerName = rankHand(state.player).name;
      const cpuName = rankHand(state.cpu).name;
      let bankroll = state.bankroll;
      let cpuBank = state.cpuBank;
      let result: string;
      if (cmp > 0) { bankroll += state.pot; result = `You win pot $${state.pot} with ${playerName}!`; }
      else if (cmp < 0) { cpuBank += state.pot; result = `CPU wins pot $${state.pot} with ${cpuName}.`; }
      else { bankroll += Math.floor(state.pot / 2); cpuBank += Math.floor(state.pot / 2); result = `Push (${playerName}). Split pot.`; }
      const phase: Phase = bankroll < ANTE || cpuBank < ANTE ? "done" : "showdown";
      return { ...state, bankroll, cpuBank, pot: 0, phase, cpuRevealed: true, result, log: appendLog(state.log, result) };
    }
    if (state.phase === "showdown") {
      // Showdown -> resolve if not already
      if (state.pot > 0) {
        // happens when called once at showdown (post-draw)
        const cmp = compareHands(state.player, state.cpu);
        const playerName = rankHand(state.player).name;
        const cpuName = rankHand(state.cpu).name;
        let bankroll = state.bankroll;
        let cpuBank = state.cpuBank;
        let result: string;
        if (cmp > 0) { bankroll += state.pot; result = `You win pot $${state.pot} with ${playerName}!`; }
        else if (cmp < 0) { cpuBank += state.pot; result = `CPU wins pot $${state.pot} with ${cpuName}.`; }
        else { bankroll += Math.floor(state.pot / 2); cpuBank += Math.floor(state.pot / 2); result = `Push. Split pot.`; }
        return { ...state, bankroll, cpuBank, pot: 0, cpuRevealed: true, result, log: appendLog(state.log, result) };
      }
      // pot already resolved — go to ante
      const phase: Phase = state.bankroll < ANTE || state.cpuBank < ANTE ? "done" : "ante";
      return { ...state, phase, player: [], cpu: [], result: "", cpuRevealed: false };
    }
    return state;
  }

  return state;
}

export function isTerminal(state: MiniPokerState): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: state.bankroll };
}
