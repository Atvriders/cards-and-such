import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

/**
 * Skip-Bo (Full Sequential Stack)
 *
 * 162-card deck: 12 each of 1..12 (= 144) + 18 Skip-Bo wildcards (value 0).
 * 4 seats (seat 0 = human, seats 1-3 = CPU). Each seat has:
 *   - stockpile of 30 cards (top face-up to owner)
 *   - hand of up to 5 cards (drawn at start of turn)
 *   - 4 personal discard piles (top face-up)
 * Center: 4 shared build piles (1..12). Completed piles return to a `completed`
 * recycle buffer that is reshuffled into the draw pile when the draw is empty.
 *
 * A Skip-Bo card (value 0) is wild and plays as the next required number.
 * Turn ends when the player places a hand card onto one of their discard piles.
 * First to empty stockpile wins.
 *
 * Skipped/omitted rules: optional house rule of penalty cards when going out
 * with cards in hand (not part of base rules); team-Skip-Bo variant (not
 * applicable to 4-individual play).
 */

export interface SkipBoFullSettings {
  cpuCount: 1 | 2 | 3;
  stockSize: 10 | 20 | 30;
}

/** A card value of 0 means a Skip-Bo wild; otherwise 1..12. */
export type CardVal = number;

export interface CardObj {
  /** Stable unique id of the form "c-<index>" assigned at deck creation. */
  id: string;
  /** 0 = Skip-Bo wild, 1..12 = numbered. */
  value: CardVal;
}

/** Source of a card the player wants to play onto a build pile. */
export type PlaySource =
  | { kind: "hand"; index: number }
  | { kind: "stock" }
  | { kind: "discard"; index: 0 | 1 | 2 | 3 };

export interface SeatBoard {
  stock: CardObj[];           // stack; .at(-1) is the visible top
  hand: (CardObj | null)[];   // length up to 5, nulls = empty hand slots
  discards: CardObj[][];      // 4 piles, .at(-1) of each is the visible top
}

export type Phase = "playing" | "done";

export interface SkipBoFullState {
  settings: SkipBoFullSettings;
  rngSeed: number;
  seats: SeatBoard[];                // length 4
  buildPiles: CardObj[][];           // length 4, each builds 1..12
  draw: CardObj[];
  completed: CardObj[];              // recycle buffer for completed build piles
  turn: number;                      // 0 = human, 1-3 = CPU
  phase: Phase;
  winner: number | null;
  log: string[];                     // last few events for the HUD
  /** Bumps each time `runCpu` finishes a single CPU turn; the UI can watch it
   *  to step bots forward in a useEffect without infinite recursion. */
  cpuTick: number;
}

export type SkipBoFullAction =
  | { type: "play"; source: PlaySource; buildIndex: 0 | 1 | 2 | 3 }
  | { type: "discard"; handIndex: number; discardIndex: 0 | 1 | 2 | 3 }
  | { type: "cpuStep" };

const PLAYER_COUNT = 4;
const HAND_SIZE = 5;
const DISCARD_PILES = 4;
const BUILD_PILES = 4;
const MAX_LOG = 8;

/* --------------------------- deck construction ---------------------------- */

function buildDeck(): CardObj[] {
  const cards: CardObj[] = [];
  let idx = 0;
  for (let v = 1; v <= 12; v++) {
    for (let i = 0; i < 12; i++) cards.push({ id: `c-${idx++}`, value: v });
  }
  for (let i = 0; i < 18; i++) cards.push({ id: `c-${idx++}`, value: 0 });
  return cards;
}

function shuffleInPlace<T>(arr: T[], rng: () => number): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const t = arr[i]!;
    arr[i] = arr[j]!;
    arr[j] = t;
  }
  return arr;
}

/* ----------------------------- helpers ----------------------------------- */

export function nextRequired(buildPile: CardObj[]): number {
  return buildPile.length + 1; // 1..12
}

export function valueMatches(cardValue: CardVal, required: number): boolean {
  return cardValue === 0 || cardValue === required;
}

function refillDrawIfNeeded(state: SkipBoFullState): SkipBoFullState {
  if (state.draw.length > 0) return state;
  if (state.completed.length === 0) return state;
  const rng = mulberry32(state.rngSeed);
  const newDraw = [...state.completed];
  shuffleInPlace(newDraw, rng);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return { ...state, draw: newDraw, completed: [], rngSeed: nextSeed };
}

