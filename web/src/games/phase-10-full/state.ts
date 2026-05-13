import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// ───────────────────────────────────────────────────────────────────────────
// Phase 10 (Full) — Rummy-style phase progression for 1 human + 3 CPUs.
// ───────────────────────────────────────────────────────────────────────────

export type Color = "R" | "B" | "G" | "Y";
export type CardKind = "num" | "wild" | "skip";

export interface P10Card {
  id: number;          // unique deck id (0..107)
  kind: CardKind;
  color: Color | null; // null for wild/skip
  value: number | null;// 1-12 for num; null for wild/skip
}

export type Seat = 0 | 1 | 2 | 3; // 0 = human

export type PhaseStage =
  | "draw"      // active player must draw a card
  | "play"      // optional: lay down current phase / discard
  | "round-end" // round just ended — show scoreboard
  | "done";     // game over (someone completed phase 10)

export interface P10Settings { _dummy: boolean; }

export interface P10Meld {
  cards: P10Card[]; // owner's contribution
  kind: "set" | "run" | "color";
  ownerSeat: Seat;
}

export interface P10State {
  rngSeed: number;
  round: number;
  current: Seat;
  stage: PhaseStage;
  hands: P10Card[][];      // index by seat
  phaseOf: number[];       // seat -> phase 1..10
  scores: number[];        // seat -> penalty points (lower wins)
  laidThisRound: boolean[];// did player lay down phase this round?
  draw: P10Card[];
  discard: P10Card[];
  // result panel after round ends
  message: string;
  goneOutBy: Seat | null;
  // human UI helpers — selected card ids
  selected: number[];
  // animation/notice
  lastAction: string;
  // winner (when stage === "done")
  winner: Seat | null;
}

export type P10Action =
  | { type: "draw"; from: "stock" | "discard" }
  | { type: "toggle-select"; cardId: number }
  | { type: "lay-down" }                // attempt to lay selected as phase
  | { type: "discard"; cardId: number } // ends turn
  | { type: "cpu-step" }                // run one CPU turn deterministically
  | { type: "next-round" };             // advance from round-end to next round

// ─── Phase definitions ──────────────────────────────────────────────────────

export interface PhaseGoal {
  index: number;
  desc: string;
  // groups: each group has a required size and type
  groups: Array<
    | { kind: "set"; size: number }
    | { kind: "run"; size: number }
    | { kind: "color"; size: number }
  >;
}

export const PHASES: PhaseGoal[] = [
  { index: 1,  desc: "2 sets of 3",          groups: [{ kind: "set", size: 3 }, { kind: "set", size: 3 }] },
  { index: 2,  desc: "1 set of 3 + 1 run of 4", groups: [{ kind: "set", size: 3 }, { kind: "run", size: 4 }] },
  { index: 3,  desc: "1 set of 4 + 1 run of 4", groups: [{ kind: "set", size: 4 }, { kind: "run", size: 4 }] },
  { index: 4,  desc: "1 run of 7",           groups: [{ kind: "run", size: 7 }] },
  { index: 5,  desc: "1 run of 8",           groups: [{ kind: "run", size: 8 }] },
  { index: 6,  desc: "1 run of 9",           groups: [{ kind: "run", size: 9 }] },
  { index: 7,  desc: "2 sets of 4",          groups: [{ kind: "set", size: 4 }, { kind: "set", size: 4 }] },
  { index: 8,  desc: "7 cards of 1 color",   groups: [{ kind: "color", size: 7 }] },
  { index: 9,  desc: "1 set of 5 + 1 set of 2", groups: [{ kind: "set", size: 5 }, { kind: "set", size: 2 }] },
  { index: 10, desc: "1 set of 5 + 1 set of 3", groups: [{ kind: "set", size: 5 }, { kind: "set", size: 3 }] },
];

// ─── Deck construction ──────────────────────────────────────────────────────

const COLORS: Color[] = ["R", "B", "G", "Y"];

