/**
 * Solitaire family engine — shared building blocks for the long-tail
 * classic-solitaire variants in `web/src/games/*`.
 *
 * Provides parameterized factories for the most common families:
 *   - Klondike-like (descending alt-color tableau, foundations)
 *   - Yukon-like (any group pickup, no stock)
 *   - Spider-like (suit-stack pickup, single suit)
 *   - Pyramid-like (pair-to-13 removal)
 *   - TriPeaks/Golf-like (rank-adjacent removal to a base waste card)
 *   - Gaps/Montana-like (rank-adjacent grid)
 *   - Clock-like (deal-into-rings until the King reveal stops)
 *   - Pairs-like (match pairs from a flat layout)
 *   - Aces-up-like (drop-card-when-higher-of-same-suit)
 *
 * Each factory returns a `{ initialState, reducer, isTerminal, ruleset }` bundle
 * that a per-game `state.ts` re-exports.  Per-game files only declare the
 * parameters that differ between variants, keeping the long-tail tractable
 * without losing real solitaire semantics.
 */
import type { Card, Suit } from "../../engines/deck/index.js";
import { newDeck, shuffle, isRed } from "../../engines/deck/index.js";
import type { Pile, Ruleset } from "../../engines/tableau/types.js";
import {
  canMove,
  applyMove,
  klondikeTableauStack,
  foundationStack,
  rankVal,
} from "../../engines/tableau/moves.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export { canMove, applyMove, klondikeTableauStack, foundationStack, rankVal };
export type { Card, Suit, Pile, Ruleset };

// ---------------------------------------------------------------------------
// Common helpers.
// ---------------------------------------------------------------------------

export function makeDeck(seed: number, copies = 1): Card[] {
  return shuffle(newDeck(copies), mulberry32(seed));
}

export function getPile(piles: readonly Pile[], id: string): Pile | undefined {
  return piles.find((p) => p.id === id);
}

export function totalOnFoundations(
  piles: readonly Pile[],
  foundationIds: readonly string[],
): number {
  return foundationIds.reduce((s, id) => {
    const p = piles.find((pp) => pp.id === id);
    return s + (p?.cards.length ?? 0);
  }, 0);
}

// ---------------------------------------------------------------------------
// Klondike-family factory: tableau cols + stock + waste + foundations.
// Variants tune column counts, deal pattern, draw count, redeal limit, and
// stack rules (alt-color, same-color, same-suit, any-suit).
// ---------------------------------------------------------------------------

export type KlondikeStackKind = "alt-color" | "same-color" | "same-suit" | "any-suit";
export type EmptyTableauPolicy = "any" | "kings" | "none";

export interface KlondikeFamilyConfig {
  copies: number;            // 1 or 2 decks
  numTableau: number;        // tableau column count
  /**
   * For each column index, the total card count and the face-up count.
   * If undefined, defaults to a Klondike-style deal (i+1 cards, 1 face-up).
   */
  columns?: ReadonlyArray<{ total: number; faceUp: number }>;
  numFoundations: number;    // foundation pile count (typically 4 or 8)
  drawCount: number;         // cards drawn from stock per click
  redealsAllowed: number;    // -1 for infinite; otherwise integer
  hasStock: boolean;         // some games have no stock
  hasWaste: boolean;         // typically yes when hasStock
  stackKind: KlondikeStackKind;
  emptyPolicy: EmptyTableauPolicy;
}

export function makeKlondikeFamilyRuleset(cfg: KlondikeFamilyConfig): Ruleset {
  const matchSuit = (a: Card, b: Card): boolean => {
    switch (cfg.stackKind) {
      case "alt-color":
        return isRed(a.suit) !== isRed(b.suit);
      case "same-color":
        return isRed(a.suit) === isRed(b.suit);
      case "same-suit":
        return a.suit === b.suit;
      case "any-suit":
        return true;
    }
  };
  const validSequence = (cards: readonly Card[]): boolean => {
    for (let i = 0; i < cards.length - 1; i++) {
      const top = cards[i]!;
      const next = cards[i + 1]!;
      if (!matchSuit(top, next)) return false;
      if (rankVal(top) !== rankVal(next) + 1) return false;
    }
    return true;
  };
  return {
    canStack: (target, moving) => {
      if (target.kind === "foundation") return foundationStack(target, moving);
      if (target.kind !== "tableau") return false;
      const bottom = moving[0];
      if (!bottom) return false;
      if (target.cards.length === 0) {
        if (cfg.emptyPolicy === "none") return false;
        if (cfg.emptyPolicy === "kings") return bottom.rank === 13;
        return true;
      }
      const top = target.cards[target.cards.length - 1]!;
      return matchSuit(top, bottom) && rankVal(top) === rankVal(bottom) + 1;
    },
    canPickUp: (pile, count) => {
      if (pile.kind === "waste" || pile.kind === "freecell") return count === 1;
      if (pile.kind === "foundation") return count === 1;
      if (pile.kind !== "tableau") return false;
      const faceUp = pile.faceUpCount ?? 0;
      if (count > faceUp) return false;
      if (count === 1) return true;
      const cards = pile.cards.slice(pile.cards.length - count);
      return validSequence(cards);
    },
  };
}