function drawOne(state: SkipBoFullState): { state: SkipBoFullState; card: CardObj | null } {
  const s1 = refillDrawIfNeeded(state);
  if (s1.draw.length === 0) return { state: s1, card: null };
  const newDraw = s1.draw.slice(0, -1);
  const card = s1.draw[s1.draw.length - 1]!;
  return { state: { ...s1, draw: newDraw }, card };
}

function refillHand(state: SkipBoFullState, seat: number): SkipBoFullState {
  let s = state;
  const hand = [...s.seats[seat]!.hand];
  // count current cards
  const hasCount = hand.filter(c => c !== null).length;
  let need = HAND_SIZE - hasCount;
  if (need <= 0) return s;
  // re-pack & fill empty slots from draw
  while (need > 0) {
    const { state: s2, card } = drawOne(s);
    s = s2;
    if (!card) break;
    // place in first empty slot
    const emptyIdx = hand.findIndex(c => c === null);
    if (emptyIdx < 0) {
      hand.push(card);
    } else {
      hand[emptyIdx] = card;
    }
    need--;
  }
  // pad to HAND_SIZE with nulls
  while (hand.length < HAND_SIZE) hand.push(null);
  const newSeats = s.seats.map((sb, i) => i === seat ? { ...sb, hand } : sb);
  return { ...s, seats: newSeats };
}

function takeCardFromSource(
  state: SkipBoFullState,
  seat: number,
  source: PlaySource,
): { state: SkipBoFullState; card: CardObj | null } {
  const seatBoard = state.seats[seat]!;
  if (source.kind === "hand") {
    const card = seatBoard.hand[source.index];
    if (!card) return { state, card: null };
    const newHand = [...seatBoard.hand];
    newHand[source.index] = null;
    const newSeats = state.seats.map((sb, i) => i === seat ? { ...sb, hand: newHand } : sb);
    return { state: { ...state, seats: newSeats }, card };
  }
  if (source.kind === "stock") {
    if (seatBoard.stock.length === 0) return { state, card: null };
    const card = seatBoard.stock[seatBoard.stock.length - 1]!;
    const newStock = seatBoard.stock.slice(0, -1);
    const newSeats = state.seats.map((sb, i) => i === seat ? { ...sb, stock: newStock } : sb);
    return { state: { ...state, seats: newSeats }, card };
  }
  // discard
  const pile = seatBoard.discards[source.index];
  if (!pile || pile.length === 0) return { state, card: null };
  const card = pile[pile.length - 1]!;
  const newPile = pile.slice(0, -1);
  const newDiscards = seatBoard.discards.map((d, i) => i === source.index ? newPile : d);
  const newSeats = state.seats.map((sb, i) => i === seat ? { ...sb, discards: newDiscards } : sb);
  return { state: { ...state, seats: newSeats }, card };
}

function pushBuildPile(
  state: SkipBoFullState,
  buildIndex: number,
  card: CardObj,
): SkipBoFullState {
  const required = nextRequired(state.buildPiles[buildIndex]!);
  // Wild becomes a placeholder of the required value for visual continuity.
  const placed: CardObj = card.value === 0 ? { id: card.id, value: required } : card;
  const newPile = [...state.buildPiles[buildIndex]!, placed];
  if (newPile.length >= 12) {
    const newCompleted = [...state.completed, ...newPile];
    const newBuilds = state.buildPiles.map((p, i) => i === buildIndex ? [] : p);
    return { ...state, buildPiles: newBuilds, completed: newCompleted };
  }
  const newBuilds = state.buildPiles.map((p, i) => i === buildIndex ? newPile : p);
  return { ...state, buildPiles: newBuilds };
}

function pushLog(state: SkipBoFullState, line: string): SkipBoFullState {
  const log = [...state.log, line].slice(-MAX_LOG);
  return { ...state, log };
}

function seatName(seat: number): string {
  return seat === 0 ? "You" : `CPU ${seat}`;
}

function checkWin(state: SkipBoFullState, seat: number): SkipBoFullState {
  if (state.seats[seat]!.stock.length === 0) {
    return { ...state, phase: "done", winner: seat, log: [...state.log, `${seatName(seat)} emptied the stockpile and won!`].slice(-MAX_LOG) };
  }
  return state;
}

