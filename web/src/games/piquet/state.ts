// Piquet – classic French 2-player card game (32-card Piquet deck)
// Simplified: Declaration phase + tricks phase
import type { Card, Suit } from "../../engines/deck/index.js";
import { shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface PiquetSettings {
  botDifficulty: "easy" | "hard";
}

export type PiquetPhase = "discard" | "tricks" | "done";

export interface PiquetState {
  settings: PiquetSettings;
  rngSeed: number;
  hands: readonly (readonly Card[])[];
  talon: readonly Card[];          // 8-card stock to exchange from
  discarded: readonly Card[];      // player's discards
  currentTrick: readonly { seat: number; card: Card }[];
  leadSeat: number;
  turn: number;
  phase: PiquetPhase;
  playerScore: number;
  botScore: number;
  message: string;
}

export type PiquetAction =
  | { type: "discard"; cardIds: string[] }   // exchange up to 5 cards from talon
  | { type: "play"; cardId: string };

const PIQUET_RANKS = [7, 8, 9, 10, 11, 12, 13, 1] as const;
const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];

function piquetDeck(): Card[] {
  const cards: Card[] = [];
  for (const s of SUITS) {
    for (const r of PIQUET_RANKS) {
      cards.push({ suit: s, rank: r as Card["rank"], id: `pq-${s}${r}` });
    }
  }
  return cards;
}

function rankOrder(rank: Card["rank"]): number {
  if (rank === 1) return 14;
  return rank;
}

function cardStrength(card: Card, ledSuit: Suit): number {
  // No trump in Piquet; highest card of led suit wins
  if (card.suit === ledSuit) return 100 + rankOrder(card.rank);
  return rankOrder(card.rank);
}

function trickWinner(trick: readonly { seat: number; card: Card }[]): number {
  const led = trick[0]!.card.suit;
  return trick.reduce((best, cur) =>
    cardStrength(cur.card, led) > cardStrength(best.card, led) ? cur : best
  ).seat;
}

export function legalPlays(state: PiquetState, seat: number): Card[] {
  const hand = [...(state.hands[seat] ?? [])];
  const trick = state.currentTrick;
  if (trick.length === 0) return hand;
  const led = trick[0]!.card.suit;
  const matching = hand.filter(c => c.suit === led);
  return matching.length > 0 ? matching : hand;
}

// Score declarations: sequences, sets, point (number of cards in longest suit)
function scoreDeclarations(hand: readonly Card[]): number {
  let pts = 0;
  // Point: longest suit by card count (pip values: A=11, face=10, others=face value)
  const suitCounts: Record<string, number> = {};
  const suitPips: Record<string, number> = {};
  for (const c of hand) {
    suitCounts[c.suit] = (suitCounts[c.suit] ?? 0) + 1;
    const pip = c.rank === 1 ? 11 : c.rank >= 10 ? 10 : c.rank;
    suitPips[c.suit] = (suitPips[c.suit] ?? 0) + pip;
  }
  const maxCount = Math.max(...Object.values(suitCounts));
  pts += maxCount; // score = number of cards in point suit

  // Sequences: runs of 3+ in same suit (sorted by rank)
  for (const s of SUITS) {
    const suitCards = hand.filter(c => c.suit === s).map(c => rankOrder(c.rank)).sort((a, b) => a - b);
    let run = 1;
    let maxRun = 1;
    for (let i = 1; i < suitCards.length; i++) {
      if (suitCards[i]! - suitCards[i - 1]! === 1) run++;
      else run = 1;
      if (run > maxRun) maxRun = run;
    }
    if (maxRun >= 3) pts += maxRun >= 5 ? maxRun + 10 : maxRun;
  }

  // Sets: 3 or 4 of a kind (rank >= 10)
  const rankCounts: Record<number, number> = {};
  for (const c of hand) rankCounts[c.rank] = (rankCounts[c.rank] ?? 0) + 1;
  for (const [rank, count] of Object.entries(rankCounts)) {
    if (Number(rank) >= 10 && count >= 3) pts += count === 4 ? 14 : 3;
  }

  return pts;
}

function botPlay(state: PiquetState, seat: number): Card {
  const legal = legalPlays(state, seat);
  if (legal.length === 0) return state.hands[seat]![0]!;
  if (legal.length === 1) return legal[0]!;
  const trick = state.currentTrick;
  if (trick.length === 0) {
    return legal.reduce((hi, c) => rankOrder(c.rank) > rankOrder(hi.rank) ? c : hi);
  }
  const led = trick[0]!.card.suit;
  const best = trick.reduce((b, cur) =>
    cardStrength(cur.card, led) > cardStrength(b.card, led) ? cur : b
  );
  const winCards = legal.filter(c => cardStrength(c, led) > cardStrength(best.card, led));
  if (winCards.length > 0) return winCards.reduce((lo, c) => rankOrder(c.rank) < rankOrder(lo.rank) ? c : lo);
  return legal.reduce((lo, c) => rankOrder(c.rank) < rankOrder(lo.rank) ? c : lo);
}