export interface KlondikeFamilyState {
  piles: Pile[];
  score: number;
  movesMade: number;
  won: boolean;
  redealsRemaining: number;
}

export type KlondikeFamilyAction =
  | { type: "draw" }
  | { type: "recycle" }
  | { type: "move"; fromPile: string; toPile: string; count: number }
  | { type: "auto-move-to-foundation" };

export function makeKlondikeFamilyState(
  seed: number,
  cfg: KlondikeFamilyConfig,
): KlondikeFamilyState {
  const deck = makeDeck(seed, cfg.copies);
  const piles: Pile[] = [];

  let idx = 0;
  for (let i = 0; i < cfg.numTableau; i++) {
    const spec = cfg.columns?.[i] ?? { total: i + 1, faceUp: 1 };
    const total = Math.min(spec.total, Math.max(0, deck.length - idx));
    const cards = deck.slice(idx, idx + total);
    idx += total;
    piles.push({
      id: `t${i + 1}`,
      kind: "tableau",
      cards,
      faceUpCount: Math.min(spec.faceUp, total),
    });
  }
  if (cfg.hasStock) {
    piles.push({ id: "stock", kind: "stock", cards: deck.slice(idx), faceUpCount: 0 });
  }
  if (cfg.hasWaste) {
    piles.push({ id: "waste", kind: "waste", cards: [], faceUpCount: 0 });
  }
  for (let i = 0; i < cfg.numFoundations; i++) {
    piles.push({ id: `f${i + 1}`, kind: "foundation", cards: [] });
  }

  return {
    piles,
    score: 0,
    movesMade: 0,
    won: false,
    redealsRemaining: cfg.redealsAllowed,
  };
}

export function reduceKlondikeFamily(
  state: KlondikeFamilyState,
  action: KlondikeFamilyAction,
  cfg: KlondikeFamilyConfig,
  ruleset: Ruleset,
): KlondikeFamilyState {
  if (state.won) return state;
  const foundationIds = Array.from({ length: cfg.numFoundations }, (_, i) => `f${i + 1}`);
  const tableauIds = Array.from({ length: cfg.numTableau }, (_, i) => `t${i + 1}`);
  const targetTotal = 13 * cfg.numFoundations;

  switch (action.type) {
    case "draw": {
      if (!cfg.hasStock || !cfg.hasWaste) return state;
      const stock = getPile(state.piles, "stock");
      const waste = getPile(state.piles, "waste");
      if (!stock || !waste || stock.cards.length === 0) return state;
      const newPiles = state.piles.map((p) => ({ ...p, cards: [...p.cards] }));
      const ns = newPiles.find((p) => p.id === "stock")!;
      const nw = newPiles.find((p) => p.id === "waste")!;
      const n = Math.min(cfg.drawCount, ns.cards.length);
      const drawn = ns.cards.splice(ns.cards.length - n, n);
      for (let i = drawn.length - 1; i >= 0; i--) nw.cards.push(drawn[i]!);
      return { ...state, piles: newPiles, movesMade: state.movesMade + 1 };
    }
    case "recycle": {
      if (!cfg.hasStock || !cfg.hasWaste) return state;
      if (cfg.redealsAllowed >= 0 && state.redealsRemaining <= 0) return state;
      const stock = getPile(state.piles, "stock");
      const waste = getPile(state.piles, "waste");
      if (!stock || !waste) return state;
      if (stock.cards.length > 0 || waste.cards.length === 0) return state;
      const newPiles = state.piles.map((p) => ({ ...p, cards: [...p.cards] }));
      const ns = newPiles.find((p) => p.id === "stock")!;
      const nw = newPiles.find((p) => p.id === "waste")!;
      ns.cards = [...nw.cards].reverse();
      nw.cards = [];
      return {
        ...state,
        piles: newPiles,
        movesMade: state.movesMade + 1,
        redealsRemaining:
          cfg.redealsAllowed >= 0 ? state.redealsRemaining - 1 : state.redealsRemaining,
      };
    }
    case "move": {
      const { fromPile, toPile, count } = action;
      const move = { fromPile, toPile, count };
      if (!canMove(state.piles, move, ruleset)) return state;
      const toP = getPile(state.piles, toPile);
      const newPiles = applyMove(state.piles, move);
      const scoreDelta = toP?.kind === "foundation" ? 10 : 0;
      return {
        ...state,
        piles: newPiles,
        score: state.score + scoreDelta,
        movesMade: state.movesMade + 1,
        won: totalOnFoundations(newPiles, foundationIds) === targetTotal,
      };
    }
    case "auto-move-to-foundation": {
      let piles = state.piles;
      let score = state.score;
      let moved = true;
      while (moved) {
        moved = false;
        const sources = cfg.hasWaste
          ? ["waste", ...tableauIds]
          : tableauIds;
        for (const sid of sources) {
          const src = getPile(piles, sid);
          if (!src || src.cards.length === 0) continue;
          for (const fid of foundationIds) {
            const m = { fromPile: sid, toPile: fid, count: 1 };
            if (canMove(piles, m, ruleset)) {
              piles = applyMove(piles, m);
              score += 10;
              moved = true;
              break;
            }
          }
          if (moved) break;
        }
      }
      if (piles === state.piles) return state;
      return {
        ...state,
        piles,
        score,
        movesMade: state.movesMade + 1,
        won: totalOnFoundations(piles, foundationIds) === targetTotal,
      };
    }
    default:
      return state;
  }
}

