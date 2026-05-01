import type { Card } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { bestOmaha, compareHands, handStrength, cpuChoice } from "../_shared/poker.js";
import type { RankedHand } from "../_shared/poker.js";

export interface OmahaHiSettings {
  startingBankroll: "500" | "1000" | "5000";
  smallBlind: "5" | "10" | "25";
}

export type OmahaPhase = "preflop" | "flop" | "turn" | "river" | "showdown" | "done";

export interface OmahaSeat {
  hole: Card[];
  bet: number;
  stack: number;
  folded: boolean;
  acted: boolean;
}

export interface OmahaHiState {
  settings: OmahaHiSettings;
  rngSeed: number;
  deck: Card[];
  community: Card[];
  player: OmahaSeat;
  cpu: OmahaSeat;
  pot: number;
  toAct: "player" | "cpu";
  phase: OmahaPhase;
  message: string;
  handsPlayed: number;
  showdownReveal: boolean;
}

export type OmahaHiAction =
  | { type: "deal" }
  | { type: "fold" }
  | { type: "check" }
  | { type: "call" }
  | { type: "raise"; amount: number };

export const TOTAL_HANDS = 8;

function emptySeat(stack: number): OmahaSeat {
  return { hole: [], bet: 0, stack, folded: false, acted: false };
}

export function initialState(seed: number, settings: OmahaHiSettings): OmahaHiState {
  const stack = parseInt(settings.startingBankroll, 10);
  return {
    settings,
    rngSeed: seed >>> 0,
    deck: [],
    community: [],
    player: emptySeat(stack),
    cpu: emptySeat(stack),
    pot: 0,
    toAct: "player",
    phase: "preflop",
    message: "Click Deal to start the hand.",
    handsPlayed: 0,
    showdownReveal: false,
  };
}

function nextRng(state: { rngSeed: number }): { rng: () => number; seed: number } {
  const r1 = mulberry32(state.rngSeed);
  const seed = Math.floor(r1() * 2 ** 31);
  return { rng: mulberry32(state.rngSeed), seed };
}

function dealHand(state: OmahaHiState): OmahaHiState {
  const sb = parseInt(state.settings.smallBlind, 10);
  const bb = sb * 2;
  const { rng, seed } = nextRng(state);
  const deck = shuffle(newDeck(1), rng);
  const player = emptySeat(state.player.stack);
  const cpu = emptySeat(state.cpu.stack);
  player.hole = deck.slice(0, 4);
  cpu.hole = deck.slice(4, 8);
  player.bet = sb; player.stack -= sb;
  cpu.bet = bb; cpu.stack -= bb;
  return {
    ...state,
    rngSeed: seed,
    deck: deck.slice(8),
    community: [],
    player, cpu,
    pot: sb + bb,
    toAct: "player",
    phase: "preflop",
    message: `New hand. Blinds ${sb}/${bb}.`,
    showdownReveal: false,
  };
}

function endHand(state: OmahaHiState, winner: "player" | "cpu" | "split", message: string): OmahaHiState {
  let player = { ...state.player };
  let cpu = { ...state.cpu };
  if (winner === "player") player = { ...player, stack: player.stack + state.pot };
  else if (winner === "cpu") cpu = { ...cpu, stack: cpu.stack + state.pot };
  else {
    const half = Math.floor(state.pot / 2);
    player = { ...player, stack: player.stack + half };
    cpu = { ...cpu, stack: cpu.stack + (state.pot - half) };
  }
  const handsPlayed = state.handsPlayed + 1;
  const done = handsPlayed >= TOTAL_HANDS || player.stack <= 0 || cpu.stack <= 0;
  return {
    ...state,
    player, cpu,
    pot: 0,
    phase: done ? "done" : "showdown",
    message,
    handsPlayed,
    showdownReveal: true,
  };
}

function showdown(state: OmahaHiState): OmahaHiState {
  if (state.player.folded) return endHand(state, "cpu", `You folded. CPU wins ${state.pot}.`);
  if (state.cpu.folded) return endHand(state, "player", `CPU folded. You win ${state.pot}.`);
  const ph = bestOmaha(state.player.hole, state.community);
  const ch = bestOmaha(state.cpu.hole, state.community);
  const cmp = compareHands(ph, ch);
  if (cmp > 0) return endHand(state, "player", `You win ${state.pot} with ${ph.class}.`);
  if (cmp < 0) return endHand(state, "cpu", `CPU wins ${state.pot} with ${ch.class}.`);
  return endHand(state, "split", `Split — both have ${ph.class}.`);
}

function streetComplete(state: OmahaHiState): boolean {
  if (state.player.folded || state.cpu.folded) return true;
  return state.player.acted && state.cpu.acted && state.player.bet === state.cpu.bet;
}

