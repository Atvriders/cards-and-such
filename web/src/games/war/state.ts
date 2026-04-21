import type { Card, Rank } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export type { Card };

export interface WarSettings {
  autoPlay: boolean;
}

export interface WarState {
  settings: WarSettings;
  player: readonly Card[];
  bot: readonly Card[];
  pile: readonly Card[];
  lastResult: string | null;
  rngSeed: number;
  roundsPlayed: number;
  maxRounds: number;
  winner: 0 | 1 | "draw" | null;
}

export type WarAction = { type: "play-round" } | { type: "auto-play" };

// ── helpers ───────────────────────────────────────────────────────────────────

/** Ace counts as 14 when comparing. */
function rankVal(rank: Rank): number {
  return rank === 1 ? 14 : rank;
}

/**
 * Play one war-round recursively.
 * Returns updated player/bot arrays and pile, plus a result label.
 * If a side runs out mid-war that side loses (winner is returned).
 */
interface RoundResult {
  player: Card[];
  bot: Card[];
  result: string;
  warWinner: 0 | 1 | null; // null = normal win/loss, 0/1 = game-winning exhaustion
}

function playRound(
  player: Card[],
  bot: Card[],
  pile: Card[],
): RoundResult {
  if (player.length === 0 || bot.length === 0) {
    // Shouldn't normally reach here — callers check, but guard anyway
    const warWinner = player.length === 0 ? 1 : 0;
    return { player, bot, result: "No cards to play.", warWinner };
  }

  const pCard = player[0]!;
  const bCard = bot[0]!;
  const newPlayer = player.slice(1);
  const newBot = bot.slice(1);
  const newPile = [...pile, pCard, bCard];

  const pVal = rankVal(pCard.rank);
  const bVal = rankVal(bCard.rank);

  if (pVal > bVal) {
    // Player wins round
    const winnerDeck = [...newPlayer, ...newPile];
    return {
      player: winnerDeck,
      bot: newBot,
      result: `You played ${labelCard(pCard)}, bot played ${labelCard(bCard)}. You win the round! (+${newPile.length} cards)`,
      warWinner: null,
    };
  } else if (bVal > pVal) {
    // Bot wins round
    const winnerDeck = [...newBot, ...newPile];
    return {
      player: newPlayer,
      bot: winnerDeck,
      result: `You played ${labelCard(pCard)}, bot played ${labelCard(bCard)}. Bot wins the round! (+${newPile.length} cards)`,
      warWinner: null,
    };
  } else {
    // WAR — equal ranks
    // Each side puts up to 3 face-down + 1 face-up into the pile
    const warCards = 3;
    if (newPlayer.length < warCards + 1) {
      // Player runs out mid-war
      return {
        player: [],
        bot: newBot,
        result: `WAR! You ran out of cards during WAR. Bot wins!`,
        warWinner: 1,
      };
    }
    if (newBot.length < warCards + 1) {
      // Bot runs out mid-war
      return {
        player: newPlayer,
        bot: [],
        result: `WAR! Bot ran out of cards during WAR. You win!`,
        warWinner: 0,
      };
    }

    const pWarCards = newPlayer.slice(0, warCards + 1);
    const bWarCards = newBot.slice(0, warCards + 1);
    const afterWarPlayer = newPlayer.slice(warCards + 1);
    const afterWarBot = newBot.slice(warCards + 1);
    const warPile = [...newPile, ...pWarCards, ...bWarCards];

    // Recurse with the face-up cards already in the pile
    const sub = playRound(
      [pWarCards[warCards]!, ...afterWarPlayer],
      [bWarCards[warCards]!, ...afterWarBot],
      warPile.slice(0, warPile.length - 2), // exclude the face-up cards (they're now the "top")
    );

    return {
      player: sub.player,
      bot: sub.bot,
      result: `WAR! ${sub.result}`,
      warWinner: sub.warWinner,
    };
  }
}

function labelCard(card: Card): string {
  const rank = card.rank === 1 ? "A" : card.rank === 11 ? "J" : card.rank === 12 ? "Q" : card.rank === 13 ? "K" : String(card.rank);
  return `${rank}${card.suit}`;
}

// ── main logic ────────────────────────────────────────────────────────────────

function applyPlayRound(state: WarState): WarState {
  if (state.winner !== null) return state;
  if (state.player.length === 0 || state.bot.length === 0) return state;

  const player = [...state.player];
  const bot = [...state.bot];
  const pile = [...state.pile];

  const result = playRound(player, bot, pile);

  let newPlayer = result.player;
  let newBot = result.bot;
  let winner: WarState["winner"] = null;
  const newRoundsPlayed = state.roundsPlayed + 1;

  if (result.warWinner !== null) {
    winner = result.warWinner;
  } else if (newBot.length === 0) {
    winner = 0;
  } else if (newPlayer.length === 0) {
    winner = 1;
  } else if (newRoundsPlayed >= state.maxRounds) {
    // Cap reached
    if (newPlayer.length > newBot.length) winner = 0;
    else if (newBot.length > newPlayer.length) winner = 1;
    else winner = "draw";
  }

  return {
    ...state,
    player: newPlayer,
    bot: newBot,
    pile: [],
    lastResult: result.result,
    roundsPlayed: newRoundsPlayed,
    winner,
  };
}

// ── reducer ───────────────────────────────────────────────────────────────────

export function reducer(state: WarState, action: WarAction): WarState {
  if (action.type === "play-round") {
    return applyPlayRound(state);
  }
  if (action.type === "auto-play") {
    let s = state;
    let iterations = 0;
    const maxIter = state.maxRounds + 10;
    while (s.winner === null && iterations < maxIter) {
      s = applyPlayRound(s);
      iterations++;
    }
    return s;
  }
  return state;
}

// ── initialState ──────────────────────────────────────────────────────────────

export function initialState(seed: number, settings: WarSettings): WarState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);
  const mid = Math.floor(deck.length / 2);
  return {
    settings,
    player: deck.slice(0, mid),
    bot: deck.slice(mid),
    pile: [],
    lastResult: null,
    rngSeed: seed,
    roundsPlayed: 0,
    maxRounds: 500,
    winner: null,
  };
}

// ── isTerminal ────────────────────────────────────────────────────────────────

export function isTerminal(state: WarState): { score: number } | null {
  if (state.winner === null) return null;
  if (state.winner === 0) return { score: Math.max(100, 500 - state.roundsPlayed) };
  if (state.winner === 1) return { score: 0 };
  return { score: 50 }; // draw
}
