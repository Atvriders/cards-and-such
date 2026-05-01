// Generic heads-up stud poker engine. Streets deal cards (some face up, some face down).
import type { Card } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { cpuChoice } from "./poker.js";

export interface StudSeat {
  cards: Card[];
  /** parallel to cards: true = face-up */
  up: boolean[];
  bet: number;
  stack: number;
  folded: boolean;
  acted: boolean;
}

export type StudStreet = number; // 1-based

export interface StudState<S = unknown> {
  rngSeed: number;
  deck: Card[];
  player: StudSeat;
  cpu: StudSeat;
  pot: number;
  toAct: "player" | "cpu";
  street: StudStreet; // 0 = before deal, 1..N during play, N+1 = showdown
  message: string;
  handsPlayed: number;
  showdownReveal: boolean;
  settings: S;
  done: boolean;
}

export interface StudConfig<S> {
  totalHands: number;
  startingStack: (s: S) => number;
  ante: (s: S) => number;
  smallBet: (s: S) => number;
  /** Schedule: per street, how many cards each player gets and which face. true = up. */
  schedule: { perPlayer: number; faces: boolean[] }[];
  /** Final showdown comparator: positive => player wins. Returns winner + tag. */
  judge: (player: StudSeat, cpu: StudSeat) => { winner: "player" | "cpu" | "split"; tag: string };
  /** CPU strength estimate from its visible/known cards. */
  cpuStrength: (cpu: StudSeat, street: number) => number;
}

export function studEmptySeat(stack: number): StudSeat {
  return { cards: [], up: [], bet: 0, stack, folded: false, acted: false };
}

function nextRng(seed: number): { rng: () => number; nextSeed: number } {
  const r = mulberry32(seed);
  const ns = Math.floor(r() * 2 ** 31);
  return { rng: mulberry32(seed), nextSeed: ns };
}

export function studInitialState<S>(seed: number, settings: S, cfg: StudConfig<S>): StudState<S> {
  const stack = cfg.startingStack(settings);
  return {
    rngSeed: seed >>> 0,
    deck: [],
    player: studEmptySeat(stack),
    cpu: studEmptySeat(stack),
    pot: 0,
    toAct: "player",
    street: 0,
    message: "Click Deal to begin.",
    handsPlayed: 0,
    showdownReveal: false,
    settings,
    done: false,
  };
}

export function studDeal<S>(state: StudState<S>, cfg: StudConfig<S>): StudState<S> {
  const ante = cfg.ante(state.settings);
  const { rng, nextSeed } = nextRng(state.rngSeed);
  const deck = shuffle(newDeck(1), rng);
  const player = studEmptySeat(state.player.stack);
  const cpu = studEmptySeat(state.cpu.stack);
  // Each posts ante
  player.stack -= ante; cpu.stack -= ante;
  const pot = ante * 2;
  // Deal first street
  const first = cfg.schedule[0]!;
  let i = 0;
  for (let p = 0; p < first.perPlayer; p++) {
    player.cards.push(deck[i]!); player.up.push(first.faces[p] ?? false); i++;
    cpu.cards.push(deck[i]!); cpu.up.push(first.faces[p] ?? false); i++;
  }
  return {
    ...state,
    rngSeed: nextSeed,
    deck: deck.slice(i),
    player, cpu,
    pot,
    toAct: "player",
    street: 1,
    message: `Antes posted. Street 1 dealt.`,
    showdownReveal: false,
  };
}

function endHand<S>(state: StudState<S>, winner: "player" | "cpu" | "split", message: string, totalHands: number): StudState<S> {
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
    showdownReveal: true,
    message,
    handsPlayed,
    done,
    street: 0,
  };
}

export function studShowdown<S>(state: StudState<S>, cfg: StudConfig<S>): StudState<S> {
  if (state.player.folded) return endHand(state, "cpu", `You folded. CPU wins ${state.pot}.`, cfg.totalHands);
  if (state.cpu.folded) return endHand(state, "player", `CPU folded. You win ${state.pot}.`, cfg.totalHands);
  const j = cfg.judge(state.player, state.cpu);
  let msg: string;
  if (j.winner === "player") msg = `You win ${state.pot} (${j.tag}).`;
  else if (j.winner === "cpu") msg = `CPU wins ${state.pot} (${j.tag}).`;
  else msg = `Split — ${j.tag}.`;
  return endHand(state, j.winner, msg, cfg.totalHands);
}

function streetComplete<S>(state: StudState<S>): boolean {
  if (state.player.folded || state.cpu.folded) return true;
  return state.player.acted && state.cpu.acted && state.player.bet === state.cpu.bet;
}

