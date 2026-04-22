import type { Card } from "../../engines/deck/index.js";
import { newDeck, shuffle, deal } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface RazzSettings {
  startingBankroll: "500" | "1000" | "5000";
  anteSize: "5" | "10" | "25";
}

export type RazzStreet = 3 | 4 | 5 | 6 | 7;
export type RazzPhase = "waiting" | "betting" | "showdown";

export interface RazzPlayerState {
  cards: Card[];
  faceUp: boolean[];
  bet: number;
  bankroll: number;
  folded: boolean;
}

export interface RazzState {
  settings: RazzSettings;
  rngSeed: number;
  handsPlayed: number;
  phase: RazzPhase;
  street: RazzStreet;
  deck: Card[];
  player: RazzPlayerState;
  bot: RazzPlayerState;
  pot: number;
  playerTurn: boolean;
  lastAction: string;
  lastResult: string;
}

export type RazzAction =
  | { type: "deal" }
  | { type: "check" }
  | { type: "bet" }
  | { type: "call" }
  | { type: "raise" }
  | { type: "fold" };

/** Razz low evaluation: Ace=1, straights/flushes don't count.
 *  Pick the 5 lowest distinct cards from 7. Lower is better.
 *  Returns a tuple of sorted low cards (ascending, lower = better).
 */
export function razzRank(cards: Card[]): number[] {
  // Ace = 1 (already rank 1 in the deck)
  const ranks = cards.map(c => c.rank).sort((a, b) => a - b);
  // Take 5 lowest
  return ranks.slice(0, 5);
}

/** Compare two razz hands: negative = hand a is BETTER (lower) */
export function compareRazz(a: Card[], b: Card[]): number {
  const ra = razzRank(a);
  const rb = razzRank(b);
  // Compare from highest card in the 5-card hand downward
  // Both sorted ascending; worst card is last
  for (let i = 4; i >= 0; i--) {
    const av = ra[i] ?? 14;
    const bv = rb[i] ?? 14;
    if (av !== bv) return bv - av; // higher is worse, so bv - av: if a's card is lower, returns positive = a wins
  }
  return 0;
}

function advanceSeed(seed: number): { rng: () => number; nextSeed: number } {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return { rng: mulberry32(seed), nextSeed };
}

function streetBet(street: RazzStreet, ante: number): number {
  return street >= 5 ? ante * 2 : ante;
}

/** Bot strategy: estimate hand quality by sum of low cards */
function botRazzDecide(
  botCards: Card[],
  toCall: number,
  pot: number,
  betAmt: number,
  rng: () => number
): "check" | "call" | "raise" | "fold" {
  const ranks = razzRank(botCards);
  // Strength: average of 5 low ranks (lower is better, so invert)
  const avg = ranks.reduce((s, r) => s + r, 0) / ranks.length;
  const strength = 1 - avg / 14; // 0..1, higher is better hand for razz

  if (toCall === 0) {
    if (strength > 0.6) return "raise";
    if (strength > 0.4 && rng() > 0.5) return "raise";
    return "check";
  }

  const equity = strength;
  const odds = toCall / (pot + toCall);
  if (equity > odds + 0.15 && strength > 0.55) return "raise";
  if (equity > odds) return "call";
  if (rng() > 0.75) return "call";
  return "fold";
}

export function initialState(seed: number, settings: RazzSettings): RazzState {
  const { rng, nextSeed } = advanceSeed(seed);
  const deck = shuffle(newDeck(1), rng);
  const bankroll = parseInt(settings.startingBankroll, 10);
  const emptyPlayer: RazzPlayerState = { cards: [], faceUp: [], bet: 0, bankroll, folded: false };
  return {
    settings,
    rngSeed: nextSeed,
    handsPlayed: 0,
    phase: "waiting",
    street: 3,
    deck,
    player: emptyPlayer,
    bot: { ...emptyPlayer },
    pot: 0,
    playerTurn: true,
    lastAction: "",
    lastResult: "",
  };
}

