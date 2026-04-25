import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const def = { duration: "30" as const };

describe("MonkeyBanana initialState", () => {
  it("starts in playing phase", () => {
    expect(initialState(1, def).phase).toBe("playing");
  });

  it("starts with 3 lives", () => {
    expect(initialState(1, def).lives).toBe(3);
  });

  it("timeLeft matches settings", () => {
    expect(initialState(1, def).timeLeft).toBe(30);
    expect(initialState(1, { duration: "20" }).timeLeft).toBe(20);
  });

  it("starts with one banana", () => {
    expect(initialState(1, def).bananas.length).toBe(1);
  });
});

describe("MonkeyBanana reducer", () => {
  it("catch awards points and removes banana", () => {
    const s = initialState(1, def);
    const id = s.bananas[0]!.id;
    const pts = s.bananas[0]!.points;
    const s2 = reducer(s, { type: "catch", id });
    expect(s2.score).toBe(pts);
    expect(s2.caught).toBe(1);
    expect(s2.bananas.find(b => b.id === id)).toBeUndefined();
  });

  it("tick decrements timeLeft", () => {
    const s = initialState(1, def);
    const s2 = reducer(s, { type: "tick" });
    expect(s2.timeLeft).toBe(29);
  });

  it("tick to zero causes gameover", () => {
    let s = initialState(1, def);
    for (let i = 0; i < 30; i++) s = reducer(s, { type: "tick" });
    expect(s.phase).toBe("gameover");
  });

  it("spawn adds a banana", () => {
    const s = initialState(1, def);
    const s2 = reducer(s, { type: "spawn" });
    expect(s2.bananas.length).toBeGreaterThan(s.bananas.length);
  });
});

describe("MonkeyBanana isTerminal", () => {
  it("returns null during play", () => {
    expect(isTerminal(initialState(1, def))).toBeNull();
  });

  it("returns score when gameover", () => {
    let s = initialState(1, def);
    for (let i = 0; i < 30; i++) s = reducer(s, { type: "tick" });
    expect(isTerminal(s)).not.toBeNull();
  });
});