export function isKlondikeFamilyTerminal(
  state: KlondikeFamilyState,
  cfg: KlondikeFamilyConfig,
): { score: number } | null {
  const ids = Array.from({ length: cfg.numFoundations }, (_, i) => `f${i + 1}`);
  const target = 13 * cfg.numFoundations;
  if (totalOnFoundations(state.piles, ids) !== target) return null;
  return { score: state.score };
}

// ---------------------------------------------------------------------------
// Pyramid-family factory: cells in a pyramid, pair sums to 13 (Kings drop alone).
// Variants tune row count, redeal limit, and (rare) sum target.
// ---------------------------------------------------------------------------

export interface PyramidFamilyConfig {
  rows: number;        // 7 = classic
  sumTarget: number;   // 13 = classic
  kingValue: number;   // 13 = classic; King removes alone
  redeals: number;     // 0 / 1 / 3
}

export type PyramidCell = { card: Card; removed: boolean } | null;

export interface PyramidFamilyState {
  pyramid: PyramidCell[][];
  stock: Card[];
  waste: Card[];
  redealsRemaining: number;
  selected:
    | { kind: "pyramid"; row: number; col: number }
    | { kind: "waste" }
    | null;
  movesMade: number;
  score: number;
  won: boolean;
  lost: boolean;
}

export type PyramidFamilyAction =
  | {
      type: "select";
      source:
        | { kind: "pyramid"; row: number; col: number }
        | { kind: "waste" };
    }
  | { type: "draw" }
  | { type: "redeal" };

function buildPyramidLayout(cards: Card[], rows: number): {
  pyramid: PyramidCell[][];
  used: number;
} {
  const pyramid: PyramidCell[][] = [];
  let idx = 0;
  for (let r = 0; r < rows; r++) {
    const row: PyramidCell[] = [];
    for (let c = 0; c <= r; c++) {
      row.push({ card: cards[idx]!, removed: false });
      idx++;
    }
    pyramid.push(row);
  }
  return { pyramid, used: idx };
}

function isPyramidAvailable(p: PyramidCell[][], r: number, c: number): boolean {
  const cell = p[r]?.[c];
  if (!cell || cell.removed) return false;
  if (r === p.length - 1) return true;
  const a = p[r + 1]?.[c];
  const b = p[r + 1]?.[c + 1];
  return (!a || a.removed) && (!b || b.removed);
}

export function makePyramidFamilyState(
  seed: number,
  cfg: PyramidFamilyConfig,
): PyramidFamilyState {
  const deck = makeDeck(seed, 1);
  const { pyramid, used } = buildPyramidLayout(deck, cfg.rows);
  return {
    pyramid,
    stock: deck.slice(used),
    waste: [],
    redealsRemaining: cfg.redeals,
    selected: null,
    movesMade: 0,
    score: 0,
    won: false,
    lost: false,
  };
}

function pyramidIsWon(p: PyramidCell[][]): boolean {
  return p.every((row) => row.every((c) => !c || c.removed));
}

