import type { Card } from "../../engines/deck/index.js";
import { newDeck, shuffle, deal } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { rankHand } from "../../engines/deck/ranking.js";
import type { HandClass } from "../../engines/deck/ranking.js";

export interface TexasHoldemSettings {
  startingBankroll: "500" | "1000" | "5000";
  blinds: "2/4" | "5/10" | "10/20";
}

export type TexasHoldemPhase =
  | "waiting"
  | "pre-flop"
  | "flop"
  | "turn"
  | "river"
  | "showdown";

export type PlayerAction = "check" | "bet" | "call" | "raise" | "fold";

export interface TexasHoldemState {
  settings: TexasHoldemSettings;
  rngSeed: number;
  bankroll: number; // player bankroll
  botBankroll: number;
  handsPlayed: number;
  phase: TexasHoldemPhase;
  deck: Card[];
  playerHole: Card[];
  botHole: Card[];
  community: Card[];
  pot: number;
  playerBet: number; // current street bet
  botBet: number;
  dealerSeat: 0 | 1; // 0 = player is dealer, 1 = bot is dealer
  currentStreetBets: number; // how much each player has put in this street
  playerTurn: boolean;
  lastAction: string;
  lastResult: string;
}

export type TexasHoldemAction =
  | { type: "deal" }
  | { type: "check" }
  | { type: "bet" }
  | { type: "call" }
  | { type: "raise" }
  | { type: "fold" };

const CLASS_ORDER: HandClass[] = [
  "high-card", "one-pair", "two-pair", "three-of-a-kind",
  "straight", "flush", "full-house", "four-of-a-kind", "straight-flush",
];

export function compareHands(a: Card[], b: Card[]): number {
  const ha = rankHand(a);
  const hb = rankHand(b);
  const ra = CLASS_ORDER.indexOf(ha.class);
  const rb = CLASS_ORDER.indexOf(hb.class);
  if (ra !== rb) return ra - rb;
  for (let i = 0; i < Math.max(ha.kickers.length, hb.kickers.length); i++) {
    const ka = ha.kickers[i] ?? 0;
    const kb = hb.kickers[i] ?? 0;
    if (ka !== kb) return ka - kb;
  }
  return 0;
}

/** Best 5 of n cards */
export function bestFiveOf(cards: Card[]): Card[] {
  if (cards.length <= 5) return cards;
  const n = cards.length;
  let best: Card[] | null = null;
  for (let a = 0; a < n - 4; a++)
    for (let b = a + 1; b < n - 3; b++)
      for (let c = b + 1; c < n - 2; c++)
        for (let d = c + 1; d < n - 1; d++)
          for (let e = d + 1; e < n; e++) {
            const five = [cards[a]!, cards[b]!, cards[c]!, cards[d]!, cards[e]!];
            if (!best || compareHands(five, best) > 0) best = five;
          }
  return best ?? cards.slice(0, 5);
}

function parseBlinds(blinds: string): { small: number; big: number } {
  const [s, b] = blinds.split("/").map(Number);
  return { small: s!, big: b! };
}

function advanceSeed(seed: number): { rng: () => number; nextSeed: number } {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return { rng: mulberry32(seed), nextSeed };
}

/** Fixed-limit bet amount per street */
function limitBet(phase: TexasHoldemPhase, big: number): number {
  return phase === "turn" || phase === "river" ? big * 2 : big;
}

/** Simple bot decision: based on hand strength and pot odds */
function botDecide(
  botHole: Card[],
  community: Card[],
  toCall: number,
  pot: number,
  betAmount: number,
  rng: () => number
): "check" | "call" | "raise" | "fold" {
  const allCards = [...botHole, ...community];
  const handCards = allCards.length >= 5 ? bestFiveOf(allCards) : allCards;
  const strength =
    allCards.length >= 5
      ? CLASS_ORDER.indexOf(rankHand(handCards).class)
      : -1;

  if (toCall === 0) {
    // Bot can check or bet
    if (strength >= 4 || (strength >= 2 && rng() > 0.4)) return "raise"; // bet
    if (strength >= 1 || rng() > 0.6) return "check";
    return "check";
  }

  // Pot odds
  const equity = strength >= 0 ? (strength + 1) / 9 : 0.2;
  const odds = toCall / (pot + toCall);
  if (equity > odds + 0.1 && strength >= 3) return "raise";
  if (equity > odds) return "call";
  if (rng() > 0.7) return "call"; // bluff call
  return "fold";
}

