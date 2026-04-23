import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const settings7 = { target: "7" as const };
const settings5 = { target: "5" as const };

describe("initialState", () => {
  it("player gets 6 cards", () => expect(initialState(1, settings7).playerHand.length).toBe(6));
  it("bot gets 6 cards", () => expect(initialState(1, settings7).botHand.length).toBe(6));
  it("stock has remaining cards", () => {
    const s = initialState(1, settings7);
    expect(s.stock.length).toBe(52 - 6 - 6 - 1); // 39
  });
  it("trump suit is valid", () => {
    const s = initialState(1, settings7);
    expect(["♠", "♥", "♦", "♣"]).toContain(s.trumpSuit);
  });
  it("phase is playing", () => expect(initialState(1, settings7).phase).toBe("playing"));
  it("deterministic", () => {
    expect(initialState(42, settings7).playerHand).toEqual(initialState(42, settings7).playerHand);
  });
});

describe("reducer — playing phase", () => {
  it("playing invalid card id is no-op", () => {
    const s = initialState(1, settings7);
    const s2 = reducer(s, { type: "play", cardId: "nonexistent" });
    expect(s2).toBe(s);
  });
  it("playing a card transitions to drawing phase", () => {
    const s = initialState(1, settings7);
    const cardId = s.playerHand[0]!.id;
    const s2 = reducer(s, { type: "play", cardId });
    expect(s2.phase).toBe("drawing");
    expect(s2.currentTrick[0]).not.toBeNull();
    expect(s2.currentTrick[1]).not.toBeNull();
  });
  it("player hand shrinks after play", () => {
    const s = initialState(1, settings7);
    const s2 = reducer(s, { type: "play", cardId: s.playerHand[0]!.id });
    expect(s2.playerHand.length).toBe(5);
  });
  it("bot hand shrinks after play", () => {
    const s = initialState(1, settings7);
    const s2 = reducer(s, { type: "play", cardId: s.playerHand[0]!.id });
    expect(s2.botHand.length).toBe(5);
  });
});

describe("reducer — collectTrick", () => {
  it("collecting trick draws from stock", () => {
    let s = initialState(1, settings7);
    s = reducer(s, { type: "play", cardId: s.playerHand[0]!.id });
    const stockBefore = s.stock.length;
    s = reducer(s, { type: "collectTrick" });
    // hands should have drawn back to 6 (or stock diminished)
    const totalHand = s.playerHand.length + s.botHand.length;
    expect(totalHand).toBe(12); // 6+6 if stock had enough
    expect(s.stock.length).toBeLessThan(stockBefore + 2);
  });
  it("trick cards go to winner", () => {
    let s = initialState(1, settings7);
    s = reducer(s, { type: "play", cardId: s.playerHand[0]!.id });
    s = reducer(s, { type: "collectTrick" });
    const totalTricks = s.playerTricks.length + s.botTricks.length;
    expect(totalTricks).toBe(2); // 2 cards in each trick
  });
});

describe("isTerminal", () => {
  it("null while playing", () => expect(isTerminal(initialState(1, settings7))).toBeNull());
  it("player wins gives 100", () => {
    const s = { ...initialState(1, settings7), phase: "done" as const, playerScore: 7, botScore: 4 };
    expect(isTerminal(s)).toEqual({ score: 100 });
  });
  it("bot wins gives 10", () => {
    const s = { ...initialState(1, settings7), phase: "done" as const, playerScore: 3, botScore: 7 };
    expect(isTerminal(s)).toEqual({ score: 10 });
  });
  it("uses target from settings", () => {
    const s = { ...initialState(1, settings5), phase: "done" as const, playerScore: 5, botScore: 2 };
    expect(isTerminal(s)).toEqual({ score: 100 });
  });
});