function nextStreet(state: OmahaHiState): OmahaHiState {
  if (state.phase === "river") return showdown(state);
  let community = state.community;
  let deck = state.deck;
  let phase: OmahaPhase = state.phase;
  if (state.phase === "preflop") { community = deck.slice(0, 3); deck = deck.slice(3); phase = "flop"; }
  else if (state.phase === "flop") { community = [...community, deck[0]!]; deck = deck.slice(1); phase = "turn"; }
  else if (state.phase === "turn") { community = [...community, deck[0]!]; deck = deck.slice(1); phase = "river"; }
  return {
    ...state,
    deck, community, phase,
    player: { ...state.player, bet: 0, acted: false },
    cpu: { ...state.cpu, bet: 0, acted: false },
    toAct: "player",
    message: `${phase[0]!.toUpperCase()}${phase.slice(1)} dealt.`,
  };
}

function preflopOmahaStrength(hole: Card[]): number {
  const ranks = hole.map((c) => (c.rank === 1 ? 14 : c.rank)).sort((a, b) => b - a);
  let s = 0.2;
  const high = ranks[0]!;
  s += (high - 2) / 30;
  const counts = new Map<number, number>();
  for (const r of ranks) counts.set(r, (counts.get(r) ?? 0) + 1);
  for (const c of counts.values()) if (c >= 2) s += 0.12;
  const suits = new Set(hole.map((c) => c.suit));
  if (suits.size <= 2) s += 0.06;
  return Math.min(0.95, s);
}

function cpuStrength(state: OmahaHiState): number {
  if (state.community.length === 0) return preflopOmahaStrength(state.cpu.hole);
  return handStrength(bestOmaha(state.cpu.hole, state.community));
}

function cpuTurn(state: OmahaHiState): OmahaHiState {
  const sb = parseInt(state.settings.smallBlind, 10);
  const toCall = state.player.bet - state.cpu.bet;
  const choice = cpuChoice(cpuStrength(state), toCall, state.cpu.stack, state.pot);
  if (choice === "fold") {
    return showdown({ ...state, cpu: { ...state.cpu, folded: true } });
  }
  if (choice === "call") {
    const pay = Math.min(toCall, state.cpu.stack);
    const cpu = { ...state.cpu, stack: state.cpu.stack - pay, bet: state.cpu.bet + pay, acted: true };
    const next = { ...state, cpu, pot: state.pot + pay, message: toCall === 0 ? "CPU checks." : `CPU calls ${pay}.` };
    if (streetComplete(next)) return nextStreet(next);
    return { ...next, toAct: "player" };
  }
  // raise
  const raiseAmt = Math.min(sb * 4, state.cpu.stack - toCall);
  const total = Math.max(toCall + raiseAmt, toCall + sb * 2);
  const pay = Math.min(total, state.cpu.stack);
  const cpu = { ...state.cpu, stack: state.cpu.stack - pay, bet: state.cpu.bet + pay, acted: true };
  // After CPU raises, player must act again
  return {
    ...state,
    cpu,
    pot: state.pot + pay,
    toAct: "player",
    message: `CPU raises to ${cpu.bet}.`,
    player: { ...state.player, acted: false },
  };
}

export function reducer(state: OmahaHiState, action: OmahaHiAction): OmahaHiState {
  if (state.phase === "done") return state;
  if (action.type === "deal") {
    if (state.handsPlayed >= TOTAL_HANDS) return state;
    if (state.phase !== "preflop" && state.phase !== "showdown") return state;
    if (state.phase === "preflop" && state.player.hole.length > 0) return state;
    return dealHand(state);
  }
  if (state.phase === "showdown") return state;
  if (state.toAct !== "player") return state;
  if (state.player.hole.length === 0) return state;
  if (action.type === "fold") {
    return showdown({ ...state, player: { ...state.player, folded: true } });
  }
  if (action.type === "check") {
    if (state.cpu.bet !== state.player.bet) return state;
    const next = { ...state, player: { ...state.player, acted: true }, message: "You check." };
    if (streetComplete(next)) return nextStreet(next);
    return cpuTurn({ ...next, toAct: "cpu" });
  }
  if (action.type === "call") {
    const toCall = state.cpu.bet - state.player.bet;
    if (toCall < 0) return state;
    const pay = Math.min(toCall, state.player.stack);
    const player = { ...state.player, stack: state.player.stack - pay, bet: state.player.bet + pay, acted: true };
    const next: OmahaHiState = { ...state, player, pot: state.pot + pay, message: `You call ${pay}.` };
    if (streetComplete(next)) return nextStreet(next);
    return cpuTurn({ ...next, toAct: "cpu" });
  }
  if (action.type === "raise") {
    const sb = parseInt(state.settings.smallBlind, 10);
    const toCall = Math.max(0, state.cpu.bet - state.player.bet);
    const raise = Math.max(sb * 2, action.amount);
    const total = toCall + raise;
    const pay = Math.min(total, state.player.stack);
    const player = { ...state.player, stack: state.player.stack - pay, bet: state.player.bet + pay, acted: true };
    const next: OmahaHiState = {
      ...state,
      player, pot: state.pot + pay, toAct: "cpu",
      message: `You raise to ${player.bet}.`,
      cpu: { ...state.cpu, acted: false },
    };
    return cpuTurn(next);
  }
  return state;
}

export function isTerminal(state: OmahaHiState): { score: number } | null {
  if (state.phase === "done") return { score: state.player.stack };
  return null;
}

// Re-export helpers for tests/UI
export { bestOmaha };
export type { RankedHand };
