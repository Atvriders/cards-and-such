// Generic heads-up community-card poker engine — used by Omaha Hi-Lo, Pineapple, Crazy Pineapple, SDH.
import type { Card } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface PGSeat {
  hole: Card[];
  bet: number;
  stack: number;
  folded: boolean;
  acted: boolean;
  discarded?: Card[];
}

export type PGPhase = "preflop" | "flop" | "turn" | "river" | "showdown" | "done";

export interface PGState<S = unknown> {
  rngSeed: number;
  deck: Card[];
  community: Card[];
  player: PGSeat;
  cpu: PGSeat;
  pot: number;
  toAct: "player" | "cpu";
  phase: PGPhase;
  message: string;
  handsPlayed: number;
  showdownReveal: boolean;
  // game-specific
  pendingDiscard?: boolean; // pineapple etc.
  settings: S;
}

export interface PGConfig<S> {
  totalHands: number;
  startingStack: (s: S) => number;
  smallBlind: (s: S) => number;
  holeCount: number;
  /** Build the deck (e.g. short-deck removes 2-5). */
  buildDeck: () => Card[];
  /** Resolve showdown: returns winner (or split). */
  judge: (player: PGSeat, cpu: PGSeat, community: Card[]) => { winner: "player" | "cpu" | "split"; tag: string };
  /** Strength estimate 0..1 for CPU decision. */
  cpuStrength: (cpu: PGSeat, community: Card[]) => number;
  /** Hook called after the flop is dealt — for crazy pineapple, sets pending discard. */
  onAfterFlop?: (state: PGState<S>) => PGState<S>;
  /** Hook called after preflop deal, before any action — for pineapple (pre-flop discard). */
  onAfterDeal?: (state: PGState<S>) => PGState<S>;
}

export function pgEmptySeat(stack: number): PGSeat {
  return { hole: [], bet: 0, stack, folded: false, acted: false, discarded: [] };
}

export function pgInitialState<S>(seed: number, settings: S, cfg: PGConfig<S>): PGState<S> {
  const stack = cfg.startingStack(settings);
  return {
    rngSeed: seed >>> 0,
    deck: [],
    community: [],
    player: pgEmptySeat(stack),
    cpu: pgEmptySeat(stack),
    pot: 0,
    toAct: "player",
    phase: "preflop",
    message: "Click Deal to start.",
    handsPlayed: 0,
    showdownReveal: false,
    settings,
  };
}

function nextRng(seed: number): { rng: () => number; nextSeed: number } {
  const r = mulberry32(seed);
  const ns = Math.floor(r() * 2 ** 31);
  return { rng: mulberry32(seed), nextSeed: ns };
}

export function pgDeal<S>(state: PGState<S>, cfg: PGConfig<S>): PGState<S> {
  const sb = cfg.smallBlind(state.settings);
  const bb = sb * 2;
  const { rng, nextSeed } = nextRng(state.rngSeed);
  const deck = shuffle(cfg.buildDeck(), rng);
  const player = pgEmptySeat(state.player.stack);
  const cpu = pgEmptySeat(state.cpu.stack);
  player.hole = deck.slice(0, cfg.holeCount);
  cpu.hole = deck.slice(cfg.holeCount, cfg.holeCount * 2);
  player.bet = sb; player.stack -= sb;
  cpu.bet = bb; cpu.stack -= bb;
  let next: PGState<S> = {
    ...state,
    rngSeed: nextSeed,
    deck: deck.slice(cfg.holeCount * 2),
    community: [],
    player, cpu,
    pot: sb + bb,
    toAct: "player",
    phase: "preflop",
    message: `New hand. Blinds ${sb}/${bb}.`,
    showdownReveal: false,
    pendingDiscard: false,
  };
  if (cfg.onAfterDeal) next = cfg.onAfterDeal(next);
  return next;
}