function endTurn(state: SkipBoFullState): SkipBoFullState {
  if (state.phase === "done") return state;
  const next = (state.turn + 1) % PLAYER_COUNT;
  // active CPU count (settings.cpuCount). If next seat is > cpuCount, skip it.
  const activeMax = state.settings.cpuCount; // seats 1..cpuCount are CPUs; > cpuCount are absent
  let nseat = next;
  // disabled seats above cpuCount get their boards empty; iterate to find next active
  while (nseat !== 0 && nseat > activeMax) {
    nseat = (nseat + 1) % PLAYER_COUNT;
  }
  let s: SkipBoFullState = { ...state, turn: nseat };
  s = refillHand(s, nseat);
  return s;
}

/* --------------------------------- CPU ------------------------------------ */

/**
 * One CPU turn, fully resolved. Strategy:
 *  1. Refill hand (already done by endTurn before this).
 *  2. Loop: if stockpile top can play on a build pile -> play it.
 *  3. Else, prefer any discard-top that can play (frees discard space).
 *  4. Else, any hand card that can play.
 *  5. Loop until no playable card remains (or stock empty -> win).
 *  6. Discard lowest-value hand card to a pile whose top is closest in value
 *     (prefer same value > +1 > empty > else lowest mismatch).
 */
function cpuPlayablePlayOnce(state: SkipBoFullState, seat: number): SkipBoFullState | null {
  const sb = state.seats[seat]!;

  const tryPlayCard = (card: CardObj | null, source: PlaySource): SkipBoFullState | null => {
    if (!card) return null;
    for (let b = 0; b < BUILD_PILES; b++) {
      const req = nextRequired(state.buildPiles[b]!);
      if (valueMatches(card.value, req)) {
        // Heuristic: don't waste a wild if a non-wild from another source
        // could also play here this round. We'll trust the priority order.
        let s2 = takeCardFromSource(state, seat, source).state;
        s2 = pushBuildPile(s2, b as 0 | 1 | 2 | 3, card);
        return s2;
      }
    }
    return null;
  };

  // 1) stock top
  const stockTop = sb.stock.at(-1) ?? null;
  const sStock = tryPlayCard(stockTop, { kind: "stock" });
  if (sStock) return sStock;

  // 2) discard tops (prefer highest-value playable top to free space deeper)
  type DiscardOpt = { idx: 0 | 1 | 2 | 3; card: CardObj };
  const discardOpts: DiscardOpt[] = [];
  for (let i = 0; i < DISCARD_PILES; i++) {
    const top = sb.discards[i]!.at(-1);
    if (top) discardOpts.push({ idx: i as 0 | 1 | 2 | 3, card: top });
  }
  discardOpts.sort((a, b) => b.card.value - a.card.value); // play highest first
  for (const opt of discardOpts) {
    // Skip pure wilds among discards unless nothing else can play
    if (opt.card.value === 0) continue;
    const s = tryPlayCard(opt.card, { kind: "discard", index: opt.idx });
    if (s) return s;
  }

  // 3) hand (non-wild first, then wild)
  const handOptsNonWild: { card: CardObj; index: number }[] = [];
  const handOptsWild: { card: CardObj; index: number }[] = [];
  sb.hand.forEach((c, i) => {
    if (!c) return;
    if (c.value === 0) handOptsWild.push({ card: c, index: i });
    else handOptsNonWild.push({ card: c, index: i });
  });
  for (const h of handOptsNonWild) {
    const s = tryPlayCard(h.card, { kind: "hand", index: h.index });
    if (s) return s;
  }
  // 4) discard wilds (rare)
  for (const opt of discardOpts) {
    if (opt.card.value !== 0) continue;
    const s = tryPlayCard(opt.card, { kind: "discard", index: opt.idx });
    if (s) return s;
  }
  // 5) hand wilds
  for (const h of handOptsWild) {
    const s = tryPlayCard(h.card, { kind: "hand", index: h.index });
    if (s) return s;
  }
  return null;
}

