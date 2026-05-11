import { describe, expect, it } from "vitest";
import {
  makeDeck,
  getPile,
  totalOnFoundations,
  makeKlondikeFamilyRuleset,
  makeKlondikeFamilyState,
  reduceKlondikeFamily,
  isKlondikeFamilyTerminal,
  makePyramidFamilyState,
  reducePyramidFamily,
  type KlondikeFamilyConfig,
  type PyramidFamilyConfig,
} from "./solitaire-family-engine.js";

const klondikeCfg: KlondikeFamilyConfig = {
  copies: 1,
  numTableau: 7,
  numFoundations: 4,
  drawCount: 1,
  redealsAllowed: -1,
  hasStock: true,
  hasWaste: true,
  stackKind: "alt-color",
  emptyPolicy: "any",
};

describe("solitaire-family-engine", () => {
  it("makeDeck + Klondike initial deal: 52 cards distributed across 7 tableau columns (1..7), stock, waste, 4 foundations", () => {
    const deck = makeDeck(42, 1);
    expect(deck.length).toBe(52);

    const state = makeKlondikeFamilyState(42, klondikeCfg);
    // 7 tableau columns each i+1 cards = 1+2+3+4+5+6+7 = 28.
    let tableauCount = 0;
    for (let i = 1; i <= 7; i++) {
      const pile = getPile(state.piles, `t${i}`)!;
      expect(pile.kind).toBe("tableau");
      expect(pile.cards.length).toBe(i);
      expect(pile.faceUpCount).toBe(1);
      tableauCount += pile.cards.length;
    }
    expect(tableauCount).toBe(28);

    const stock = getPile(state.piles, "stock")!;
    expect(stock.kind).toBe("stock");
    expect(stock.cards.length).toBe(52 - 28); // 24 in stock

    const waste = getPile(state.piles, "waste")!;
    expect(waste.cards.length).toBe(0);

    // Foundations empty initially.
    const foundationIds = ["f1", "f2", "f3", "f4"];
    expect(totalOnFoundations(state.piles, foundationIds)).toBe(0);
    expect(state.won).toBe(false);
    expect(isKlondikeFamilyTerminal(state, klondikeCfg)).toBeNull();
  });

  it("Klondike draw moves one card stock→waste; recycle moves waste→stock when stock empty", () => {
    const ruleset = makeKlondikeFamilyRuleset(klondikeCfg);
    let state = makeKlondikeFamilyState(7, klondikeCfg);
    const initialStock = getPile(state.piles, "stock")!.cards.length;
    expect(initialStock).toBeGreaterThan(0);

    // One draw moves 1 card from stock to waste.
    state = reduceKlondikeFamily(state, { type: "draw" }, klondikeCfg, ruleset);
    expect(getPile(state.piles, "stock")!.cards.length).toBe(initialStock - 1);
    expect(getPile(state.piles, "waste")!.cards.length).toBe(1);
    expect(state.movesMade).toBe(1);

    // Drain the stock entirely.
    while (getPile(state.piles, "stock")!.cards.length > 0) {
      state = reduceKlondikeFamily(state, { type: "draw" }, klondikeCfg, ruleset);
    }
    expect(getPile(state.piles, "stock")!.cards.length).toBe(0);
    expect(getPile(state.piles, "waste")!.cards.length).toBe(initialStock);

    // Recycle: waste flips back into stock, waste becomes empty.
    const beforeRecycleWaste = getPile(state.piles, "waste")!.cards.slice();
    state = reduceKlondikeFamily(state, { type: "recycle" }, klondikeCfg, ruleset);
    expect(getPile(state.piles, "waste")!.cards.length).toBe(0);
    expect(getPile(state.piles, "stock")!.cards.length).toBe(initialStock);
    // Reversed order.
    const recycledStock = getPile(state.piles, "stock")!.cards;
    expect(recycledStock[0]).toEqual(beforeRecycleWaste[beforeRecycleWaste.length - 1]);

    // Edge case: draw with empty stock is a no-op.
    state = reduceKlondikeFamily(state, { type: "draw" }, klondikeCfg, ruleset);
    // Re-empty stock to assert no-op behaviour.
    while (getPile(state.piles, "stock")!.cards.length > 0) {
      state = reduceKlondikeFamily(state, { type: "draw" }, klondikeCfg, ruleset);
    }
    const movesBefore = state.movesMade;
    const noop = reduceKlondikeFamily(state, { type: "draw" }, klondikeCfg, ruleset);
    expect(noop.movesMade).toBe(movesBefore);
    expect(noop).toBe(state);
  });

  it("Pyramid: selecting a King removes it alone and increments score; draw moves stock→waste", () => {
    const cfg: PyramidFamilyConfig = { rows: 7, sumTarget: 13, kingValue: 13, redeals: 1 };
    // Find a seed that produces a King somewhere accessible (bottom row guarantees availability).
    let seed = 0;
    let kingPos: { row: number; col: number } | null = null;
    let state = makePyramidFamilyState(seed, cfg);
    for (seed = 0; seed < 200 && !kingPos; seed++) {
      state = makePyramidFamilyState(seed, cfg);
      const bottom = state.pyramid[state.pyramid.length - 1]!;
      for (let c = 0; c < bottom.length; c++) {
        if (bottom[c]!.card.rank === 13) {
          kingPos = { row: state.pyramid.length - 1, col: c };
          break;
        }
      }
    }
    expect(kingPos).not.toBeNull();

    const before = state;
    const after = reducePyramidFamily(
      before,
      { type: "select", source: { kind: "pyramid", row: kingPos!.row, col: kingPos!.col } },
      cfg,
    );
    // King removed (score +5, moves +1, selection cleared).
    expect(after.score).toBe(before.score + 5);
    expect(after.movesMade).toBe(before.movesMade + 1);
    expect(after.selected).toBeNull();
    expect(after.pyramid[kingPos!.row]![kingPos!.col]!.removed).toBe(true);

    // Draw from stock: waste grows by 1, stock shrinks by 1.
    const stockLenBefore = after.stock.length;
    expect(stockLenBefore).toBeGreaterThan(0);
    const afterDraw = reducePyramidFamily(after, { type: "draw" }, cfg);
    expect(afterDraw.stock.length).toBe(stockLenBefore - 1);
    expect(afterDraw.waste.length).toBe(1);
  });
});
