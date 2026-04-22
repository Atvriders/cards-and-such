import type { Card } from "../../engines/deck/index.js";
import { newDeck, shuffle, deal } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { rankHand } from "../../engines/deck/ranking.js";
import type { HandClass } from "../../engines/deck/ranking.js";

export interface OmahaSettings {
  startingBankroll: "500" | "1000" | "5000";
  blinds: "2/4" | "5/10" | "10/20";
}

export type OmahaPhase = "waiting" | "pre-flop" | "flop" | "turn" | "river" | "showdown";

export interface OmahaState {
  settings: OmahaSettings;
  rngSeed: number;
  bankroll: number;
  botBankroll: number;
  handsPlayed: number;
  phase: OmahaPhase;
  deck: Card[];
  playerHole: Card[]; // 4 cards
  botHole: Card[]; // 4 cards
  community: Card[]; // up to 5
  pot: number;
  playerBet: number;
  botBet: number;
  dealerSeat: 0 | 1;
  playerTurn: boolean;
  lastAction: string;
  lastResult: string;
}

export type OmahaAction =
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

function compareHandArr(a: Card[], b: Card[]): number {
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

/** Omaha: MUST use exactly 2 hole cards + exactly 3 community cards */
export function bestOmahaHand(hole: Card[], community: Card[]): Card[] {
  if (community.length < 3) return hole.slice(0, 5);
  let best: Card[] | null = null;

  // Pick 2 from 4 hole cards
  for (let h1 = 0; h1 < hole.length - 1; h1++) {
    for (let h2 = h1 + 1; h2 < hole.length; h2++) {
      // Pick 3 from 5 community cards
      for (let c1 = 0; c1 < community.length - 2; c1++) {
        for (let c2 = c1 + 1; c2 < community.length - 1; c2++) {
          for (let c3 = c2 + 1; c3 < community.length; c3++) {
            const five = [hole[h1]!, hole[h2]!, community[c1]!, community[c2]!, community[c3]!];
            if (!best || compareHandArr(five, best) > 0) best = five;
          }
        }
      }
    }
  }
  return best ?? hole.slice(0, 5);
}

function advanceSeed(seed: number): { rng: () => number; nextSeed: number } {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return { rng: mulberry32(seed), nextSeed };
}

function parseBlinds(blinds: string): { small: number; big: number } {
  const [s, b] = blinds.split("/").map(Number);
  return { small: s!, big: b! };
}

function limitBet(phase: OmahaPhase, big: number): number {
  return phase === "turn" || phase === "river" ? big * 2 : big;
}

function botStrength(botHole: Card[], community: Card[]): number {
  if (community.length < 3) return -1;
  const best = bestOmahaHand(botHole, community);
  return CLASS_ORDER.indexOf(rankHand(best).class);
}

function botDecide(
  botHole: Card[],
  community: Card[],
  toCall: number,
  pot: number,
  betAmount: number,
  rng: () => number
): "check" | "call" | "raise" | "fold" {
  const strength = botStrength(botHole, community);

  if (toCall === 0) {
    if (strength >= 4 || (strength >= 2 && rng() > 0.4)) return "raise";
    return "check";
  }

  const equity = strength >= 0 ? (strength + 1) / 9 : 0.25;
  const odds = toCall / (pot + toCall);
  if (equity > odds + 0.1 && strength >= 3) return "raise";
  if (equity > odds) return "call";
  if (rng() > 0.7) return "call";
  return "fold";
}

export function initialState(seed: number, settings: OmahaSettings): OmahaState {
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
    playerTurn: true,
    lastAction: "",
    lastResult: "",
  };
}

function dealNewHand(state: OmahaState): OmahaState {
  const { rng, nextSeed } = advanceSeed(state.rngSeed);
  const deck = shuffle(newDeck(1), rng);
  const { small, big } = parseBlinds(state.settings.blinds);
  const dealerSeat = state.handsPlayed % 2 === 0 ? (0 as const) : (1 as const);
  const playerBlind = dealerSeat === 0 ? small : big;
  const botBlind = dealerSeat === 0 ? big : small;

  const d1 = deal(deck, 8); // 4 for player, 4 for bot
  const playerHole = d1.drawn.slice(0, 4);
  const botHole = d1.drawn.slice(4, 8);
  const playerTurn = dealerSeat === 0;

  return {
    ...state,
    rngSeed: nextSeed,
    bankroll: state.bankroll - playerBlind,
    botBankroll: state.botBankroll - botBlind,
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
    playerTurn,
    lastAction: `Blinds: Player $${playerBlind}, Bot $${botBlind}`,
    lastResult: "",
  };
}