export function makeDeck(): P10Card[] {
  const out: P10Card[] = [];
  let id = 0;
  // Each color has cards 1..12 duplicated (2 copies each), total 24 per color.
  for (const color of COLORS) {
    for (let copy = 0; copy < 2; copy++) {
      for (let v = 1; v <= 12; v++) {
        out.push({ id: id++, kind: "num", color, value: v });
      }
    }
  }
  for (let i = 0; i < 8; i++) out.push({ id: id++, kind: "wild", color: null, value: null });
  for (let i = 0; i < 4; i++) out.push({ id: id++, kind: "skip", color: null, value: null });
  return out; // 96 + 8 + 4 = 108
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = a[i]!;
    a[i] = a[j]!;
    a[j] = tmp;
  }
  return a;
}

// ─── Card values for penalty scoring ────────────────────────────────────────

export function penaltyValue(c: P10Card): number {
  if (c.kind === "skip") return 15;
  if (c.kind === "wild") return 25;
  if (c.value == null) return 0;
  return c.value <= 9 ? 5 : 10;
}

// ─── Phase validation helpers ───────────────────────────────────────────────
// A "set" = cards of same number (wilds substitute).
// A "run" = cards of consecutive numbers (any color, wilds substitute). No
// wrap-around. Skip cards may not be used in melds.
// A "color" group = N cards of the same color (wilds substitute).
// All groups required by the phase must be satisfiable from the chosen cards
// with no leftover.

type Group = PhaseGoal["groups"][number];

/**
 * Try to fulfill phase `goal` exactly using `cards`. Returns true if every
 * card is assignable to a valid group; false otherwise.
 *
 * We do this by enumerating partitions, but with small phase group counts
 * (≤2) and small phase sizes, brute force is feasible: split numbered cards
 * by group with backtracking, distributing wilds where helpful.
 */
export function canFormPhase(cards: P10Card[], goal: PhaseGoal): boolean {
  // Skip cards can never be in a meld.
  if (cards.some((c) => c.kind === "skip")) return false;

  const totalSize = goal.groups.reduce((s, g) => s + g.size, 0);
  if (cards.length !== totalSize) return false;

  // At least one non-wild required per group (cannot make a meld of all wilds).
  const totalNonWild = cards.filter((c) => c.kind !== "wild").length;
  if (totalNonWild < goal.groups.length) return false;

  // Enumerate all ways to partition `cards` into groups of the required sizes.
  // For small sizes this is fast enough. To prune, sort groups by size desc.
  const groupOrder = goal.groups
    .map((g, idx) => ({ g, idx }))
    .sort((a, b) => b.g.size - a.g.size);

  function tryAssign(remaining: P10Card[], gi: number): boolean {
    if (gi === groupOrder.length) return remaining.length === 0;
    const grp = groupOrder[gi]!.g;
    // Choose which `grp.size` of `remaining` go to this group.
    return choose(remaining, grp.size, (selected, leftover) => {
      if (!isValidGroup(selected, grp)) return false;
      return tryAssign(leftover, gi + 1);
    });
  }

  return tryAssign(cards, 0);
}

function choose<T>(
  arr: T[],
  k: number,
  visit: (selected: T[], leftover: T[]) => boolean,
): boolean {
  const n = arr.length;
  if (k > n) return false;
  const indices: number[] = [];
  function rec(start: number): boolean {
    if (indices.length === k) {
      const selected: T[] = indices.map((i) => arr[i]!);
      const taken = new Set(indices);
      const leftover: T[] = [];
      for (let i = 0; i < n; i++) if (!taken.has(i)) leftover.push(arr[i]!);
      return visit(selected, leftover);
    }
    for (let i = start; i < n; i++) {
      indices.push(i);
      if (rec(i + 1)) return true;
      indices.pop();
    }
    return false;
  }
  return rec(0);
}

