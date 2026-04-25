import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const s30 = { duration: "30" as const };

describe("HulaHoop initialState", () => {
  it("starts playing", () => { expect(initialState(1, s30).phase).toBe("playing"); });
  it("starts with 3 lives", () => { expect(initialState(1, s30).lives).toBe(3); });
  it("score 0", () => { expect(initialState(1, s30).score).toBe(0); });
  it("deterministic", () => { expect(initialState(5, s30).items[0]!.x).toBe(initialState(5, s30).items[0]!.x); });
});

describe("HulaHoop reducer", () => {
  it("catch removes item and scores", () => {
    const s = initialState(1, s30);
    const s2 = reducer(s, { type: "catch", id: s.items[0]!.id });
    expect(s2.items.length).toBe(0);
    expect(s2.score).toBeGreaterThan(0);
  });
  it("tick moves items", () => {
    const s = initialState(1, s30);
    expect(reducer(s, { type: "tick" }).items[0]!.y).toBeGreaterThan(s.items[0]!.y);
  });
  it("spawn adds item", () => {
    const s = initialState(1, s30);
    expect(reducer(s, { type: "spawn" }).items.length).toBeGreaterThan(s.items.length);
  });
  it("lost lives end game", () => {
    const s = { ...initialState(1, s30), lives: 1, items: [{ id: 0, x: 50, y: 95, speed: 10, points: 10 }] };
    expect(reducer(s, { type: "tick" }).phase).toBe("gameover");
  });
});

describe("HulaHoop isTerminal", () => {
  it("null during play", () => { expect(isTerminal(initialState(1, s30))).toBeNull(); });
  it("score on gameover", () => {
    expect(isTerminal({ ...initialState(1, s30), phase: "gameover" as const })).not.toBeNull();
  });
});