function cpuDiscardChoice(state: SkipBoFullState, seat: number): { handIndex: number; discardIndex: 0 | 1 | 2 | 3 } | null {
  const sb = state.seats[seat]!;
  const handIdxs: { idx: number; v: number }[] = [];
  sb.hand.forEach((c, i) => { if (c) handIdxs.push({ idx: i, v: c.value }); });
  if (handIdxs.length === 0) return null;
  // Prefer discarding lowest-value (most useful low cards we want gone from hand last).
  // Actually we want to keep low cards to start build piles; discard high non-essential
  // mid-value cards. Use heuristic: discard whichever value is FURTHEST from the
  // current stock top value (less useful). If no stock, discard highest.
  const stockTopVal = sb.stock.at(-1)?.value ?? 0;
  handIdxs.sort((a, b) => {
    // wild last (never discard wild if possible)
    if (a.v === 0 && b.v !== 0) return 1;
    if (b.v === 0 && a.v !== 0) return -1;
    // prefer high values to discard first (keep mid cards for building)
    const da = Math.abs(a.v - stockTopVal);
    const db = Math.abs(b.v - stockTopVal);
    return db - da;
  });
  const pick = handIdxs[0]!;
  // Choose a discard pile: prefer same-value pile top, then empty pile, then
  // pile with highest top (since high tops are less likely to block).
  let bestPile: 0 | 1 | 2 | 3 = 0;
  let bestScore = -Infinity;
  for (let i = 0; i < DISCARD_PILES; i++) {
    const pile = sb.discards[i]!;
    const top = pile.at(-1);
    let score = 0;
    if (!top) score = 50;                                  // empty pile is best
    else if (top.value === pick.v) score = 100;            // same value: stack neatly
    else if (top.value > pick.v) score = 20 + top.value;   // pile is higher (we're hiding low under high — discouraged unless no choice)
    else score = -top.value;                               // pile is lower (covering low with high blocks it)
    if (score > bestScore) { bestScore = score; bestPile = i as 0 | 1 | 2 | 3; }
  }
  return { handIndex: pick.idx, discardIndex: bestPile };
}

function runCpuTurn(state: SkipBoFullState): SkipBoFullState {
  let s = state;
  if (s.phase === "done") return s;
  if (s.turn === 0) return s;
  const seat = s.turn;
  // Safety bound to prevent any pathological infinite loop.
  for (let i = 0; i < 60; i++) {
    const next = cpuPlayablePlayOnce(s, seat);
    if (!next) break;
    s = next;
    s = checkWin(s, seat);
    if (s.phase === "done") return s;
  }
  // Discard from hand to end turn
  const choice = cpuDiscardChoice(s, seat);
  if (!choice) {
    // empty hand (rare) -> still must end turn
    s = pushLog(s, `${seatName(seat)} ended turn with empty hand.`);
    return endTurn(s);
  }
  const sb = s.seats[seat]!;
  const card = sb.hand[choice.handIndex];
  if (!card) return endTurn(s);
  const newHand = [...sb.hand]; newHand[choice.handIndex] = null;
  const newDiscards = sb.discards.map((d, i) =>
    i === choice.discardIndex ? [...d, card] : d
  );
  const newSeats = s.seats.map((b, i) =>
    i === seat ? { ...b, hand: newHand, discards: newDiscards } : b
  );
  s = { ...s, seats: newSeats };
  s = pushLog(s, `${seatName(seat)} discarded ${cardLabel(card)}.`);
  return endTurn(s);
}

function cardLabel(c: CardObj): string {
  return c.value === 0 ? "Skip-Bo" : String(c.value);
}

/* ----------------------------- public API --------------------------------- */

export function initialState(seed: number, settings: SkipBoFullSettings): SkipBoFullState {
  const safeSettings: SkipBoFullSettings = {
    cpuCount: (settings?.cpuCount ?? 3) as 1 | 2 | 3,
    stockSize: (settings?.stockSize ?? 30) as 10 | 20 | 30,
  };
  const rng = mulberry32(seed);
  const deck = buildDeck();
  shuffleInPlace(deck, rng);

  const seats: SeatBoard[] = [];
  let cursor = 0;
  const active = 1 + safeSettings.cpuCount; // seat 0 + cpus
  for (let p = 0; p < PLAYER_COUNT; p++) {
    if (p >= active) {
      seats.push({ stock: [], hand: new Array(HAND_SIZE).fill(null), discards: [[], [], [], []] });
      continue;
    }
    const stock = deck.slice(cursor, cursor + safeSettings.stockSize);
    cursor += safeSettings.stockSize;
    const hand: (CardObj | null)[] = deck.slice(cursor, cursor + HAND_SIZE);
    cursor += HAND_SIZE;
    while (hand.length < HAND_SIZE) hand.push(null);
    seats.push({ stock, hand, discards: [[], [], [], []] });
  }
  const draw = deck.slice(cursor);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return {
    settings: safeSettings,
    rngSeed: nextSeed,
    seats,
    buildPiles: [[], [], [], []],
    draw,
    completed: [],
    turn: 0,
    phase: "playing",
    winner: null,
    log: ["Your turn — empty your stockpile to win."],
    cpuTick: 0,
  };
}