function dealNewHand(state: RazzState): RazzState {
  const { rng, nextSeed } = advanceSeed(state.rngSeed);
  const deck = shuffle(newDeck(1), rng);
  const ante = parseInt(state.settings.anteSize, 10);

  const d = deal(deck, 6);
  const pCards = d.drawn.slice(0, 3);
  const bCards = d.drawn.slice(3, 6);

  const player: RazzPlayerState = {
    cards: pCards,
    faceUp: [false, false, true],
    bet: ante,
    bankroll: state.player.bankroll - ante,
    folded: false,
  };
  const bot: RazzPlayerState = {
    cards: bCards,
    faceUp: [false, false, true],
    bet: ante,
    bankroll: state.bot.bankroll - ante,
    folded: false,
  };

  // In Razz, HIGHEST upcard brings in (worst card acts first)
  const pUp = pCards[2]!.rank;
  const bUp = bCards[2]!.rank;
  const playerTurn = pUp >= bUp; // player with higher card goes first (worse card)

  return {
    ...state,
    rngSeed: nextSeed,
    handsPlayed: state.handsPlayed + 1,
    phase: "betting",
    street: 3,
    deck: d.remaining,
    player,
    bot,
    pot: ante * 2,
    playerTurn,
    lastAction: "Antes posted. 3rd street.",
    lastResult: "",
  };
}

function dealNextStreet(state: RazzState): RazzState {
  const nextStreet = (state.street + 1) as RazzStreet;
  const faceDown = nextStreet === 7;

  const d1 = deal(state.deck, 1);
  const pCard = d1.drawn[0]!;
  const d2 = deal(d1.remaining, 1);
  const bCard = d2.drawn[0]!;

  const player: RazzPlayerState = {
    ...state.player,
    cards: [...state.player.cards, pCard],
    faceUp: [...state.player.faceUp, !faceDown],
    bet: 0,
  };
  const bot: RazzPlayerState = {
    ...state.bot,
    cards: [...state.bot.cards, bCard],
    faceUp: [...state.bot.faceUp, !faceDown],
    bet: 0,
  };

  return {
    ...state,
    street: nextStreet,
    deck: d2.remaining,
    player,
    bot,
    playerTurn: true,
    lastAction: `--- ${nextStreet}th street ---`,
  };
}

function resolveShowdown(state: RazzState): RazzState {
  if (state.player.folded) {
    return {
      ...state,
      phase: "showdown",
      bot: { ...state.bot, bankroll: state.bot.bankroll + state.pot },
      lastResult: `Player folded. Bot wins $${state.pot}.`,
    };
  }
  if (state.bot.folded) {
    return {
      ...state,
      phase: "showdown",
      player: { ...state.player, bankroll: state.player.bankroll + state.pot },
      lastResult: `Bot folded. Player wins $${state.pot}!`,
    };
  }

  const cmp = compareRazz(state.player.cards, state.bot.cards);
  let player = state.player;
  let bot = state.bot;
  let lastResult: string;

  const pRank = razzRank(state.player.cards);
  const bRank = razzRank(state.bot.cards);
  const pDesc = pRank.join("-");
  const bDesc = bRank.join("-");

  if (cmp > 0) {
    player = { ...player, bankroll: player.bankroll + state.pot };
    lastResult = `Player wins $${state.pot}! (${pDesc} vs ${bDesc})`;
  } else if (cmp < 0) {
    bot = { ...bot, bankroll: bot.bankroll + state.pot };
    lastResult = `Bot wins $${state.pot}. (${bDesc} vs ${pDesc})`;
  } else {
    const half = Math.floor(state.pot / 2);
    player = { ...player, bankroll: player.bankroll + half };
    bot = { ...bot, bankroll: bot.bankroll + state.pot - half };
    lastResult = "Split pot!";
  }

  return { ...state, phase: "showdown", player, bot, lastResult };
}

