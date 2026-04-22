import type { Card } from "../../engines/deck/index.js";
import { newDeck, shuffle, deal } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { rankHand } from "../../engines/deck/ranking.js";
import type { HandClass } from "../../engines/deck/ranking.js";

export interface SevenCardStudSettings {
  startingBankroll: "500" | "1000" | "5000";
  anteSize: "5" | "10" | "25";
}

/** Streets: 3rd (initial), 4th, 5th, 6th, 7th */
export type StudStreet = 3 | 4 | 5 | 6 | 7;
export type StudPhase = "waiting" | "betting" | "showdown";

export interface StudPlayerState {
  cards: Card[]; // all cards dealt so far (up to 7)
  faceUp: boolean[]; // true = face up
  bet: number;
  bankroll: number;
  folded: boolean;
}

export interface SevenCardStudState {
  settings: SevenCardStudSettings;
  rngSeed: number;
  handsPlayed: number;
  phase: StudPhase;
  street: StudStreet;
  deck: Card[];
  player: StudPlayerState;
  bot: StudPlayerState;
  pot: number;
  playerTurn: boolean;
  lastAction: string;
  lastResult: string;
}

export type StudAction =
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

export function bestFiveOf(cards: Card[]): Card[] {
  if (cards.length <= 5) return cards;
  // Generate all combinations of 5 from n cards
  const combos = getCombinations5(cards);
  let best: Card[] = combos[0]!;
  for (let i = 1; i < combos.length; i++) {
    if (compareHandArr(combos[i]!, best) > 0) best = combos[i]!;
  }
  return best;
}

function getCombinations5(cards: Card[]): Card[][] {
  const n = cards.length;
  const result: Card[][] = [];
  for (let a = 0; a < n - 4; a++)
    for (let b = a + 1; b < n - 3; b++)
      for (let c = b + 1; c < n - 2; c++)
        for (let d = c + 1; d < n - 1; d++)
          for (let e = d + 1; e < n; e++)
            result.push([cards[a]!, cards[b]!, cards[c]!, cards[d]!, cards[e]!]);
  return result;
}

function advanceSeed(seed: number): { rng: () => number; nextSeed: number } {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return { rng: mulberry32(seed), nextSeed };
}

function streetBet(street: StudStreet, ante: number): number {
  return street >= 5 ? ante * 2 : ante;
}

function botDecide(
  botCards: Card[],
  toCall: number,
  pot: number,
  betAmt: number,
  rng: () => number
): "check" | "call" | "raise" | "fold" {
  const best = bestFiveOf(botCards);
  const strength = botCards.length >= 5 ? CLASS_ORDER.indexOf(rankHand(best).class) : -1;

  if (toCall === 0) {
    if (strength >= 4) return "raise";
    if (strength >= 2 && rng() > 0.5) return "raise";
    return "check";
  }

  const equity = (strength + 1) / 9;
  const odds = toCall / (pot + toCall);
  if (equity > odds + 0.1 && strength >= 3) return "raise";
  if (equity > odds) return "call";
  if (rng() > 0.75) return "call";
  return "fold";
}

export function initialState(seed: number, settings: SevenCardStudSettings): SevenCardStudState {
  const { rng, nextSeed } = advanceSeed(seed);
  const deck = shuffle(newDeck(1), rng);
  const bankroll = parseInt(settings.startingBankroll, 10);
  const emptyPlayer: StudPlayerState = { cards: [], faceUp: [], bet: 0, bankroll, folded: false };
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

function dealNewHand(state: SevenCardStudState): SevenCardStudState {
  const { rng, nextSeed } = advanceSeed(state.rngSeed);
  const deck = shuffle(newDeck(1), rng);
  const ante = parseInt(state.settings.anteSize, 10);

  // Deal 3 cards each: 2 down, 1 up
  const d = deal(deck, 6);
  const pCards = d.drawn.slice(0, 3);
  const bCards = d.drawn.slice(3, 6);

  const player: StudPlayerState = {
    cards: pCards,
    faceUp: [false, false, true],
    bet: ante,
    bankroll: state.player.bankroll - ante,
    folded: false,
  };
  const bot: StudPlayerState = {
    cards: bCards,
    faceUp: [false, false, true],
    bet: ante,
    bankroll: state.bot.bankroll - ante,
    folded: false,
  };

  // Player with lowest upcard brings in first
  const pUp = pCards[2]!.rank;
  const bUp = bCards[2]!.rank;
  const playerTurn = pUp <= bUp;

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
    lastAction: `Antes posted. 3rd street.`,
    lastResult: "",
  };
}

function dealNextStreet(state: SevenCardStudState): SevenCardStudState {
  const nextStreet = (state.street + 1) as StudStreet;
  const faceDown = nextStreet === 7;

  const d1 = deal(state.deck, 1);
  const pCard = d1.drawn[0]!;
  const d2 = deal(d1.remaining, 1);
  const bCard = d2.drawn[0]!;

  const player: StudPlayerState = {
    ...state.player,
    cards: [...state.player.cards, pCard],
    faceUp: [...state.player.faceUp, !faceDown],
    bet: 0,
  };
  const bot: StudPlayerState = {
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

function resolveShowdown(state: SevenCardStudState): SevenCardStudState {
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

  const pBest = bestFiveOf(state.player.cards);
  const bBest = bestFiveOf(state.bot.cards);
  const cmp = compareHandArr(pBest, bBest);
  let player = state.player;
  let bot = state.bot;
  let lastResult: string;

  if (cmp > 0) {
    player = { ...player, bankroll: player.bankroll + state.pot };
    lastResult = `Player wins $${state.pot}! (${rankHand(pBest).class})`;
  } else if (cmp < 0) {
    bot = { ...bot, bankroll: bot.bankroll + state.pot };
    lastResult = `Bot wins $${state.pot}. (${rankHand(bBest).class})`;
  } else {
    const half = Math.floor(state.pot / 2);
    player = { ...player, bankroll: player.bankroll + half };
    bot = { ...bot, bankroll: bot.bankroll + state.pot - half };
    lastResult = "Split pot!";
  }

  return { ...state, phase: "showdown", player, bot, lastResult };
}

function botTakeTurn(state: SevenCardStudState): SevenCardStudState {
  const { rng, nextSeed } = advanceSeed(state.rngSeed);
  const ante = parseInt(state.settings.anteSize, 10);
  const betAmt = streetBet(state.street, ante);
  const toCall = state.player.bet - state.bot.bet;

  const action = botDecide(state.bot.cards, toCall, state.pot, betAmt, rng);
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

export function reducer(state: SevenCardStudState, action: StudAction): SevenCardStudState {
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

export function isTerminal(state: SevenCardStudState): { score: number } | null {
  if (state.phase === "showdown" && (state.player.bankroll <= 0 || state.bot.bankroll <= 0)) {
    return { score: state.player.bankroll };
  }
  return null;
}
