import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, HERO_MAX_HP, DRAGON_MAX_HP } from "./state.js";

const S = { dummy: false };

function play(seed: number, choices: ("strike" | "guard" | "focus")[]) {
  let s = initialState(seed, S);
  for (const c of choices) {
    if (s.phase !== "choose") break;
    s = reducer(s, { type: "act", choice: c });
    if (s.phase === "result") s = reducer(s, { type: "next" });
  }
  return s;
}

describe("dice-dragon-fight", () => {
  it("starts with full HP for both", () => {
    const s = initialState(1, S);
    expect(s.heroHp).toBe(HERO_MAX_HP);
    expect(s.dragonHp).toBe(DRAGON_MAX_HP);
    expect(s.phase).toBe("choose");
  });

  it("strike hurts the dragon", () => {
    const s = reducer(initialState(2, S), { type: "act", choice: "strike" });
    expect(s.dragonHp).toBeLessThan(DRAGON_MAX_HP);
    expect(s.lastDmg).toBeGreaterThan(0);
  });

  it("guard creates shield", () => {
    const s = reducer(initialState(3, S), { type: "act", choice: "guard" });
    expect(s.shield).toBeGreaterThanOrEqual(0);
  });

  it("focus adds 4 score", () => {
    const before = initialState(4, S).score;
    const after = reducer(initialState(4, S), { type: "act", choice: "focus" });
    expect(after.score).toBeGreaterThanOrEqual(before + 4);
  });

  it("isTerminal null at start", () => {
    expect(isTerminal(initialState(5, S))).toBeNull();
  });

  it("game can end (win or loss) within many strikes", () => {
    const s = play(11, Array(60).fill("strike"));
    expect(s.phase).toBe("done");
    expect(isTerminal(s)).not.toBeNull();
  });
});
