import type { Card, Rank } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Nine-Card Brag: British game
// Each player gets 9 cards, forms 3 brag hands of 3 cards each.
// Brag hand rank: prial (3-of-kind) > flush > straight > pair > high card
// Compare your best hand vs opponent's best, then second, then third.
// Win 2+ comparisons => win the round. First to 3 round wins => game win.

export interface NineCardBragSettings {
  rounds: "3" | "5" | "7";
}

export type BragPhase = "arrange" | "reveal" | "done";

export type BragHandRank = "prial" | "flush" | "straight" | "pair" | "highcard";

export interface BragHand {
  cards: readonly Card[];
}

export interface NineCardBragState {
  settings: NineCardBragSettings;
  playerHand: readonly Card[];
  botHand: readonly Card[];
  playerArrangement: readonly BragHand[] | null; // null until arranged
  botArrangement: readonly BragHand[];
  phase: BragPhase;
  selected: readonly number[]; // indices into playerHand for current grouping
  currentGroup: number; // 0,1,2 — which of the 3 hands being built
  playerWins: number;
  botWins: number;
  roundsTarget: number;
  roundResult: string;
  rngSeed: number;
}

export type NineCardBragAction =
  | { type: "toggleCard"; index: number }
  | { type: "confirmGroup" }
  | { type: "resetArrangement" }
  | { type: "reveal" }
  | { type: "newRound" };

// Brag hand score: higher = better
export function rankVal(r: Rank): number {
  if (r === 1) return 14; // Ace high in brag
  return r;
}

export function bragHandScore(hand: readonly Card[]): number {
  const ranks = hand.map(c => rankVal(c.rank));
  const suits = hand.map(c => c.suit);
  const allSame = ranks.every(r => r === ranks[0]);
  const allFlush = suits.every(s => s === suits[0]);
  const sortedR = [...ranks].sort((a, b) => a - b);
  const isStraight = sortedR[2]! - sortedR[0]! === 2 && new Set(ranks).size === 3;
  const hasPair = !allSame && (ranks[0] === ranks[1] || ranks[1] === ranks[2] || ranks[0] === ranks[2]);
  const high = Math.max(...ranks);

  if (allSame) return 500 + (ranks[0]!); // prial — special ranking: 3s beats Aces
  if (allFlush && isStraight) return 400 + high;
  if (allFlush) return 300 + high;
  if (isStraight) return 200 + high;
  if (hasPair) {
    const pairRank = ranks[0] === ranks[1] ? ranks[0]! : (ranks[1] === ranks[2] ? ranks[1]! : ranks[0]!);
    return 100 + pairRank;
  }
  return high;
}

function compareHands(a: readonly Card[], b: readonly Card[]): 1 | 0 | -1 {
  const sa = bragHandScore(a);
  const sb = bragHandScore(b);
  if (sa > sb) return 1;
  if (sa < sb) return -1;
  return 0;
}

function buildBotArrangement(hand: readonly Card[]): BragHand[] {
  // Simple: split 9 cards into 3 groups of 3 in best-greedy order
  // Try to make prial first, then pairs
  const remaining = [...hand];
  const groups: BragHand[] = [];
  for (let g = 0; g < 3; g++) {
    if (remaining.length === 0) break;
    // Find best subset of 3 from remaining
    let bestScore = -1;
    let bestIdx = [0, 1, 2];
    for (let i = 0; i < remaining.length - 2; i++) {
      for (let j = i + 1; j < remaining.length - 1; j++) {
        for (let k = j + 1; k < remaining.length; k++) {
          const sub = [remaining[i]!, remaining[j]!, remaining[k]!];
          const sc = bragHandScore(sub);
          if (sc > bestScore) { bestScore = sc; bestIdx = [i, j, k]; }
        }
      }
    }
    groups.push({ cards: [remaining[bestIdx[0]!]!, remaining[bestIdx[1]!]!, remaining[bestIdx[2]!]!] });
    for (const idx of [...bestIdx].sort((a, b) => b - a)) remaining.splice(idx, 1);
  }
  return groups;
}

