import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { newDeck, shuffle, type Card } from "../../engines/deck/index.js";

export const STARTING_BANKROLL = 100;
export const MIN_BET = 5;

export interface MiniBlackjackSettings { dummy: boolean; }

export type Phase = "betting" | "player" | "dealer" | "settle" | "done";

export interface MiniBlackjackState {
  rngSeed: number;
  deck: Card[];
  player: Card[];
  dealer: Card[];
  bet: number;
  bankroll: number;
  hand: number;          // hand number played
  phase: Phase;
  result: string;
  log: string[];
  dealerHoleHidden: boolean;
}

export type MiniBlackjackAction =
  | { type: "deal"; bet: number }
  | { type: "hit" }
  | { type: "stand" }
  | { type: "double" }
  | { type: "next" };

export function bjValue(card: Card): number {
  if (card.rank === 1) return 11;
  if (card.rank >= 10) return 10;
  return card.rank;
}

export function handTotal(hand: Card[]): number {
  let total = 0;
  let aces = 0;
  for (const c of hand) {
    total += bjValue(c);
    if (c.rank === 1) aces++;
  }
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  return total;
}

export function isBust(hand: Card[]): boolean { return handTotal(hand) > 21; }

export function isBlackjack(hand: Card[]): boolean {
  return hand.length === 2 && handTotal(hand) === 21;
}

function freshDeck(seed: number): { deck: Card[]; nextSeed: number } {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(1), rng);
  return { deck, nextSeed: Math.floor(rng() * 2 ** 31) };
}

function pushLog(log: string[], msg: string): string[] {
  const out = [...log, msg];
  if (out.length > 50) out.shift();
  return out;
}

export function initialState(seed: number, _s: MiniBlackjackSettings): MiniBlackjackState {
  const { deck, nextSeed } = freshDeck(seed);
  return {
    rngSeed: nextSeed,
    deck,
    player: [],
    dealer: [],
    bet: 0,
    bankroll: STARTING_BANKROLL,
    hand: 0,
    phase: "betting",
    result: "",
    log: [`Welcome — bankroll $${STARTING_BANKROLL}. Place a bet.`],
    dealerHoleHidden: true,
  };
}

function settle(state: MiniBlackjackState): MiniBlackjackState {
  const pTotal = handTotal(state.player);
  const dTotal = handTotal(state.dealer);
  let payout = 0;
  let result: string;
  const playerBJ = isBlackjack(state.player);
  const dealerBJ = isBlackjack(state.dealer);
  if (isBust(state.player)) { result = `Bust — lose $${state.bet}`; payout = -state.bet; }
  else if (playerBJ && !dealerBJ) { result = `Blackjack! Win $${Math.floor(state.bet * 1.5)}`; payout = Math.floor(state.bet * 1.5); }
  else if (dealerBJ && !playerBJ) { result = `Dealer blackjack — lose $${state.bet}`; payout = -state.bet; }
  else if (isBust(state.dealer)) { result = `Dealer busts! Win $${state.bet}`; payout = state.bet; }
  else if (pTotal > dTotal) { result = `You win $${state.bet}`; payout = state.bet; }
  else if (pTotal < dTotal) { result = `Dealer wins $${state.bet}`; payout = -state.bet; }
  else { result = "Push"; payout = 0; }
  const bankroll = state.bankroll + payout;
  const log = pushLog(state.log, `Hand ${state.hand}: you ${pTotal}, dealer ${dTotal} — ${result}`);
  const phase: Phase = bankroll < MIN_BET ? "done" : "settle";
  return { ...state, bankroll, result, log, phase, dealerHoleHidden: false };
}

function dealerPlay(state: MiniBlackjackState): MiniBlackjackState {
  let deck = [...state.deck];
  let dealer = [...state.dealer];
  while (handTotal(dealer) < 17) {
    if (deck.length === 0) break;
    dealer = [...dealer, deck[0]!];
    deck = deck.slice(1);
  }
  return { ...state, deck, dealer, dealerHoleHidden: false };
}

export function reducer(state: MiniBlackjackState, action: MiniBlackjackAction): MiniBlackjackState {
  if (state.phase === "done") return state;

  if (action.type === "deal") {
    if (state.phase !== "betting" && state.phase !== "settle") return state;
    const bet = Math.max(MIN_BET, Math.min(action.bet, state.bankroll));
    let deck = state.deck;
    let nextSeed = state.rngSeed;
    if (deck.length < 15) {
      const f = freshDeck(state.rngSeed);
      deck = f.deck;
      nextSeed = f.nextSeed;
    }
    const player = [deck[0]!, deck[2]!];
    const dealer = [deck[1]!, deck[3]!];
    deck = deck.slice(4);
    const hand = state.hand + 1;
    const log = pushLog(state.log, `--- Hand ${hand}: bet $${bet} ---`);
    let newState: MiniBlackjackState = {
      ...state,
      rngSeed: nextSeed,
      deck,
      player,
      dealer,
      bet,
      hand,
      phase: "player",
      result: "",
      dealerHoleHidden: true,
      log,
    };
    // immediate blackjack check
    if (isBlackjack(player) || isBlackjack(dealer)) {
      newState = { ...newState, phase: "dealer", dealerHoleHidden: false };
      return settle(newState);
    }
    return newState;
  }

  if (action.type === "hit") {
    if (state.phase !== "player") return state;
    const card = state.deck[0]!;
    const player = [...state.player, card];
    const next: MiniBlackjackState = { ...state, deck: state.deck.slice(1), player };
    if (isBust(player)) {
      return settle({ ...next, dealerHoleHidden: false });
    }
    if (handTotal(player) === 21) {
      // auto-stand
      const dealt = dealerPlay({ ...next, phase: "dealer" });
      return settle(dealt);
    }
    return next;
  }

  if (action.type === "stand") {
    if (state.phase !== "player") return state;
    const dealt = dealerPlay({ ...state, phase: "dealer", dealerHoleHidden: false });
    return settle(dealt);
  }

  if (action.type === "double") {
    if (state.phase !== "player") return state;
    if (state.player.length !== 2) return state;
    if (state.bankroll < state.bet) return state;
    const card = state.deck[0]!;
    const player = [...state.player, card];
    const ns: MiniBlackjackState = { ...state, deck: state.deck.slice(1), player, bet: state.bet * 2 };
    if (isBust(player)) {
      return settle({ ...ns, dealerHoleHidden: false });
    }
    const dealt = dealerPlay({ ...ns, phase: "dealer", dealerHoleHidden: false });
    return settle(dealt);
  }

  if (action.type === "next") {
    if (state.phase !== "settle") return state;
    if (state.bankroll < MIN_BET) {
      return { ...state, phase: "done", log: pushLog(state.log, "Bankroll too low — game over.") };
    }
    return { ...state, phase: "betting", player: [], dealer: [], bet: 0, result: "" };
  }

  return state;
}

export function isTerminal(state: MiniBlackjackState): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: state.bankroll };
}