export function isValidGroup(cards: P10Card[], grp: Group): boolean {
  if (cards.length !== grp.size) return false;
  if (cards.some((c) => c.kind === "skip")) return false;
  const wilds = cards.filter((c) => c.kind === "wild").length;
  const reals = cards.filter((c) => c.kind === "num");
  if (reals.length === 0) return false; // need at least 1 real card

  if (grp.kind === "set") {
    const v = reals[0]!.value!;
    return reals.every((c) => c.value === v);
  }
  if (grp.kind === "color") {
    const col = reals[0]!.color!;
    return reals.every((c) => c.color === col);
  }
  // run: any color, consecutive ascending; wilds fill gaps.
  // Sort numbered cards ascending. Walk through and require gap count <= wilds.
  const values = reals.map((c) => c.value!).sort((a, b) => a - b);
  // Duplicates not allowed in a run.
  for (let i = 1; i < values.length; i++) {
    if (values[i] === values[i - 1]) return false;
  }
  // Try every starting position low..(13 - size).
  // The lowest real value must be in [start, start+size-1], etc.
  const lo = values[0]!;
  const hi = values[values.length - 1]!;
  // We need start such that start <= lo && start + size - 1 >= hi.
  const minStart = Math.max(1, hi - grp.size + 1);
  const maxStart = Math.min(12 - grp.size + 1, lo);
  for (let start = minStart; start <= maxStart; start++) {
    // Count how many positions in [start, start+size) are covered by real cards
    let usedReal = 0;
    let valid = true;
    for (const v of values) {
      const pos = v - start;
      if (pos < 0 || pos >= grp.size) { valid = false; break; }
      usedReal++;
    }
    if (!valid) continue;
    const needWilds = grp.size - usedReal;
    if (needWilds <= wilds) return true;
  }
  return false;
}

// ─── Initial state ──────────────────────────────────────────────────────────

const SEATS: Seat[] = [0, 1, 2, 3];

export function initialState(seed: number, _s: P10Settings): P10State {
  const rng = mulberry32(seed >>> 0);
  const deck = shuffle(makeDeck(), rng);
  const hands: P10Card[][] = [[], [], [], []];
  let p = 0;
  for (const seat of SEATS) {
    for (let i = 0; i < 10; i++) {
      hands[seat]!.push(deck[p++]!);
    }
  }
  const firstDiscard = deck[p++]!;
  const discard: P10Card[] = [firstDiscard];
  // If first discard is a skip, just leave it — first player must still draw.
  const draw = deck.slice(p);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return {
    rngSeed: nextSeed,
    round: 1,
    current: 0,
    stage: "draw",
    hands,
    phaseOf: [1, 1, 1, 1],
    scores: [0, 0, 0, 0],
    laidThisRound: [false, false, false, false],
    draw,
    discard,
    message: "Round 1 — your turn. Draw a card.",
    goneOutBy: null,
    selected: [],
    lastAction: "",
    winner: null,
  };
}

// ─── Reducer helpers ────────────────────────────────────────────────────────

function reseed(state: P10State): { rng: () => number; nextSeed: number } {
  const rng = mulberry32(state.rngSeed >>> 0);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return { rng, nextSeed };
}

function drawTopOfStock(state: P10State): { card: P10Card; draw: P10Card[]; discard: P10Card[]; rngSeed: number } {
  let draw = [...state.draw];
  let discard = [...state.discard];
  let rngSeed = state.rngSeed;
  if (draw.length === 0) {
    // Reshuffle discard except top card.
    const top = discard.pop()!;
    const { rng, nextSeed } = reseed(state);
    draw = shuffle(discard, rng);
    discard = [top];
    rngSeed = nextSeed;
  }
  const card = draw.shift()!;
  return { card, draw, discard, rngSeed };
}

function nextSeat(s: Seat): Seat {
  return ((s + 1) % 4) as Seat;
}