function botTakeTurn(state: RazzState): RazzState {
  const { rng, nextSeed } = advanceSeed(state.rngSeed);
  const ante = parseInt(state.settings.anteSize, 10);
  const betAmt = streetBet(state.street, ante);
  const toCall = state.player.bet - state.bot.bet;

  const action = botRazzDecide(state.bot.cards, toCall, state.pot, betAmt, rng);
  let newState = { ...state, rngSeed: nextSeed, playerTurn: true };

  if (action === "fold") {
    return resolveShowdown({
      ...newState,
      bot: { ...newState.bot, folded: true },
      lastAction: "Bot: Fold",
    });
  } else if (action === "check") {
    const s = { ...newState, lastAction: "Bot: Check" };
    if (state.street === 7) return resolveShowdown(s);
    return dealNextStreet(s);
  } else if (action === "call") {
    const callAmt = Math.min(toCall, state.bot.bankroll);
    const s = {
      ...newState,
      bot: { ...newState.bot, bet: newState.bot.bet + callAmt, bankroll: newState.bot.bankroll - callAmt },
      pot: state.pot + callAmt,
      lastAction: `Bot: Call $${callAmt}`,
    };
    if (state.street === 7) return resolveShowdown(s);
    return dealNextStreet(s);
  } else {
    const raiseAmt = Math.min(toCall + betAmt, state.bot.bankroll);
    return {
      ...newState,
      bot: { ...newState.bot, bet: newState.bot.bet + raiseAmt, bankroll: newState.bot.bankroll - raiseAmt },
      pot: state.pot + raiseAmt,
      lastAction: `Bot: Raise $${raiseAmt}`,
      playerTurn: true,
    };
  }
}

export function reducer(state: RazzState, action: RazzAction): RazzState {
  switch (action.type) {
    case "deal": {
      if (state.phase !== "waiting" && state.phase !== "showdown") return state;
      if (state.player.bankroll <= 0 || state.bot.bankroll <= 0) return state;
      return dealNewHand(state);
    }
    case "fold": {
      if (!state.playerTurn || state.phase !== "betting") return state;
      return resolveShowdown({
        ...state,
        player: { ...state.player, folded: true },
        lastAction: "Player: Fold",
      });
    }
    case "check": {
      if (!state.playerTurn || state.phase !== "betting") return state;
      const toCall = state.bot.bet - state.player.bet;
      if (toCall > 0) return state;
      return botTakeTurn({ ...state, lastAction: "Player: Check", playerTurn: false });
    }
    case "call": {
      if (!state.playerTurn || state.phase !== "betting") return state;
      const toCall = state.bot.bet - state.player.bet;
      if (toCall <= 0) return state;
      const callAmt = Math.min(toCall, state.player.bankroll);
      return botTakeTurn({
        ...state,
        player: { ...state.player, bet: state.player.bet + callAmt, bankroll: state.player.bankroll - callAmt },
        pot: state.pot + callAmt,
        lastAction: `Player: Call $${callAmt}`,
        playerTurn: false,
      });
    }
    case "bet":
    case "raise": {
      if (!state.playerTurn || state.phase !== "betting") return state;
      const ante = parseInt(state.settings.anteSize, 10);
      const betAmt = streetBet(state.street, ante);
      const toCall = state.bot.bet - state.player.bet;
      const total = toCall + betAmt;
      if (state.player.bankroll < total) return state;
      return botTakeTurn({
        ...state,
        player: { ...state.player, bet: state.player.bet + total, bankroll: state.player.bankroll - total },
        pot: state.pot + total,
        lastAction: `Player: ${toCall > 0 ? "Raise" : "Bet"} $${total}`,
        playerTurn: false,
      });
    }
    default:
      return state;
  }
}

export function isTerminal(state: RazzState): { score: number } | null {
  if (state.phase === "showdown" && (state.player.bankroll <= 0 || state.bot.bankroll <= 0)) {
    return { score: state.player.bankroll };
  }
  return null;
}
