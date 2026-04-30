import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { newDeck, shuffle, type Card } from "../../engines/deck/index.js";

export const HAND_SIZE = 5;

export interface MiniSpitSettings { dummy: boolean; }

export type Phase = "ready" | "playing" | "stalemate" | "done";

export interface MiniSpitState {
  rngSeed: number;
  playerStock: Card[];
  cpuStock: Card[];
  playerHand: Card[];   // 5 cards
  cpuHand: Card[];
  centerLeft: Card[];   // top is last
  centerRight: Card[];
  phase: Phase;
  log: string[];
  winner: "" | "player" | "cpu" | "tie";
  ticks: number;        // counts CPU action ticks
}

export type MiniSpitAction =
  | { type: "spit" }                         // initial flip both center piles
  | { type: "play"; cardId: string; pile: "left" | "right" }
  | { type: "cpuTick" }                      // CPU plays one move
  | { type: "knockSlap" }                    // when stalemate reached, knock to flip new spit cards
  | { type: "refillHand" };                  // auto-fill empty slot from stock

/** rank distance considering wrap-around (A wraps to K). Returns true if rank diff is 1 wrapping. */
export function adjacent(a: Card, b: Card): boolean {
  const ra = a.rank;
  const rb = b.rank;
  const diff = Math.abs(ra - rb);
  return diff === 1 || diff === 12; // 12 = K to A wrap (rank 13 to 1)
}

function appendLog(log: string[], msg: string): string[] {
  const out = [...log, msg];
  if (out.length > 40) out.shift();
  return out;
}

export function initialState(seed: number, _s: MiniSpitSettings): MiniSpitState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(1), rng);
  // Each player gets 26 cards. From those, top 5 form the "hand", rest is stock.
  const half1 = deck.slice(0, 26);
  const half2 = deck.slice(26, 52);
  const playerHand = half1.slice(0, HAND_SIZE);
  const playerStock = half1.slice(HAND_SIZE);
  const cpuHand = half2.slice(0, HAND_SIZE);
  const cpuStock = half2.slice(HAND_SIZE);
  return {
    rngSeed: Math.floor(rng() * 2 ** 31),
    playerStock,
    cpuStock,
    playerHand,
    cpuHand,
    centerLeft: [],
    centerRight: [],
    phase: "ready",
    log: ["Click Spit to flip the two center cards and start playing."],
    winner: "",
    ticks: 0,
  };
}

function topOf(pile: Card[]): Card | undefined { return pile[pile.length - 1]; }

function bothEmpty(state: MiniSpitState): boolean {
  return state.playerHand.length === 0 && state.cpuHand.length === 0;
}

function checkVictory(state: MiniSpitState): MiniSpitState {
  // Player wins by emptying hand AND stock
  if (state.playerHand.length === 0 && state.playerStock.length === 0) {
    return { ...state, phase: "done", winner: "player", log: appendLog(state.log, "You emptied everything — you win!") };
  }
  if (state.cpuHand.length === 0 && state.cpuStock.length === 0) {
    return { ...state, phase: "done", winner: "cpu", log: appendLog(state.log, "CPU emptied — CPU wins.") };
  }
  return state;
}

function refillFromStock(hand: Card[], stock: Card[]): { hand: Card[]; stock: Card[] } {
  if (hand.length >= HAND_SIZE || stock.length === 0) return { hand, stock };
  const needed = Math.min(HAND_SIZE - hand.length, stock.length);
  const drawn = stock.slice(0, needed);
  return { hand: [...hand, ...drawn], stock: stock.slice(needed) };
}

function anyPlayable(hand: Card[], left: Card | undefined, right: Card | undefined): boolean {
  for (const c of hand) {
    if (left && adjacent(c, left)) return true;
    if (right && adjacent(c, right)) return true;
  }
  return false;
}