export function initialState(seed: number, settings: TexasHoldemSettings): TexasHoldemState {
  const { rng, nextSeed } = advanceSeed(seed);
  const deck = shuffle(newDeck(1), rng);
  const bankroll = parseInt(settings.startingBankroll, 10);
  return {
    settings,
    rngSeed: nextSeed,
    bankroll,
    botBankroll: bankroll,
    handsPlayed: 0,
    phase: "waiting",
    deck,
    playerHole: [],
    botHole: [],
    community: [],
    pot: 0,
    playerBet: 0,
    botBet: 0,
    dealerSeat: 0,
    currentStreetBets: 0,
    playerTurn: true,
    lastAction: "",
    lastResult: "",
  };
}

function dealNewHand(state: TexasHoldemState): TexasHoldemState {
  const { rng, nextSeed } = advanceSeed(state.rngSeed);
  const deck = shuffle(newDeck(1), rng);
  const { small, big } = parseBlinds(state.settings.blinds);

  // Alternate dealer
  const dealerSeat = state.handsPlayed % 2 === 0 ? (0 as const) : (1 as const);

  // In heads-up: dealer posts small blind, other posts big blind
  // dealer=0 means player is dealer/small blind
  const playerBlind = dealerSeat === 0 ? small : big;
  const botBlind = dealerSeat === 0 ? big : small;

  const d1 = deal(deck, 4); // 2 for player, 2 for bot
  const playerHole = d1.drawn.slice(0, 2);
  const botHole = d1.drawn.slice(2, 4);

  const playerBankroll = state.bankroll - playerBlind;
  const botBankroll = state.botBankroll - botBlind;

  // In heads-up pre-flop: dealer (small blind) acts first
  // But after blinds, player who posted big blind has option
  // Simplify: dealer acts first pre-flop
  const playerTurn = dealerSeat === 0; // player is dealer -> player acts first pre-flop

  return {
    ...state,
    rngSeed: nextSeed,
    bankroll: playerBankroll,
    botBankroll,
    handsPlayed: state.handsPlayed + 1,
    phase: "pre-flop",
    deck: d1.remaining,
    playerHole,
    botHole,
    community: [],
    pot: playerBlind + botBlind,
    playerBet: playerBlind,
    botBet: botBlind,
    dealerSeat,
    currentStreetBets: Math.max(playerBlind, botBlind),
    playerTurn,
    lastAction: `Blinds: Player $${playerBlind}, Bot $${botBlind}`,
    lastResult: "",
  };
}

function advanceStreet(state: TexasHoldemState): TexasHoldemState {
  const { rng, nextSeed } = advanceSeed(state.rngSeed);
  let nextPhase: TexasHoldemPhase;
  let newCommunity: Card[] = [...state.community];
  let deck = state.deck;

  if (state.phase === "pre-flop") {
    const drawn = deal(deck, 3);
    newCommunity = drawn.drawn;
    deck = drawn.remaining;
    nextPhase = "flop";
  } else if (state.phase === "flop") {
    const drawn = deal(deck, 1);
    newCommunity = [...state.community, ...drawn.drawn];
    deck = drawn.remaining;
    nextPhase = "turn";
  } else if (state.phase === "turn") {
    const drawn = deal(deck, 1);
    newCommunity = [...state.community, ...drawn.drawn];
    deck = drawn.remaining;
    nextPhase = "river";
  } else {
    nextPhase = "showdown";
  }

  if (nextPhase === "showdown") {
    return resolveShowdown({ ...state, rngSeed: nextSeed });
  }

  // Non-dealer acts first post-flop
  const playerTurn = state.dealerSeat === 1; // if bot is dealer, player acts first

  return {
    ...state,
    rngSeed: nextSeed,
    phase: nextPhase,
    deck,
    community: newCommunity,
    playerBet: 0,
    botBet: 0,
    currentStreetBets: 0,
    playerTurn,
    lastAction: `--- ${nextPhase} ---`,
  };
}

function resolveShowdown(state: TexasHoldemState): TexasHoldemState {
  const playerCards = [...state.playerHole, ...state.community];
  const botCards = [...state.botHole, ...state.community];
  const playerBest = bestFiveOf(playerCards);
  const botBest = bestFiveOf(botCards);
  const cmp = compareHands(playerBest, botBest);
  let bankroll = state.bankroll;
  let botBankroll = state.botBankroll;
  let lastResult: string;

  if (cmp > 0) {
    bankroll += state.pot;
    lastResult = `Player wins pot $${state.pot}! (${rankHand(playerBest).class})`;
  } else if (cmp < 0) {
    botBankroll += state.pot;
    lastResult = `Bot wins pot $${state.pot}. (${rankHand(botBest).class})`;
  } else {
    const half = Math.floor(state.pot / 2);
    bankroll += half;
    botBankroll += state.pot - half;
    lastResult = `Split pot!`;
  }

  return {
    ...state,
    phase: "showdown",
    bankroll,
    botBankroll,
    lastResult,
  };
}