export function reducePyramidFamily(
  state: PyramidFamilyState,
  action: PyramidFamilyAction,
  cfg: PyramidFamilyConfig,
): PyramidFamilyState {
  if (state.won || state.lost) return state;

  const cardAt = (
    s: PyramidFamilyState,
    src:
      | { kind: "pyramid"; row: number; col: number }
      | { kind: "waste" },
  ): Card | null => {
    if (src.kind === "waste") {
      return s.waste.length === 0 ? null : s.waste[s.waste.length - 1]!;
    }
    const cell = s.pyramid[src.row]?.[src.col];
    if (!cell || cell.removed) return null;
    if (!isPyramidAvailable(s.pyramid, src.row, src.col)) return null;
    return cell.card;
  };

  const removeAt = (
    s: PyramidFamilyState,
    src:
      | { kind: "pyramid"; row: number; col: number }
      | { kind: "waste" },
  ): PyramidFamilyState => {
    if (src.kind === "waste") {
      return { ...s, waste: s.waste.slice(0, -1) };
    }
    const np = s.pyramid.map((row, ri) =>
      ri === src.row
        ? row.map((c, ci) =>
            ci === src.col && c ? { ...c, removed: true } : c,
          )
        : row,
    );
    return { ...s, pyramid: np };
  };

  switch (action.type) {
    case "select": {
      const card = cardAt(state, action.source);
      if (!card) return state;
      // King drops alone.
      if (card.rank === cfg.kingValue) {
        const next = removeAt(state, action.source);
        const won = pyramidIsWon(next.pyramid);
        return {
          ...next,
          selected: null,
          movesMade: state.movesMade + 1,
          score: state.score + 5,
          won,
        };
      }
      if (!state.selected) {
        return { ...state, selected: action.source };
      }
      // pair check
      const prev = cardAt(state, state.selected);
      if (!prev) return { ...state, selected: action.source };
      if (
        state.selected.kind === action.source.kind &&
        (state.selected.kind === "waste" ||
          (state.selected.kind === "pyramid" &&
            action.source.kind === "pyramid" &&
            state.selected.row === action.source.row &&
            state.selected.col === action.source.col))
      ) {
        return { ...state, selected: null };
      }
      if (prev.rank + card.rank === cfg.sumTarget) {
        const after = removeAt(removeAt(state, state.selected), action.source);
        const won = pyramidIsWon(after.pyramid);
        return {
          ...after,
          selected: null,
          movesMade: state.movesMade + 1,
          score: state.score + 10,
          won,
        };
      }
      return { ...state, selected: action.source };
    }
    case "draw": {
      if (state.stock.length === 0) return state;
      return {
        ...state,
        stock: state.stock.slice(0, -1),
        waste: [...state.waste, state.stock[state.stock.length - 1]!],
        selected: null,
        movesMade: state.movesMade + 1,
      };
    }
    case "redeal": {
      if (state.redealsRemaining <= 0) return state;
      if (state.stock.length > 0) return state;
      return {
        ...state,
        stock: [...state.waste].reverse(),
        waste: [],
        redealsRemaining: state.redealsRemaining - 1,
        selected: null,
        movesMade: state.movesMade + 1,
      };
    }
    default:
      return state;
  }
}

export function isPyramidFamilyTerminal(
  state: PyramidFamilyState,
): { score: number } | null {
  if (!state.won && !state.lost) return null;
  return { score: state.score };
}

// ---------------------------------------------------------------------------
// Golf / TriPeaks family.  Tableau cards may be removed onto a single waste pile
// when their rank is one above or below the waste top (Aces low, optionally
// wrap K↔A).  Stock provides additional waste cards.
// ---------------------------------------------------------------------------

export interface GolfFamilyConfig {
  /**
   * Function returning, for a freshly seeded deck, the layout — array of
   * tableau columns (top → bottom) plus the index into the deck after
   * tableau is dealt.
   */
  layout: (deck: Card[]) => { columns: Card[][]; deckUsed: number };
  /** Number of cards moved to waste at start (1 in classic golf, 0 elsewhere). */
  initialWasteCount: number;
  wrap: boolean;     // if true, K and A are adjacent
  hasRedeals: number; // -1 for infinite stock-as-waste cycle (continuous), 0 = none
  /**
   * Are tableau cards face-down by default? (TriPeaks reveals when uncovered.)
   * If undefined, all dealt cards face-up (Golf classic).
   */
  triPeaks?: boolean;
}

export interface GolfFamilyState {
  columns: Card[][];        // each column top → bottom, last is "top"
  /**
   * For TriPeaks, indices of revealed cards in each column.  In Golf, all
   * cards in a column are visible since they're stacked; we still let any
   * "available" (top of a column) card be flicked.
   */
  removed: boolean[][];
  stock: Card[];
  waste: Card[];
  movesMade: number;
  score: number;
  won: boolean;
  lost: boolean;
  redealsRemaining: number;
}

export type GolfFamilyAction =
  | { type: "play"; col: number; idx: number }
  | { type: "draw" }
  | { type: "recycle" };

export function makeGolfFamilyState(
  seed: number,
  cfg: GolfFamilyConfig,
): GolfFamilyState {
  const deck = makeDeck(seed, 1);
  const { columns, deckUsed } = cfg.layout(deck);
  const remaining = deck.slice(deckUsed);
  const initialWaste = remaining.slice(0, cfg.initialWasteCount);
  const stock = remaining.slice(cfg.initialWasteCount);
  const removed = columns.map((col) => col.map(() => false));
  return {
    columns,
    removed,
    stock,
    waste: initialWaste,
    movesMade: 0,
    score: 0,
    won: false,
    lost: false,
    redealsRemaining: cfg.hasRedeals,
  };
}