function endRound(state: P10State, goneOut: Seat): P10State {
  // Add penalty for any cards left in each player's hand.
  const newScores = state.scores.slice();
  const newPhaseOf = state.phaseOf.slice();
  for (const seat of SEATS) {
    newScores[seat]! += state.hands[seat]!.reduce((sum, c) => sum + penaltyValue(c), 0);
    if (state.laidThisRound[seat]) newPhaseOf[seat]! += 1;
  }
  // Check if anyone has completed phase 10.
  const finishers = SEATS.filter((s) => newPhaseOf[s]! > 10);
  if (finishers.length > 0) {
    // Lowest score wins among finishers; ties broken by seat order.
    let winner: Seat = finishers[0]!;
    for (const s of finishers) {
      if (newScores[s]! < newScores[winner]!) winner = s;
    }
    return {
      ...state,
      stage: "done",
      scores: newScores,
      phaseOf: newPhaseOf,
      goneOutBy: goneOut,
      winner,
      message:
        winner === 0
          ? `You won! Cleared Phase 10 with ${newScores[0]} penalty pts.`
          : `CPU ${winner} won — they cleared Phase 10.`,
    };
  }
  return {
    ...state,
    stage: "round-end",
    scores: newScores,
    phaseOf: newPhaseOf,
    goneOutBy: goneOut,
    message:
      goneOut === 0
        ? `You went out! Phase ${state.phaseOf[0]} cleared.`
        : `CPU ${goneOut} went out.`,
  };
}

function startNextRound(state: P10State): P10State {
  const { rng, nextSeed } = reseed(state);
  const deck = shuffle(makeDeck(), rng);
  const hands: P10Card[][] = [[], [], [], []];
  let p = 0;
  for (const seat of SEATS) {
    for (let i = 0; i < 10; i++) hands[seat]!.push(deck[p++]!);
  }
  const discard = [deck[p++]!];
  const draw = deck.slice(p);
  // Dealer rotates each round; current = (round) % 4 — first player to left
  // of dealer goes first.
  const firstSeat = (state.round % 4) as Seat;
  return {
    ...state,
    rngSeed: nextSeed,
    round: state.round + 1,
    current: firstSeat,
    stage: "draw",
    hands,
    laidThisRound: [false, false, false, false],
    draw,
    discard,
    selected: [],
    message: `Round ${state.round + 1} — ${firstSeat === 0 ? "your" : `CPU ${firstSeat}`} turn. Draw a card.`,
    goneOutBy: null,
    lastAction: "",
  };
}

// ─── CPU strategy ───────────────────────────────────────────────────────────
//
// Heuristic: every CPU values cards by how close they bring the hand to
// completing the current phase target.
//   • If holding wild → +25 keep weight (always worth keeping unless the
//     phase is already laid down and dumping a wild ends the round).
//   • Score each numbered card by best frequency: count of same-number,
//     same-color, near-neighbours (±1, ±2) by number.
//   • Skip cards are usually discarded (cannot meld) unless near end.
//
// Discard: lowest-value (least useful) card.

function cpuScoreCard(card: P10Card, hand: P10Card[], goal: PhaseGoal): number {
  if (card.kind === "wild") return 100;
  if (card.kind === "skip") return -50;
  const needsSet = goal.groups.some((g) => g.kind === "set");
  const needsRun = goal.groups.some((g) => g.kind === "run");
  const needsColor = goal.groups.some((g) => g.kind === "color");
  let s = 0;
  for (const o of hand) {
    if (o.id === card.id) continue;
    if (o.kind !== "num") continue;
    if (needsSet && o.value === card.value) s += 8;
    if (needsRun && o.value != null && card.value != null) {
      const d = Math.abs(o.value - card.value);
      if (d === 1) s += 6; else if (d === 2) s += 3;
    }
    if (needsColor && o.color === card.color) s += 4;
  }
  // Slight base for low/easy-to-shed cards.
  s += penaltyValue(card) * 0.1;
  return s;
}