function botTakeTurn(state: TexasHoldemState): TexasHoldemState {
  const { rng, nextSeed } = advanceSeed(state.rngSeed);
  const { big } = parseBlinds(state.settings.blinds);
  const betAmt = limitBet(state.phase, big);
  const toCall = state.playerBet - state.botBet;

  const action = botDecide(state.botHole, state.community, toCall, state.pot, betAmt, rng);

  let newState = { ...state, rngSeed: nextSeed, playerTurn: true };

  if (action === "fold") {
    // Player wins
    return {
      ...newState,
      phase: "showdown",
      bankroll: state.bankroll + state.pot,
      lastResult: `Bot folds. Player wins $${state.pot}!`,
      lastAction: "Bot: Fold",
    };
  } else if (action === "check") {
    newState = { ...newState, lastAction: "Bot: Check" };
    // Both checked: advance street
    return advanceStreet(newState);
  } else if (action === "call") {
    const callAmt = Math.min(toCall, state.botBankroll);
    newState = {
      ...newState,
      botBet: state.botBet + callAmt,
      botBankroll: state.botBankroll - callAmt,
      pot: state.pot + callAmt,
      lastAction: `Bot: Call $${callAmt}`,
    };
    return advanceStreet(newState);
  } else {
    // raise/bet
    const raiseAmt = Math.min(toCall + betAmt, state.botBankroll);
    newState = {
      ...newState,
      botBet: state.botBet + raiseAmt,
      botBankroll: state.botBankroll - raiseAmt,
      pot: state.pot + raiseAmt,
      lastAction: `Bot: Raise $${raiseAmt}`,
      playerTurn: true, // player must respond
    };
    return newState;
  }
}

export function reducer(state: TexasHoldemState, action: TexasHoldemAction): TexasHoldemState {
  switch (action.type) {
    case "deal": {
      if (state.phase !== "waiting" && state.phase !== "showdown") return state;
      if (state.bankroll <= 0 || state.botBankroll <= 0) return state;
      let s = dealNewHand(state);
      // If bot goes first pre-flop (player is not dealer), let bot act
      if (!s.playerTurn) {
        s = botTakeTurn(s);
      }
      return s;
    }

    case "fold": {
      if (!state.playerTurn || state.phase === "waiting" || state.phase === "showdown") return state;
      return {
        ...state,
        phase: "showdown",
        botBankroll: state.botBankroll + state.pot,
        lastResult: `Player folds. Bot wins $${state.pot}.`,
        lastAction: "Player: Fold",
      };
    }

    case "check": {
      if (!state.playerTurn || state.phase === "waiting" || state.phase === "showdown") return state;
      const toCall = state.botBet - state.playerBet;
      if (toCall > 0) return state; // can't check if there's a bet to call
      const s = { ...state, lastAction: "Player: Check", playerTurn: false };
      return botTakeTurn(s);
    }

    case "call": {
      if (!state.playerTurn || state.phase === "waiting" || state.phase === "showdown") return state;
      const toCall = state.botBet - state.playerBet;
      if (toCall <= 0) return state;
      const callAmt = Math.min(toCall, state.bankroll);
      const s = {
        ...state,
        playerBet: state.playerBet + callAmt,
        bankroll: state.bankroll - callAmt,
        pot: state.pot + callAmt,
        lastAction: `Player: Call $${callAmt}`,
        playerTurn: false,
      };
      return botTakeTurn(s);
    }

    case "bet":
    case "raise": {
      if (!state.playerTurn || state.phase === "waiting" || state.phase === "showdown") return state;
      const { big } = parseBlinds(state.settings.blinds);
      const betAmt = limitBet(state.phase, big);
      const toCall = state.botBet - state.playerBet;
      const total = toCall + betAmt;
      if (state.bankroll < total) return state;
      const s = {
        ...state,
        playerBet: state.playerBet + total,
        bankroll: state.bankroll - total,
        pot: state.pot + total,
        lastAction: `Player: ${toCall > 0 ? "Raise" : "Bet"} $${total}`,
        playerTurn: false,
      };
      return botTakeTurn(s);
    }

    default:
      return state;
  }
}

export function isTerminal(state: TexasHoldemState): { score: number } | null {
  if (state.phase === "showdown" && (state.bankroll <= 0 || state.botBankroll <= 0)) {
    return { score: state.bankroll };
  }
  return null;
}