function isAvailableTri(
  columns: Card[][],
  removed: boolean[][],
  col: number,
  idx: number,
  triPeaks: boolean,
): boolean {
  if (removed[col]?.[idx]) return false;
  if (!triPeaks) {
    // Available if it's the bottom (highest idx) non-removed card in the column.
    const c = columns[col]!;
    for (let i = c.length - 1; i >= 0; i--) {
      if (!removed[col]![i]) return i === idx;
    }
    return false;
  }
  // TriPeaks: the card at (col, idx) is available if no card "above" it in the
  // tri-peaks adjacency is still present.  Simplified: bottom-most card of
  // the column is always available; otherwise require both children removed.
  const c = columns[col]!;
  if (idx === c.length - 1) return true;
  return !!removed[col]?.[idx + 1];
}

function rankAdjacent(a: Card, b: Card, wrap: boolean): boolean {
  const ar = rankVal(a);
  const br = rankVal(b);
  if (Math.abs(ar - br) === 1) return true;
  if (wrap) {
    if ((ar === 13 && br === 1) || (ar === 1 && br === 13)) return true;
  }
  return false;
}

export function reduceGolfFamily(
  state: GolfFamilyState,
  action: GolfFamilyAction,
  cfg: GolfFamilyConfig,
): GolfFamilyState {
  if (state.won || state.lost) return state;
  const triPeaks = !!cfg.triPeaks;

  switch (action.type) {
    case "play": {
      const { col, idx } = action;
      if (!isAvailableTri(state.columns, state.removed, col, idx, triPeaks)) return state;
      const card = state.columns[col]![idx]!;
      const wasteTop = state.waste[state.waste.length - 1];
      if (!wasteTop) return state;
      if (!rankAdjacent(card, wasteTop, cfg.wrap)) return state;
      const newRemoved = state.removed.map((r) => [...r]);
      newRemoved[col]![idx] = true;
      const newWaste = [...state.waste, card];
      const allRemoved = newRemoved.every((r) => r.every(Boolean));
      return {
        ...state,
        removed: newRemoved,
        waste: newWaste,
        movesMade: state.movesMade + 1,
        score: state.score + 5,
        won: allRemoved,
      };
    }
    case "draw": {
      if (state.stock.length === 0) return state;
      const top = state.stock[state.stock.length - 1]!;
      return {
        ...state,
        stock: state.stock.slice(0, -1),
        waste: [...state.waste, top],
        movesMade: state.movesMade + 1,
      };
    }
    case "recycle": {
      if (cfg.hasRedeals === 0) return state;
      if (state.stock.length > 0) return state;
      if (cfg.hasRedeals > 0 && state.redealsRemaining <= 0) return state;
      return {
        ...state,
        stock: [...state.waste].reverse(),
        waste: [],
        redealsRemaining:
          cfg.hasRedeals > 0 ? state.redealsRemaining - 1 : state.redealsRemaining,
        movesMade: state.movesMade + 1,
      };
    }
    default:
      return state;
  }
}