function findBestPhaseSubset(hand: P10Card[], goal: PhaseGoal): P10Card[] | null {
  // Greedy approach with backtracking — pick exactly `total` cards from hand
  // that form the phase. We'll try a few sensible orderings:
  // 1. Sort by penalty desc (wilds first then high numbers) — gets wilds in.
  // 2. Sort by penalty asc.
  // For correctness over efficiency, we do bounded subset enumeration when
  // hand is small (≤10 typical at lay-down attempts).
  const total = goal.groups.reduce((sum, g) => sum + g.size, 0);
  if (hand.length < total) return null;
  // Filter out skip cards (cannot be in melds).
  const candidates = hand.filter((c) => c.kind !== "skip");
  if (candidates.length < total) return null;

  // Enumerate subsets of size `total` from candidates. With ≤14 candidates
  // and total ≤ 10 this is bounded but can be large; we cap iterations.
  let found: P10Card[] | null = null;
  const cap = 4000;
  let count = 0;
  const idx: number[] = [];
  function rec(start: number): boolean {
    if (found || count > cap) return false;
    if (idx.length === total) {
      count++;
      const subset = idx.map((i) => candidates[i]!);
      if (canFormPhase(subset, goal)) {
        found = subset;
        return true;
      }
      return false;
    }
    for (let i = start; i < candidates.length; i++) {
      idx.push(i);
      if (rec(i + 1)) return true;
      idx.pop();
    }
    return false;
  }
  rec(0);
  return found;
}

function cpuTurn(prev: P10State): P10State {
  const seat = prev.current;
  let state = prev;
  // 1. Draw (prefer discard if it helps build current phase; else stock).
  const goal = PHASES[state.phaseOf[seat]! - 1]!;
  let drawFromDiscard = false;
  const top = state.discard[state.discard.length - 1];
  if (top && top.kind !== "skip") {
    const handPlus = [...state.hands[seat]!, top];
    const before = state.hands[seat]!.reduce(
      (s, c) => s + cpuScoreCard(c, state.hands[seat]!, goal),
      0,
    );
    const after = handPlus.reduce(
      (s, c) => s + cpuScoreCard(c, handPlus, goal),
      0,
    );
    if (after - before > 8) drawFromDiscard = true;
  }
  let drawnCard: P10Card;
  if (drawFromDiscard) {
    const newDiscard = [...state.discard];
    drawnCard = newDiscard.pop()!;
    state = { ...state, discard: newDiscard };
  } else {
    const r = drawTopOfStock(state);
    drawnCard = r.card;
    state = { ...state, draw: r.draw, discard: r.discard, rngSeed: r.rngSeed };
  }
  const newHand = [...state.hands[seat]!, drawnCard];
  state = setHand(state, seat, newHand);

  // 2. Try to lay down phase if not yet laid.
  if (!state.laidThisRound[seat]) {
    const subset = findBestPhaseSubset(state.hands[seat]!, goal);
    if (subset) {
      const usedIds = new Set(subset.map((c) => c.id));
      const reduced = state.hands[seat]!.filter((c) => !usedIds.has(c.id));
      const laid = state.laidThisRound.slice();
      laid[seat] = true;
      state = setHand({ ...state, laidThisRound: laid }, seat, reduced);
    }
  }

  // 3. Discard the worst card.
  const handForDiscard = state.hands[seat]!;
  if (handForDiscard.length === 0) {
    // already went out — shouldn't happen pre-discard, but handle anyway.
    return endRound(state, seat);
  }
  // pick the card with the lowest score-card heuristic (worst for our phase)
  let worstIdx = 0;
  let worstScore = Infinity;
  for (let i = 0; i < handForDiscard.length; i++) {
    const sc = cpuScoreCard(handForDiscard[i]!, handForDiscard, goal);
    if (sc < worstScore) {
      worstScore = sc;
      worstIdx = i;
    }
  }
  const discarded = handForDiscard[worstIdx]!;
  const afterDiscard = handForDiscard.filter((_, i) => i !== worstIdx);
  state = setHand(state, seat, afterDiscard);
  state = { ...state, discard: [...state.discard, discarded] };

  // 4. Check go-out.
  if (afterDiscard.length === 0 && state.laidThisRound[seat]) {
    return endRound(state, seat);
  }

  // 5. Advance to next player.
  return {
    ...state,
    current: nextSeat(seat),
    stage: "draw",
    message:
      nextSeat(seat) === 0
        ? `Your turn — draw a card.`
        : `CPU ${nextSeat(seat)} thinking…`,
    lastAction: `CPU ${seat} discarded ${describeCard(discarded)}.`,
    selected: [],
  };
}

function setHand(state: P10State, seat: Seat, hand: P10Card[]): P10State {
  const hands = state.hands.map((h, i) => (i === seat ? hand : h));
  return { ...state, hands };
}