function applyPlay(state: PiquetState, seat: number, card: Card): PiquetState {
  const newHands = state.hands.map((h, i) => i === seat ? h.filter(c => c.id !== card.id) : h);
  const newTrick = [...state.currentTrick, { seat, card }];
  let s: PiquetState = { ...state, hands: newHands, currentTrick: newTrick };

  if (newTrick.length === 2) {
    const winner = trickWinner(newTrick);
    const winPts = winner === 0 ? 1 : 0;
    const newPlayerScore = state.playerScore + winPts;
    const newBotScore = state.botScore + (1 - winPts);
    s = {
      ...s,
      currentTrick: [],
      leadSeat: winner,
      turn: winner,
      playerScore: newPlayerScore,
      botScore: newBotScore,
    };

    if (newHands[0]!.length === 0) {
      // Capot bonus: winning all 12 tricks = +40
      const bonus = newPlayerScore === 12 ? 40 : newBotScore === 12 ? 40 : 0;
      const fp = newPlayerScore + (newPlayerScore === 12 ? bonus : 0);
      const fb = newBotScore + (newBotScore === 12 ? bonus : 0);
      return {
        ...s,
        playerScore: fp,
        botScore: fb,
        phase: "done",
        message: `Game over! You: ${fp} | Bot: ${fb}`,
      };
    }
    s = { ...s, message: `You win trick → +1 pt. Score: You ${newPlayerScore} | Bot ${newBotScore}` };
  } else {
    s = { ...s, turn: 1 - seat };
  }
  return s;
}

export function reducer(state: PiquetState, action: PiquetAction): PiquetState {
  if (state.phase === "done") return state;

  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);

  if (state.phase === "discard" && action.type === "discard") {
    const toDiscard = new Set(action.cardIds.slice(0, 5));
    const newHand0 = state.hands[0]!.filter(c => !toDiscard.has(c.id));
    const discardedCards = state.hands[0]!.filter(c => toDiscard.has(c.id));
    const draw = state.talon.slice(0, discardedCards.length);
    const newTalon = state.talon.slice(discardedCards.length);

    // Bot also exchanges up to 8 cards (takes all talon remaining)
    const botKeep = state.hands[1]!.filter(c => rankOrder(c.rank) >= 10 || c.suit === "♥");
    const botDiscard = state.hands[1]!.filter(c => !botKeep.some(k => k.id === c.id));
    const botDraw = newTalon.slice(0, Math.min(botDiscard.length, newTalon.length));
    const finalBotHand = [...botKeep, ...botDraw];

    const finalPlayerHand = [...newHand0, ...draw];
    const playerPts = scoreDeclarations(finalPlayerHand);
    const botPts = scoreDeclarations(finalBotHand);

    return {
      ...state,
      rngSeed: nextSeed,
      hands: [finalPlayerHand, finalBotHand],
      talon: [],
      discarded: discardedCards,
      phase: "tricks",
      turn: state.leadSeat,
      playerScore: playerPts,
      botScore: botPts,
      message: `Declarations: You ${playerPts} pts, Bot ${botPts} pts. Now play tricks!`,
    };
  }

  if (state.phase === "tricks" && action.type === "play") {
    if (state.turn !== 0) return state;
    const card = state.hands[0]!.find(c => c.id === action.cardId);
    if (!card) return state;
    if (!legalPlays(state, 0).some(c => c.id === card.id)) return state;

    let s: PiquetState = { ...state, rngSeed: nextSeed };
    s = applyPlay(s, 0, card);
    if (s.phase === "tricks" && s.turn !== 0 && s.hands[1]!.length > 0) {
      const botCard = botPlay(s, 1);
      if (botCard) {
        s = applyPlay(s, 1, botCard);
        // If bot won, auto-lead
        if (s.phase === "tricks" && s.leadSeat === 1 && s.hands[1]!.length > 0) {
          const botLead = botPlay(s, 1);
          if (botLead) {
            const bh1 = s.hands[1]!.filter(c => c.id !== botLead.id);
            s = {
              ...s,
              hands: [s.hands[0]!, bh1] as typeof state.hands,
              currentTrick: [{ seat: 1, card: botLead }],
              turn: 0,
            };
          }
        }
      }
    }
    return s;
  }

  return state;
}

export function initialState(seed: number, settings: PiquetSettings): PiquetState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const dealRng = mulberry32(nextSeed);
  const deck = shuffle(piquetDeck(), dealRng);
  const hand0 = deck.slice(0, 12);
  const hand1 = deck.slice(12, 24);
  const talon = deck.slice(24); // 8 cards
  return {
    settings,
    rngSeed: Math.floor(dealRng() * 2 ** 31),
    hands: [hand0, hand1],
    talon,
    discarded: [],
    currentTrick: [],
    leadSeat: 0,
    turn: 0,
    phase: "discard",
    playerScore: 0,
    botScore: 0,
    message: "Discard up to 5 cards to exchange from the talon (click cards then Discard).",
  };
}

export function isTerminal(state: PiquetState): { score: number } | null {
  if (state.phase !== "done") return null;
  const diff = state.playerScore - state.botScore;
  return { score: Math.max(0, Math.min(100, 50 + diff * 2)) };
}