function nextStreet<S>(state: StudState<S>, cfg: StudConfig<S>): StudState<S> {
  const newStreet = state.street + 1;
  if (newStreet > cfg.schedule.length) return studShowdown(state, cfg);
  const sched = cfg.schedule[newStreet - 1]!;
  let deck = state.deck;
  const player = { ...state.player, cards: [...state.player.cards], up: [...state.player.up], bet: 0, acted: false };
  const cpu = { ...state.cpu, cards: [...state.cpu.cards], up: [...state.cpu.up], bet: 0, acted: false };
  for (let p = 0; p < sched.perPlayer; p++) {
    player.cards.push(deck[0]!); player.up.push(sched.faces[p] ?? false); deck = deck.slice(1);
    cpu.cards.push(deck[0]!); cpu.up.push(sched.faces[p] ?? false); deck = deck.slice(1);
  }
  return {
    ...state,
    deck,
    player, cpu,
    street: newStreet,
    toAct: "player",
    message: `Street ${newStreet} dealt.`,
  };
}

function cpuTurn<S>(state: StudState<S>, cfg: StudConfig<S>): StudState<S> {
  const sb = cfg.smallBet(state.settings);
  const toCall = state.player.bet - state.cpu.bet;
  const strength = cfg.cpuStrength(state.cpu, state.street);
  const choice = cpuChoice(strength, toCall, state.cpu.stack, state.pot);
  if (choice === "fold") {
    return studShowdown({ ...state, cpu: { ...state.cpu, folded: true } }, cfg);
  }
  if (choice === "call") {
    const pay = Math.min(toCall, state.cpu.stack);
    const cpu = { ...state.cpu, stack: state.cpu.stack - pay, bet: state.cpu.bet + pay, acted: true };
    const next = { ...state, cpu, pot: state.pot + pay, message: toCall === 0 ? "CPU checks." : `CPU calls ${pay}.` };
    if (streetComplete(next)) return nextStreet(next, cfg);
    return { ...next, toAct: "player" };
  }
  const raiseAmt = Math.min(sb * 2, state.cpu.stack - toCall);
  const total = Math.max(toCall + raiseAmt, toCall + sb);
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

export type StudAction =
  | { type: "deal" }
  | { type: "fold" }
  | { type: "check" }
  | { type: "call" }
  | { type: "raise"; amount: number };

export function studReducer<S>(state: StudState<S>, action: StudAction, cfg: StudConfig<S>): StudState<S> {
  if (state.done) return state;
  if (action.type === "deal") {
    if (state.handsPlayed >= cfg.totalHands) return state;
    if (state.street !== 0) return state;
    return studDeal(state, cfg);
  }
  if (state.street === 0) return state;
  if (state.toAct !== "player") return state;
  if (action.type === "fold") {
    return studShowdown({ ...state, player: { ...state.player, folded: true } }, cfg);
  }
  if (action.type === "check") {
    if (state.cpu.bet !== state.player.bet) return state;
    const next = { ...state, player: { ...state.player, acted: true }, message: "You check." };
    if (streetComplete(next)) return nextStreet(next, cfg);
    return cpuTurn({ ...next, toAct: "cpu" }, cfg);
  }
  if (action.type === "call") {
    const toCall = state.cpu.bet - state.player.bet;
    if (toCall < 0) return state;
    const pay = Math.min(toCall, state.player.stack);
    const player = { ...state.player, stack: state.player.stack - pay, bet: state.player.bet + pay, acted: true };
    const next: StudState<S> = { ...state, player, pot: state.pot + pay, message: `You call ${pay}.` };
    if (streetComplete(next)) return nextStreet(next, cfg);
    return cpuTurn({ ...next, toAct: "cpu" }, cfg);
  }
  if (action.type === "raise") {
    const sb = cfg.smallBet(state.settings);
    const toCall = Math.max(0, state.cpu.bet - state.player.bet);
    const raise = Math.max(sb, action.amount);
    const total = toCall + raise;
    const pay = Math.min(total, state.player.stack);
    const player = { ...state.player, stack: state.player.stack - pay, bet: state.player.bet + pay, acted: true };
    const next: StudState<S> = {
      ...state,
      player, pot: state.pot + pay, toAct: "cpu",
      message: `You raise to ${player.bet}.`,
      cpu: { ...state.cpu, acted: false },
    };
    return cpuTurn(next, cfg);
  }
  return state;
}

export function studIsTerminal<S>(state: StudState<S>): { score: number } | null {
  if (state.done) return { score: state.player.stack };
  return null;
}