function resolveShowdown(state: OmahaState): OmahaState {
  const playerBest = bestOmahaHand(state.playerHole, state.community);
  const botBest = bestOmahaHand(state.botHole, state.community);
  const cmp = compareHandArr(playerBest, botBest);
  let bankroll = state.bankroll;
  let botBankroll = state.botBankroll;
  let lastResult: string;

  if (cmp > 0) {
    bankroll += state.pot;
    lastResult = `Player wins $${state.pot}! (${rankHand(playerBest).class})`;
  } else if (cmp < 0) {
    botBankroll += state.pot;
    lastResult = `Bot wins $${state.pot}. (${rankHand(botBest).class})`;
  } else {
    const half = Math.floor(state.pot / 2);
    bankroll += half;
    botBankroll += state.pot - half;
    lastResult = "Split pot!";
  }

  return { ...state, phase: "showdown", bankroll, botBankroll, lastResult };
}

function advanceStreet(state: OmahaState): OmahaState {
  const { rng, nextSeed } = advanceSeed(state.rngSeed);
  let nextPhase: OmahaPhase;
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
    return resolveShowdown({ ...state, rngSeed: nextSeed, community: newCommunity });
  }

  const playerTurn = state.dealerSeat === 1;
  return {
    ...state,
    rngSeed: nextSeed,
    phase: nextPhase,
    deck,
    community: newCommunity,
    playerBet: 0,
    botBet: 0,
    playerTurn,
    lastAction: `--- ${nextPhase} ---`,
  };
}

function botTakeTurn(state: OmahaState): OmahaState {
  const { rng, nextSeed } = advanceSeed(state.rngSeed);
  const { big } = parseBlinds(state.settings.blinds);
  const betAmt = limitBet(state.phase, big);
  const toCall = state.playerBet - state.botBet;

  const action = botDecide(state.botHole, state.community, toCall, state.pot, betAmt, rng);
  let newState = { ...state, rngSeed: nextSeed, playerTurn: true };

  if (action === "fold") {
    return {
      ...newState,
      phase: "showdown",
      bankroll: state.bankroll + state.pot,
      lastResult: `Bot folds. Player wins $${state.pot}!`,
      lastAction: "Bot: Fold",
    };
  } else if (action === "check") {
    return advanceStreet({ ...newState, lastAction: "Bot: Check" });
  } else if (action === "call") {
    const callAmt = Math.min(toCall, state.botBankroll);
    return advanceStreet({
      ...newState,
      botBet: state.botBet + callAmt,
      botBankroll: state.botBankroll - callAmt,
      pot: state.pot + callAmt,
      lastAction: `Bot: Call $${callAmt}`,
    });
  } else {
    const raiseAmt = Math.min(toCall + betAmt, state.botBankroll);
    return {
      ...newState,
      botBet: state.botBet + raiseAmt,
      botBankroll: state.botBankroll - raiseAmt,
      pot: state.pot + raiseAmt,
      lastAction: `Bot: Raise $${raiseAmt}`,
      playerTurn: true,
    };
  }
}

export function reducer(state: OmahaState, action: OmahaAction): OmahaState {
  switch (action.type) {
    case "deal": {
      if (state.phase !== "waiting" && state.phase !== "showdown") return state;
      if (state.bankroll <= 0 || state.botBankroll <= 0) return state;
      let s = dealNewHand(state);
      if (!s.playerTurn) s = botTakeTurn(s);
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
      if (state.botBet - state.playerBet > 0) return state;
      return botTakeTurn({ ...state, lastAction: "Player: Check", playerTurn: false });
    }
    case "call": {
      if (!state.playerTurn || state.phase === "waiting" || state.phase === "showdown") return state;
      const toCall = state.botBet - state.playerBet;
      if (toCall <= 0) return state;
      const callAmt = Math.min(toCall, state.bankroll);
      return botTakeTurn({
        ...state,
        playerBet: state.playerBet + callAmt,
        bankroll: state.bankroll - callAmt,
        pot: state.pot + callAmt,
        lastAction: `Player: Call $${callAmt}`,
        playerTurn: false,
      });
    }
    case "bet":
    case "raise": {
      if (!state.playerTurn || state.phase === "waiting" || state.phase === "showdown") return state;
      const { big } = parseBlinds(state.settings.blinds);
      const betAmt = limitBet(state.phase, big);
      const toCall = state.botBet - state.playerBet;
      const total = toCall + betAmt;
      if (state.bankroll < total) return state;
      return botTakeTurn({
        ...state,
        playerBet: state.playerBet + total,
        bankroll: state.bankroll - total,
        pot: state.pot + total,
        lastAction: `Player: ${toCall > 0 ? "Raise" : "Bet"} $${total}`,
        playerTurn: false,
      });
    }
    default:
      return state;
  }
}

export function isTerminal(state: OmahaState): { score: number } | null {
  if (state.phase === "showdown" && (state.bankroll <= 0 || state.botBankroll <= 0)) {
    return { score: state.bankroll };
  }
  return null;
}
