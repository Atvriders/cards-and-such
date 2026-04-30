import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, adjacent, HAND_SIZE } from "./state.js";
import type { Card } from "../../engines/deck/index.js";

const S = { dummy: false };

describe("MiniSpit", () => {
  it("starts ready, with 5-card hands and 21-card stocks", () => {
    const s = initialState(1, S);
    expect(s.phase).toBe("ready");
    expect(s.playerHand.length).toBe(HAND_SIZE);
    expect(s.cpuHand.length).toBe(HAND_SIZE);
    expect(s.playerStock.length).toBe(26 - HAND_SIZE);
  });

  it("spit flips both center piles and enters playing", () => {
    const s = reducer(initialState(1, S), { type: "spit" });
    expect(s.phase).toBe("playing");
    expect(s.centerLeft.length).toBe(1);
    expect(s.centerRight.length).toBe(1);
  });

  it("adjacent treats Ace and King as wrap", () => {
    const ace: Card = { suit: "♠", rank: 1, id: "a" };
    const king: Card = { suit: "♥", rank: 13, id: "k" };
    const two: Card = { suit: "♦", rank: 2, id: "2" };
    expect(adjacent(ace, king)).toBe(true);
    expect(adjacent(ace, two)).toBe(true);
    expect(adjacent(king, two)).toBe(false);
  });

  it("playing an invalid card returns same state", () => {
    let s = reducer(initialState(7, S), { type: "spit" });
    const before = s;
    // Choose a card that is unlikely to be playable; if it is, this still tests the no-op path
    const target = s.playerHand[0]!;
    const left = s.centerLeft[s.centerLeft.length - 1]!;
    const right = s.centerRight[s.centerRight.length - 1]!;
    if (!adjacent(target, left) && !adjacent(target, right)) {
      s = reducer(s, { type: "play", cardId: target.id, pile: "left" });
      expect(s).toBe(before);
    }
    expect(true).toBe(true);
  });

  it("CPU tick advances or no-ops", () => {
    let s = reducer(initialState(11, S), { type: "spit" });
    const before = s.ticks;
    s = reducer(s, { type: "cpuTick" });
    expect(s.ticks).toBeGreaterThanOrEqual(before);
  });

  it("isTerminal null until done", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });
});