export function pgEndHand<S>(state: PGState<S>, winner: "player" | "cpu" | "split", message: string, totalHands: number): PGState<S> {
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
  const done = handsPlayed >= totalHands || player.stack <= 0 || cpu.stack <= 0;
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

export function pgShowdown<S>(state: PGState<S>, cfg: PGConfig<S>): PGState<S> {
  if (state.player.folded) return pgEndHand(state, "cpu", `You folded. CPU wins ${state.pot}.`, cfg.totalHands);
  if (state.cpu.folded) return pgEndHand(state, "player", `CPU folded. You win ${state.pot}.`, cfg.totalHands);
  const j = cfg.judge(state.player, state.cpu, state.community);
  let msg: string;
  if (j.winner === "player") msg = `You win ${state.pot} (${j.tag}).`;
  else if (j.winner === "cpu") msg = `CPU wins ${state.pot} (${j.tag}).`;
  else msg = `Split — ${j.tag}.`;
  return pgEndHand(state, j.winner, msg, cfg.totalHands);
}

export function pgStreetComplete<S>(state: PGState<S>): boolean {
  if (state.player.folded || state.cpu.folded) return true;
  return state.player.acted && state.cpu.acted && state.player.bet === state.cpu.bet && !state.pendingDiscard;
}

export function pgNextStreet<S>(state: PGState<S>, cfg: PGConfig<S>): PGState<S> {
  if (state.phase === "river") return pgShowdown(state, cfg);
  let community = state.community;
  let deck = state.deck;
  let phase: PGPhase = state.phase;
  if (state.phase === "preflop") { community = deck.slice(0, 3); deck = deck.slice(3); phase = "flop"; }
  else if (state.phase === "flop") { community = [...community, deck[0]!]; deck = deck.slice(1); phase = "turn"; }
  else if (state.phase === "turn") { community = [...community, deck[0]!]; deck = deck.slice(1); phase = "river"; }
  let next: PGState<S> = {
    ...state,
    deck, community, phase,
    player: { ...state.player, bet: 0, acted: false },
    cpu: { ...state.cpu, bet: 0, acted: false },
    toAct: "player",
    message: `${phase[0]!.toUpperCase()}${phase.slice(1)} dealt.`,
  };
  if (phase === "flop" && cfg.onAfterFlop) next = cfg.onAfterFlop(next);
  return next;
}

import { cpuChoice } from "./poker.js";

export function pgCpuTurn<S>(state: PGState<S>, cfg: PGConfig<S>): PGState<S> {
  const sb = cfg.smallBlind(state.settings);
  const toCall = state.player.bet - state.cpu.bet;
  const strength = cfg.cpuStrength(state.cpu, state.community);
  const choice = cpuChoice(strength, toCall, state.cpu.stack, state.pot);
  if (choice === "fold") {
    return pgShowdown({ ...state, cpu: { ...state.cpu, folded: true } }, cfg);
  }
  if (choice === "call") {
    const pay = Math.min(toCall, state.cpu.stack);
    const cpu = { ...state.cpu, stack: state.cpu.stack - pay, bet: state.cpu.bet + pay, acted: true };
    const next = { ...state, cpu, pot: state.pot + pay, message: toCall === 0 ? "CPU checks." : `CPU calls ${pay}.` };
    if (pgStreetComplete(next)) return pgNextStreet(next, cfg);
    return { ...next, toAct: "player" };
  }
  const raiseAmt = Math.min(sb * 4, state.cpu.stack - toCall);
  const total = Math.max(toCall + raiseAmt, toCall + sb * 2);
  const pay = Math.min(total, state.cpu.stack);
  const cpu = { ...state.cpu, stack: state.cpu.stack - pay, bet: state.cpu.bet + pay, acted: true };
  return {
    ...state,
    cpu,
    pot: state.pot + pay,
    toAct: "player",
    message: `CPU raises to ${cpu.bet}.`,
    player: { ...state.player, acted: false },
  };
}

export type PGAction =
  | { type: "deal" }
  | { type: "fold" }
  | { type: "check" }
  | { type: "call" }
  | { type: "raise"; amount: number }
  | { type: "discard"; index: number };

export function pgReducer<S>(state: PGState<S>, action: PGAction, cfg: PGConfig<S>): PGState<S> {
  if (state.phase === "done") return state;
  if (action.type === "deal") {
    if (state.handsPlayed >= cfg.totalHands) return state;
    if (state.phase !== "preflop" && state.phase !== "showdown") return state;
    if (state.phase === "preflop" && state.player.hole.length > 0) return state;
    return pgDeal(state, cfg);
  }
  if (state.phase === "showdown") return state;
  if (state.player.hole.length === 0) return state;

  if (action.type === "discard") {
    if (!state.pendingDiscard || state.toAct !== "player") return state;
    const idx = action.index;
    if (idx < 0 || idx >= state.player.hole.length) return state;
    const newHole = state.player.hole.slice();
    const [removed] = newHole.splice(idx, 1);
    const player = { ...state.player, hole: newHole, discarded: [...(state.player.discarded ?? []), removed!] };
    // CPU also discards: drop random/lowest card
    const cpuHole = state.cpu.hole.slice();
    const cpuLowIdx = cpuHole
      .map((c, i) => ({ v: c.rank === 1 ? 14 : c.rank, i }))
      .sort((a, b) => a.v - b.v)[0]!.i;
    const [cpuRemoved] = cpuHole.splice(cpuLowIdx, 1);
    const cpu = { ...state.cpu, hole: cpuHole, discarded: [...(state.cpu.discarded ?? []), cpuRemoved!] };
    return { ...state, player, cpu, pendingDiscard: false, message: "Discarded a card.", toAct: "player" };
  }

  if (state.toAct !== "player" || state.pendingDiscard) return state;
  if (action.type === "fold") {
    return pgShowdown({ ...state, player: { ...state.player, folded: true } }, cfg);
  }
  if (action.type === "check") {
    if (state.cpu.bet !== state.player.bet) return state;
    const next = { ...state, player: { ...state.player, acted: true }, message: "You check." };
    if (pgStreetComplete(next)) return pgNextStreet(next, cfg);
    return pgCpuTurn({ ...next, toAct: "cpu" }, cfg);
  }
  if (action.type === "call") {
    const toCall = state.cpu.bet - state.player.bet;
    if (toCall < 0) return state;
    const pay = Math.min(toCall, state.player.stack);
    const player = { ...state.player, stack: state.player.stack - pay, bet: state.player.bet + pay, acted: true };
    const next: PGState<S> = { ...state, player, pot: state.pot + pay, message: `You call ${pay}.` };
    if (pgStreetComplete(next)) return pgNextStreet(next, cfg);
    return pgCpuTurn({ ...next, toAct: "cpu" }, cfg);
  }
  if (action.type === "raise") {
    const sb = cfg.smallBlind(state.settings);
    const toCall = Math.max(0, state.cpu.bet - state.player.bet);
    const raise = Math.max(sb * 2, action.amount);
    const total = toCall + raise;
    const pay = Math.min(total, state.player.stack);
    const player = { ...state.player, stack: state.player.stack - pay, bet: state.player.bet + pay, acted: true };
    const next: PGState<S> = {
      ...state,
      player, pot: state.pot + pay, toAct: "cpu",
      message: `You raise to ${player.bet}.`,
      cpu: { ...state.cpu, acted: false },
    };
    return pgCpuTurn(next, cfg);
  }
  return state;
}

export function pgIsTerminal<S>(state: PGState<S>): { score: number } | null {
  if (state.phase === "done") return { score: state.player.stack };
  return null;
}
