import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const s30 = { duration: "30" as const };

describe("AppleToss initialState", () => {
  it("starts in playing phase", () => { expect(initialState(1, s30).phase).toBe("playing"); });
  it("starts with 3 lives", () => { expect(initialState(1, s30).lives).toBe(3); });
  it("starts with score 0", () => { expect(initialState(1, s30).score).toBe(0); });
  it("is deterministic", () => { expect(initialState(5, s30).items[0]!.x).toBe(initialState(5, s30).items[0]!.x); });
});

describe("AppleToss reducer", () => {
  it("catch removes item and adds score", () => {
    const s = initialState(1, s30);
    const id = s.items[0]!.id;
    const s2 = reducer(s, { type: "catch", id });
    expect(s2.items.length).toBe(0);
    expect(s2.score).toBeGreaterThan(0);
  });
  it("tick moves items down", () => {
    const s = initialState(1, s30);
    const s2 = reducer(s, { type: "tick" });
    expect(s2.items[0]!.y).toBeGreaterThan(s.items[0]!.y);
  });
  it("spawn adds new item", () => {
    const s = initialState(1, s30);
    const s2 = reducer(s, { type: "spawn" });
    expect(s2.items.length).toBeGreaterThan(s.items.length);
  });
  it("lost lives end game", () => {
    let s = { ...initialState(1, s30), lives: 1, items: [{ id: 0, x: 50, y: 95, speed: 10, points: 10 }] };
    s = reducer(s, { type: "tick" });
    expect(s.phase).toBe("gameover");
  });
});

describe("AppleToss isTerminal", () => {
  it("null during play", () => { expect(isTerminal(initialState(1, s30))).toBeNull(); });
  it("score on gameover", () => {
    const s = { ...initialState(1, s30), phase: "gameover" as const };
    expect(isTerminal(s)).not.toBeNull();
  });
});