export function reducer(state: MiniSpitState, action: MiniSpitAction): MiniSpitState {
  if (state.phase === "done") return state;

  if (action.type === "spit") {
    if (state.phase !== "ready" && state.phase !== "stalemate") return state;
    if (state.playerStock.length === 0 && state.cpuStock.length === 0) {
      // both stocks empty — whoever has fewer cards in hand wins
      if (state.playerHand.length < state.cpuHand.length) return { ...state, phase: "done", winner: "player" };
      if (state.cpuHand.length < state.playerHand.length) return { ...state, phase: "done", winner: "cpu" };
      return { ...state, phase: "done", winner: "tie" };
    }
    const lTop = state.playerStock.length > 0 ? state.playerStock[0]! : null;
    const rTop = state.cpuStock.length > 0 ? state.cpuStock[0]! : null;
    let centerLeft = state.centerLeft;
    let centerRight = state.centerRight;
    let playerStock = state.playerStock;
    let cpuStock = state.cpuStock;
    if (lTop) { centerLeft = [...centerLeft, lTop]; playerStock = playerStock.slice(1); }
    if (rTop) { centerRight = [...centerRight, rTop]; cpuStock = cpuStock.slice(1); }
    return {
      ...state,
      centerLeft,
      centerRight,
      playerStock,
      cpuStock,
      phase: "playing",
      log: appendLog(state.log, "Spit! Both centers flipped."),
    };
  }

  if (action.type === "play") {
    if (state.phase !== "playing") return state;
    const card = state.playerHand.find((c) => c.id === action.cardId);
    if (!card) return state;
    const target = action.pile === "left" ? state.centerLeft : state.centerRight;
    const top = topOf(target);
    if (!top || !adjacent(card, top)) return state;
    const newHand = state.playerHand.filter((c) => c.id !== action.cardId);
    let centerLeft = state.centerLeft;
    let centerRight = state.centerRight;
    if (action.pile === "left") centerLeft = [...centerLeft, card];
    else centerRight = [...centerRight, card];
    let next: MiniSpitState = { ...state, playerHand: newHand, centerLeft, centerRight };
    // refill from stock to keep 5
    const refill = refillFromStock(next.playerHand, next.playerStock);
    next = { ...next, playerHand: refill.hand, playerStock: refill.stock };
    next = appendLogState(next, `You played ${card.suit}${card.rank}.`);
    next = checkVictory(next);
    if (next.phase === "done") return next;
    // Check stalemate
    next = checkStalemate(next);
    return next;
  }

  if (action.type === "cpuTick") {
    if (state.phase !== "playing") return state;
    return cpuMove(state);
  }

  if (action.type === "knockSlap") {
    if (state.phase !== "stalemate") return state;
    // Flip new spit cards
    if (state.playerStock.length === 0 && state.cpuStock.length === 0) {
      if (bothEmpty(state)) return { ...state, phase: "done", winner: "tie" };
      const winner = state.playerHand.length < state.cpuHand.length ? "player" : state.cpuHand.length < state.playerHand.length ? "cpu" : "tie";
      return { ...state, phase: "done", winner, log: appendLog(state.log, "Stocks empty — settle by hand sizes.") };
    }
    return reducer(state, { type: "spit" });
  }

  if (action.type === "refillHand") {
    const r = refillFromStock(state.playerHand, state.playerStock);
    return { ...state, playerHand: r.hand, playerStock: r.stock };
  }

  return state;
}

function appendLogState(state: MiniSpitState, msg: string): MiniSpitState {
  return { ...state, log: appendLog(state.log, msg) };
}

function cpuMove(state: MiniSpitState): MiniSpitState {
  const left = topOf(state.centerLeft);
  const right = topOf(state.centerRight);
  // pick first playable card
  for (const c of state.cpuHand) {
    if (left && adjacent(c, left)) {
      const newHand = state.cpuHand.filter((x) => x.id !== c.id);
      let next: MiniSpitState = { ...state, cpuHand: newHand, centerLeft: [...state.centerLeft, c] };
      const refill = refillFromStock(next.cpuHand, next.cpuStock);
      next = { ...next, cpuHand: refill.hand, cpuStock: refill.stock, ticks: state.ticks + 1 };
      next = appendLogState(next, `CPU played ${c.suit}${c.rank}.`);
      next = checkVictory(next);
      if (next.phase === "done") return next;
      next = checkStalemate(next);
      return next;
    }
    if (right && adjacent(c, right)) {
      const newHand = state.cpuHand.filter((x) => x.id !== c.id);
      let next: MiniSpitState = { ...state, cpuHand: newHand, centerRight: [...state.centerRight, c] };
      const refill = refillFromStock(next.cpuHand, next.cpuStock);
      next = { ...next, cpuHand: refill.hand, cpuStock: refill.stock, ticks: state.ticks + 1 };
      next = appendLogState(next, `CPU played ${c.suit}${c.rank}.`);
      next = checkVictory(next);
      if (next.phase === "done") return next;
      next = checkStalemate(next);
      return next;
    }
  }
  return { ...state, ticks: state.ticks + 1 };
}

function checkStalemate(state: MiniSpitState): MiniSpitState {
  const left = topOf(state.centerLeft);
  const right = topOf(state.centerRight);
  const pAny = anyPlayable(state.playerHand, left, right);
  const cAny = anyPlayable(state.cpuHand, left, right);
  if (!pAny && !cAny) {
    if (bothEmpty(state)) return { ...state, phase: "done", winner: "tie" };
    return { ...state, phase: "stalemate", log: appendLog(state.log, "Stalemate — knock to flip new spit cards.") };
  }
  return state;
}

export function isTerminal(state: MiniSpitState): { score: number } | null {
  if (state.phase !== "done") return null;
  if (state.winner === "player") return { score: 100 + state.playerStock.length * 2 };
  if (state.winner === "tie") return { score: 50 };
  return { score: Math.max(0, 30 - state.playerHand.length * 2 - state.playerStock.length) };
}
