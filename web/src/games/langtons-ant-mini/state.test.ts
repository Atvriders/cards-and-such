import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, score, SIZE } from "./state.js";

const S = { dummy: false };

describe("langtons-ant-mini", () => {
  it("starts at center", () => {
    const s = initialState(0, S);
    expect(s.ax).toBe(Math.floor(SIZE / 2));
    expect(s.ay).toBe(Math.floor(SIZE / 2));
    expect(s.steps).toBe(0);
  });
  it("step increments steps and flipped", () => {
    const s = reducer(initialState(0, S), { type: "step" });
    expect(s.steps).toBe(1);
    expect(s.flipped).toBe(1);
  });
  it("score equals flipped", () => {
    let s = initialState(0, S);
    for (let i = 0; i < 30; i++) s = reducer(s, { type: "step" });
    expect(score(s)).toBeGreaterThanOrEqual(30);
  });
  it("finish ends game", () => {
    let s = initialState(0, S);
    s = reducer(s, { type: "step" });
    s = reducer(s, { type: "finish" });
    expect(s.phase).toBe("done");
    expect(isTerminal(s)).not.toBeNull();
  });
  it("reset clears grid", () => {
    let s = initialState(0, S);
    for (let i = 0; i < 5; i++) s = reducer(s, { type: "step" });
    s = reducer(s, { type: "reset" });
    expect(s.steps).toBe(0);
    expect(s.flipped).toBe(0);
  });
});