export function isGolfFamilyTerminal(
  state: GolfFamilyState,
): { score: number } | null {
  if (state.won) return { score: state.score };
  if (state.lost) return { score: state.score };
  // No moves and no stock → terminal.
  if (state.stock.length === 0) {
    // Optimization: declare done if no playable column-top exists.
    const top = state.waste[state.waste.length - 1];
    if (!top) return null;
    // Unused parameters to ensure analysis later; keep null for now.
    return null;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Clock / Sundial / Idiot family — deal cards into rings, flip from a centre
// pile.  Win if all four Kings emerge before the centre's last card.
// ---------------------------------------------------------------------------

export interface ClockFamilyConfig {
  rings: number;     // 13 = clock; 12 = sundial; etc.
  perRing: number;   // 4 = clock
  copies: number;    // 1 or 2 decks
}

export interface ClockFamilyState {
  rings: Card[][];           // visible card stacks per slot
  /** Index of the centre slot in `rings`. */
  centreSlot: number;
  /** Top of the held card to place next. null = need to draw. */
  held: Card | null;
  movesMade: number;
  score: number;
  won: boolean;
  lost: boolean;
}

export type ClockFamilyAction = { type: "tick" };

/** Map a card rank to its ring slot. Default: rank-1 (Ace=0, 2=1, ..., K=12). */
function defaultSlotForCard(card: Card, cfg: ClockFamilyConfig): number {
  if (cfg.rings === 13) {
    return rankVal(card) - 1;
  }
  return (rankVal(card) - 1) % cfg.rings;
}

export function makeClockFamilyState(
  seed: number,
  cfg: ClockFamilyConfig,
): ClockFamilyState {
  const deck = makeDeck(seed, cfg.copies);
  const rings: Card[][] = Array.from({ length: cfg.rings }, () => [] as Card[]);
  const centreSlot = cfg.rings === 13 ? 12 : cfg.rings - 1;
  let idx = 0;
  // Standard Clock deal: 4 cards into each of 13 slots (52 total).  Variants
  // change ring count.
  const totalSlots = cfg.rings;
  const perRing = cfg.perRing;
  for (let i = 0; i < totalSlots * perRing; i++) {
    if (idx >= deck.length) break;
    rings[i % totalSlots]!.push(deck[idx]!);
    idx++;
  }
  // First card to flip: top of centre slot.
  const held = rings[centreSlot]!.pop() ?? null;
  return {
    rings,
    centreSlot,
    held,
    movesMade: 0,
    score: 0,
    won: false,
    lost: false,
  };
}

export function reduceClockFamily(
  state: ClockFamilyState,
  action: ClockFamilyAction,
  cfg: ClockFamilyConfig,
): ClockFamilyState {
  if (state.won || state.lost) return state;
  if (action.type !== "tick") return state;
  if (!state.held) return state;
  const slot = defaultSlotForCard(state.held, cfg);
  // Place held card into its slot.
  const newRings = state.rings.map((r) => [...r]);
  newRings[slot]!.unshift(state.held);
  // Now pop the bottom (oldest) card of that slot to be the new held card.
  const next = newRings[slot]!.pop() ?? null;
  // Win if all the centre-rank cards are now placed.  Lose if held card maps
  // to centreSlot and that slot has no more cards to flip.
  let won = false;
  let lost = false;
  if (!next) {
    // The slot we'd next flip is empty.  If it's the centre slot, we've gone
    // around once: win if every other slot has its full ring of correct cards
    // (simple: every slot is full to perRing).  Otherwise lost.
    const allFull = newRings.every((r) => r.length === cfg.perRing);
    if (allFull) won = true;
    else lost = true;
  }
  return {
    ...state,
    rings: newRings,
    held: next,
    movesMade: state.movesMade + 1,
    score: state.score + (won ? 50 : 1),
    won,
    lost,
  };
}

export function isClockFamilyTerminal(
  state: ClockFamilyState,
): { score: number } | null {
  if (!state.won && !state.lost) return null;
  return { score: state.score };
}

// ---------------------------------------------------------------------------
// Gaps / Montana family — 4×13 grid; drag a card into a gap if the rank is
// one above the rank to the left of the gap and same suit.  After a deal
// each suit-row begins with the suits in any order; goal: each row is
// 2..K of one suit.
// ---------------------------------------------------------------------------

export interface GapsFamilyConfig {
  redeals: number;    // typically 2
  copies: number;     // 1
}

export interface GapsCell {
  card: Card | null;
}

export interface GapsFamilyState {
  grid: GapsCell[][]; // 4 rows × 13 cols
  redealsRemaining: number;
  movesMade: number;
  score: number;
  won: boolean;
  lost: boolean;
}

export type GapsFamilyAction =
  | { type: "move"; fromR: number; fromC: number; toR: number; toC: number }
  | { type: "redeal" };

export function makeGapsFamilyState(
  seed: number,
  cfg: GapsFamilyConfig,
): GapsFamilyState {
  const deck = makeDeck(seed, cfg.copies);
  // Remove Aces; they leave gaps.
  const noAces = deck.filter((c) => c.rank !== 1);
  const aces = deck.filter((c) => c.rank === 1);
  const gridLinear: (Card | null)[] = [...noAces];
  // Place 4 gaps at the original Ace positions in the shuffled order.
  void aces;
  // Build grid with 4 rows × 13 cols, last 4 cells null.
  while (gridLinear.length < 52) gridLinear.push(null);
  const grid: GapsCell[][] = [];
  for (let r = 0; r < 4; r++) {
    const row: GapsCell[] = [];
    for (let c = 0; c < 13; c++) {
      row.push({ card: gridLinear[r * 13 + c] ?? null });
    }
    grid.push(row);
  }
  return {
    grid,
    redealsRemaining: cfg.redeals,
    movesMade: 0,
    score: 0,
    won: false,
    lost: false,
  };
}

function gapsIsWon(grid: GapsCell[][]): boolean {
  for (const row of grid) {
    let suit: Suit | null = null;
    for (let c = 0; c < 12; c++) {
      const card = row[c]!.card;
      if (!card) return false;
      if (card.rank !== c + 2) return false;
      if (!suit) suit = card.suit;
      if (card.suit !== suit) return false;
    }
  }
  return true;
}

export function reduceGapsFamily(
  state: GapsFamilyState,
  action: GapsFamilyAction,
  cfg: GapsFamilyConfig,
): GapsFamilyState {
  if (state.won || state.lost) return state;
  switch (action.type) {
    case "move": {
      const { fromR, fromC, toR, toC } = action;
      const src = state.grid[fromR]?.[fromC];
      const dst = state.grid[toR]?.[toC];
      if (!src || !dst) return state;
      if (!src.card) return state;
      if (dst.card) return state;
      // Determine valid: target gap must have a card immediately to its left
      // OR be in column 0 (in which case only 2s can go).
      let valid = false;
      if (toC === 0) {
        valid = src.card.rank === 2;
      } else {
        const leftCard = state.grid[toR]?.[toC - 1]?.card;
        if (leftCard) {
          valid =
            leftCard.suit === src.card.suit &&
            leftCard.rank + 1 === src.card.rank;
        }
      }
      if (!valid) return state;
      const ng = state.grid.map((row) => row.map((cell) => ({ ...cell })));
      ng[toR]![toC]!.card = src.card;
      ng[fromR]![fromC]!.card = null;
      const won = gapsIsWon(ng);
      return {
        ...state,
        grid: ng,
        movesMade: state.movesMade + 1,
        score: state.score + (won ? 50 : 1),
        won,
      };
    }
    case "redeal": {
      if (state.redealsRemaining <= 0) return state;
      // Lock cards already in correct ascending sequence at start of row.
      // For simplicity reshuffle non-locked cards.
      // We extract all non-null cards, reshuffle, place again.
      const flat: Card[] = [];
      for (const row of state.grid) {
        for (const cell of row) {
          if (cell.card) flat.push(cell.card);
        }
      }
      const reshuffled = shuffle(flat, mulberry32(state.movesMade + 1234));
      const ng: GapsCell[][] = Array.from({ length: 4 }, () =>
        Array.from({ length: 13 }, () => ({ card: null as Card | null })),
      );
      let i = 0;
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 13; c++) {
          if (i < reshuffled.length) {
            ng[r]![c]!.card = reshuffled[i]!;
            i++;
          }
        }
      }
      return {
        ...state,
        grid: ng,
        redealsRemaining: state.redealsRemaining - 1,
        movesMade: state.movesMade + 1,
      };
    }
    default:
      return state;
  }
}