export function initialState(seed: number, settings: NineCardBragSettings): NineCardBragState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);
  const nextSeed = Math.floor(rng() * 2 ** 31);

  const playerHand = deck.slice(0, 9);
  const botHand = deck.slice(9, 18);
  const botArrangement = buildBotArrangement(botHand);

  return {
    settings,
    playerHand,
    botHand,
    playerArrangement: null,
    botArrangement,
    phase: "arrange",
    selected: [],
    currentGroup: 0,
    playerWins: 0,
    botWins: 0,
    roundsTarget: parseInt(settings.rounds, 10),
    roundResult: "",
    rngSeed: nextSeed,
  };
}

export function reducer(state: NineCardBragState, action: NineCardBragAction): NineCardBragState {
  if (state.phase === "done") return state;

  if (action.type === "toggleCard" && state.phase === "arrange") {
    const idx = action.index;
    // Can't select if card already placed in a group
    if (state.playerArrangement) return state; // shouldn't happen, but guard
    const alreadySel = state.selected.includes(idx);
    let newSel: number[];
    if (alreadySel) {
      newSel = state.selected.filter(i => i !== idx);
    } else {
      if (state.selected.length >= 3) return state; // max 3 selected
      newSel = [...state.selected, idx];
    }
    return { ...state, selected: newSel };
  }

  if (action.type === "confirmGroup" && state.phase === "arrange") {
    if (state.selected.length !== 3) return state;
    const group: BragHand = { cards: state.selected.map(i => state.playerHand[i]!) };
    const groups = state.playerArrangement ? [...state.playerArrangement, group] : [group];
    if (state.currentGroup < 2) {
      return { ...state, playerArrangement: groups as BragHand[], selected: [], currentGroup: state.currentGroup + 1 };
    }
    // All 3 groups formed
    return { ...state, playerArrangement: groups as BragHand[], selected: [], currentGroup: 3 };
  }

  if (action.type === "resetArrangement" && state.phase === "arrange") {
    return { ...state, playerArrangement: null, selected: [], currentGroup: 0 };
  }

  if (action.type === "reveal" && state.phase === "arrange") {
    if (!state.playerArrangement || state.playerArrangement.length < 3) return state;
    // Compare each hand pair
    const results: Array<1 | 0 | -1> = [];
    for (let i = 0; i < 3; i++) {
      results.push(compareHands(state.playerArrangement[i]!.cards, state.botArrangement[i]!.cards));
    }
    const playerWon = results.filter(r => r === 1).length;
    const botWon = results.filter(r => r === -1).length;
    const pWins = state.playerWins + (playerWon >= 2 ? 1 : 0);
    const bWins = state.botWins + (botWon >= 2 ? 1 : 0);
    const roundResult = playerWon >= 2 ? "You win this round!" : botWon >= 2 ? "Bot wins this round." : "Draw this round.";
    const isDone = pWins >= state.roundsTarget || bWins >= state.roundsTarget;
    return { ...state, phase: isDone ? "done" : "reveal", playerWins: pWins, botWins: bWins, roundResult };
  }

  if (action.type === "newRound" && state.phase === "reveal") {
    const rng = mulberry32(state.rngSeed);
    const deck = shuffle(newDeck(), rng);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const playerHand = deck.slice(0, 9);
    const botHand = deck.slice(9, 18);
    const botArrangement = buildBotArrangement(botHand);
    return {
      ...state,
      playerHand,
      botHand,
      playerArrangement: null,
      botArrangement,
      phase: "arrange",
      selected: [],
      currentGroup: 0,
      roundResult: "",
      rngSeed: nextSeed,
    };
  }

  return state;
}

export function isTerminal(state: NineCardBragState): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: state.playerWins >= state.roundsTarget ? 100 : 0 };
}