export function describeCard(c: P10Card): string {
  if (c.kind === "wild") return "Wild";
  if (c.kind === "skip") return "Skip";
  return `${c.color}${c.value}`;
}

// ─── Reducer ────────────────────────────────────────────────────────────────

export function reducer(state: P10State, action: P10Action): P10State {
  if (state.stage === "done") return state;

  if (action.type === "next-round") {
    if (state.stage !== "round-end") return state;
    return startNextRound(state);
  }

  if (action.type === "cpu-step") {
    if (state.stage !== "draw") return state;
    if (state.current === 0) return state;
    return cpuTurn(state);
  }

  // Human-only actions below.
  if (state.current !== 0) return state;

  if (action.type === "draw") {
    if (state.stage !== "draw") return state;
    if (action.from === "discard") {
      const top = state.discard[state.discard.length - 1];
      if (!top) return state;
      if (top.kind === "skip") return state; // can't pick up skip
      const newDiscard = state.discard.slice(0, -1);
      const newHand = [...state.hands[0]!, top];
      return {
        ...setHand(state, 0, newHand),
        discard: newDiscard,
        stage: "play",
        message: `Picked up ${describeCard(top)}. Lay phase or discard.`,
        lastAction: "",
      };
    }
    // stock
    const r = drawTopOfStock(state);
    const newHand = [...state.hands[0]!, r.card];
    return {
      ...setHand({ ...state, draw: r.draw, discard: r.discard, rngSeed: r.rngSeed }, 0, newHand),
      stage: "play",
      message: `Drew ${describeCard(r.card)}. Lay phase or discard.`,
      lastAction: "",
    };
  }

  if (action.type === "toggle-select") {
    if (state.stage !== "play") return state;
    const sel = state.selected.includes(action.cardId)
      ? state.selected.filter((id) => id !== action.cardId)
      : [...state.selected, action.cardId];
    return { ...state, selected: sel };
  }

  if (action.type === "lay-down") {
    if (state.stage !== "play") return state;
    if (state.laidThisRound[0]) return state;
    const ids = new Set(state.selected);
    const subset = state.hands[0]!.filter((c) => ids.has(c.id));
    const goal = PHASES[state.phaseOf[0]! - 1]!;
    if (!canFormPhase(subset, goal)) {
      return { ...state, message: `Selected cards don't form Phase ${goal.index}: ${goal.desc}.` };
    }
    const remaining = state.hands[0]!.filter((c) => !ids.has(c.id));
    const laid = state.laidThisRound.slice();
    laid[0] = true;
    return {
      ...setHand({ ...state, laidThisRound: laid }, 0, remaining),
      selected: [],
      message: `Laid down Phase ${goal.index}! Now discard a card to end your turn.`,
      lastAction: `You laid down Phase ${goal.index}.`,
    };
  }

  if (action.type === "discard") {
    if (state.stage !== "play") return state;
    const hand = state.hands[0]!;
    const idx = hand.findIndex((c) => c.id === action.cardId);
    if (idx < 0) return state;
    const card = hand[idx]!;
    const afterDiscard = hand.filter((_, i) => i !== idx);
    let s = setHand(state, 0, afterDiscard);
    s = { ...s, discard: [...s.discard, card], selected: [] };

    if (afterDiscard.length === 0 && s.laidThisRound[0]) {
      return endRound(s, 0);
    }
    return {
      ...s,
      stage: "draw",
      current: 1,
      message: `Discarded ${describeCard(card)}. CPU 1 thinking…`,
      lastAction: `You discarded ${describeCard(card)}.`,
    };
  }

  return state;
}

// ─── Terminal ───────────────────────────────────────────────────────────────

export function isTerminal(state: P10State): { score: number } | null {
  if (state.stage !== "done") return null;
  if (state.winner !== 0) return { score: 0 };
  // Player won: higher score = better. Map: 1000 - penalty (clamped >= 1).
  const penalty = state.scores[0] ?? 0;
  return { score: Math.max(1, 1000 - penalty) };
}