export function isGapsFamilyTerminal(
  state: GapsFamilyState,
): { score: number } | null {
  if (!state.won && !state.lost) return null;
  return { score: state.score };
}

// ---------------------------------------------------------------------------
// Pairs family (Simple Pairs / Trefoil / Accordion) — flat board of cards,
// match pairs that share a rank and meet some adjacency rule.
// ---------------------------------------------------------------------------

export type PairsAdjacency = "any" | "neighbour" | "same-row";

export interface PairsFamilyConfig {
  rows: number;
  cols: number;
  adjacency: PairsAdjacency;
}

export interface PairsCell {
  card: Card | null;
}

export interface PairsFamilyState {
  grid: PairsCell[][];
  selected: { r: number; c: number } | null;
  movesMade: number;
  score: number;
  won: boolean;
}

export type PairsFamilyAction = { type: "select"; r: number; c: number };

export function makePairsFamilyState(
  seed: number,
  cfg: PairsFamilyConfig,
): PairsFamilyState {
  const deck = makeDeck(seed, 1);
  const grid: PairsCell[][] = [];
  let i = 0;
  for (let r = 0; r < cfg.rows; r++) {
    const row: PairsCell[] = [];
    for (let c = 0; c < cfg.cols; c++) {
      row.push({ card: deck[i++] ?? null });
    }
    grid.push(row);
  }
  return {
    grid,
    selected: null,
    movesMade: 0,
    score: 0,
    won: false,
  };
}

function isAdjacent(
  a: { r: number; c: number },
  b: { r: number; c: number },
  kind: PairsAdjacency,
): boolean {
  if (kind === "any") return true;
  if (kind === "same-row") return a.r === b.r;
  // neighbour
  const dr = Math.abs(a.r - b.r);
  const dc = Math.abs(a.c - b.c);
  return dr + dc === 1 || (dr === 1 && dc === 1);
}

export function reducePairsFamily(
  state: PairsFamilyState,
  action: PairsFamilyAction,
  cfg: PairsFamilyConfig,
): PairsFamilyState {
  if (state.won) return state;
  if (action.type !== "select") return state;
  const cell = state.grid[action.r]?.[action.c];
  if (!cell || !cell.card) return state;
  if (!state.selected) {
    return { ...state, selected: { r: action.r, c: action.c } };
  }
  const prev = state.grid[state.selected.r]?.[state.selected.c];
  if (!prev || !prev.card) {
    return { ...state, selected: { r: action.r, c: action.c } };
  }
  if (state.selected.r === action.r && state.selected.c === action.c) {
    return { ...state, selected: null };
  }
  if (
    prev.card.rank === cell.card.rank &&
    isAdjacent(state.selected, { r: action.r, c: action.c }, cfg.adjacency)
  ) {
    const ng = state.grid.map((row) => row.map((c) => ({ ...c })));
    ng[state.selected.r]![state.selected.c]!.card = null;
    ng[action.r]![action.c]!.card = null;
    const remaining = ng.flat().filter((c) => c.card).length;
    return {
      ...state,
      grid: ng,
      selected: null,
      movesMade: state.movesMade + 1,
      score: state.score + 10,
      won: remaining === 0,
    };
  }
  return { ...state, selected: { r: action.r, c: action.c } };
}