export function reducer(state: SkipBoFullState, action: SkipBoFullAction): SkipBoFullState {
  if (state.phase === "done") return state;

  if (action.type === "cpuStep") {
    if (state.turn === 0) return state;
    const s = runCpuTurn(state);
    return { ...s, cpuTick: s.cpuTick + 1 };
  }

  if (state.turn !== 0) return state; // human-only actions below

  if (action.type === "play") {
    const seat = 0;
    const sb = state.seats[seat]!;
    // Validate source has a card
    let card: CardObj | null = null;
    if (action.source.kind === "hand") card = sb.hand[action.source.index] ?? null;
    else if (action.source.kind === "stock") card = sb.stock.at(-1) ?? null;
    else card = sb.discards[action.source.index]!.at(-1) ?? null;
    if (!card) return state;
    const required = nextRequired(state.buildPiles[action.buildIndex]!);
    if (!valueMatches(card.value, required)) return state;
    let s = takeCardFromSource(state, seat, action.source).state;
    s = pushBuildPile(s, action.buildIndex, card);
    s = pushLog(s, `You played ${cardLabel(card)} on pile ${action.buildIndex + 1}.`);
    s = checkWin(s, seat);
    if (s.phase === "done") return s;
    // After a play, if hand became fully empty, refill mid-turn (Skip-Bo rule).
    const handCount = s.seats[seat]!.hand.filter(c => c !== null).length;
    if (handCount === 0) s = refillHand(s, seat);
    return s;
  }

  if (action.type === "discard") {
    const seat = 0;
    const sb = state.seats[seat]!;
    const card = sb.hand[action.handIndex];
    if (!card) return state;
    const newHand = [...sb.hand]; newHand[action.handIndex] = null;
    const newDiscards = sb.discards.map((d, i) => i === action.discardIndex ? [...d, card] : d);
    const newSeats = state.seats.map((b, i) => i === seat ? { ...b, hand: newHand, discards: newDiscards } : b);
    let s: SkipBoFullState = { ...state, seats: newSeats };
    s = pushLog(s, `You discarded ${cardLabel(card)}.`);
    s = endTurn(s);
    return s;
  }

  return state;
}

export function isTerminal(state: SkipBoFullState): { score: number } | null {
  if (state.phase !== "done") return null;
  if (state.winner === 0) {
    // Score = 100 + cards remaining in opponent stocks (more decisive = more score).
    let bonus = 0;
    for (let i = 1; i < PLAYER_COUNT; i++) bonus += state.seats[i]!.stock.length;
    return { score: 100 + bonus };
  }
  return { score: 0 };
}

export function canHumanPlayAnywhere(state: SkipBoFullState): boolean {
  if (state.phase !== "playing" || state.turn !== 0) return false;
  const sb = state.seats[0]!;
  const sources: PlaySource[] = [
    { kind: "stock" },
    ...sb.hand.map((_, i) => ({ kind: "hand" as const, index: i })),
    ...sb.discards.map((_, i) => ({ kind: "discard" as const, index: i as 0 | 1 | 2 | 3 })),
  ];
  for (const src of sources) {
    let card: CardObj | null = null;
    if (src.kind === "hand") card = sb.hand[src.index] ?? null;
    else if (src.kind === "stock") card = sb.stock.at(-1) ?? null;
    else card = sb.discards[src.index]!.at(-1) ?? null;
    if (!card) continue;
    for (let b = 0; b < BUILD_PILES; b++) {
      const req = nextRequired(state.buildPiles[b]!);
      if (valueMatches(card.value, req)) return true;
    }
  }
  return false;
}