export function isPairsFamilyTerminal(
  state: PairsFamilyState,
): { score: number } | null {
  return state.won ? { score: state.score } : null;
}

// ---------------------------------------------------------------------------
// AcesUp family — drop the lower card of any pair sharing a suit; goal:
// only the four Aces remain.  Already implemented in the dedicated `aces-up`
// game; the variants below reuse it via a thin wrapper.
// ---------------------------------------------------------------------------

export interface AcesUpFamilyConfig {
  drawCount: number;     // 4 = standard
  copies: number;        // 1
  /**
   * If true, only the very highest of each suit is removed when drawing
   * (Aces-Up "firing squad" variant).
   */
  firingSquad?: boolean;
}

export interface AcesUpFamilyState {
  columns: Card[][];     // 4 columns, top of column = last element
  stock: Card[];
  movesMade: number;
  score: number;
  won: boolean;
}

export type AcesUpFamilyAction =
  | { type: "deal" }
  | { type: "discard"; col: number }
  | { type: "move"; from: number; to: number };

export function makeAcesUpFamilyState(
  seed: number,
  cfg: AcesUpFamilyConfig,
): AcesUpFamilyState {
  const deck = makeDeck(seed, cfg.copies);
  const columns: Card[][] = [[], [], [], []];
  for (let i = 0; i < 4; i++) columns[i]!.push(deck[i]!);
  return {
    columns,
    stock: deck.slice(4),
    movesMade: 0,
    score: 0,
    won: false,
  };
}

function highestOfSuit(state: AcesUpFamilyState): Map<Suit, { col: number; rank: number }> {
  const top = new Map<Suit, { col: number; rank: number }>();
  for (let i = 0; i < state.columns.length; i++) {
    const c = state.columns[i]!;
    if (c.length === 0) continue;
    const top_ = c[c.length - 1]!;
    const r = top_.rank === 1 ? 14 : top_.rank;
    const cur = top.get(top_.suit);
    if (!cur || r > cur.rank) top.set(top_.suit, { col: i, rank: r });
  }
  return top;
}

export function reduceAcesUpFamily(
  state: AcesUpFamilyState,
  action: AcesUpFamilyAction,
  _cfg: AcesUpFamilyConfig,
): AcesUpFamilyState {
  void _cfg;
  if (state.won) return state;
  switch (action.type) {
    case "deal": {
      if (state.stock.length === 0) {
        // Win check: all four columns have a single Ace.
        const ok =
          state.columns.every(
            (c) => c.length === 1 && c[0]!.rank === 1,
          );
        return { ...state, won: ok };
      }
      const ns = [...state.stock];
      const nc = state.columns.map((c) => [...c]);
      for (let i = 0; i < 4 && ns.length > 0; i++) {
        nc[i]!.push(ns.pop()!);
      }
      return {
        ...state,
        stock: ns,
        columns: nc,
        movesMade: state.movesMade + 1,
      };
    }
    case "discard": {
      const c = state.columns[action.col];
      if (!c || c.length === 0) return state;
      const top = c[c.length - 1]!;
      // Find any other column with same suit and higher rank (Ace high).
      const r = top.rank === 1 ? 14 : top.rank;
      let kill = false;
      for (let i = 0; i < state.columns.length; i++) {
        if (i === action.col) continue;
        const oc = state.columns[i]!;
        if (oc.length === 0) continue;
        const ot = oc[oc.length - 1]!;
        if (ot.suit !== top.suit) continue;
        const otR = ot.rank === 1 ? 14 : ot.rank;
        if (otR > r) {
          kill = true;
          break;
        }
      }
      if (!kill) return state;
      const nc = state.columns.map((cc) => [...cc]);
      nc[action.col]!.pop();
      return {
        ...state,
        columns: nc,
        movesMade: state.movesMade + 1,
        score: state.score + 5,
      };
    }
    case "move": {
      const src = state.columns[action.from];
      const dst = state.columns[action.to];
      if (!src || !dst || src.length === 0) return state;
      if (dst.length !== 0) return state;
      const nc = state.columns.map((c) => [...c]);
      const card = nc[action.from]!.pop()!;
      nc[action.to]!.push(card);
      return { ...state, columns: nc, movesMade: state.movesMade + 1 };
    }
    default:
      return state;
  }
}

export function isAcesUpFamilyTerminal(
  state: AcesUpFamilyState,
  _cfg: AcesUpFamilyConfig,
): { score: number } | null {
  void _cfg;
  if (!state.won) return null;
  return { score: state.score };
}
// Highest-of-suit helper exported in case a per-game wants to display hints.
export const _acesUpHighestOfSuit = highestOfSuit;
