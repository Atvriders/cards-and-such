import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, KNIGHT_MAX_HP } from "./state.js";

const S = { dummy: false };

function runUntilDone(seed: number) {
  let s = initialState(seed, S);
  let safety = 500;
  while (s.phase !== "done" && safety-- > 0) {
    if (s.phase === "attack") s = reducer(s, { type: "attack" });
    else s = reducer(s, { type: "next" });
  }
  return s;
}

describe("dice-knight-quest", () => {
  it("initial: full HP, first foe, no log", () => {
    const s = initialState(1, S);
    expect(s.knightHp).toBe(KNIGHT_MAX_HP);
    expect(s.current).toBe(0);
    expect(s.phase).toBe("attack");
    expect(s.score).toBe(0);
  });

  it("attack rolls a d20 (1..20)", () => {
    const s = reducer(initialState(7, S), { type: "attack" });
    expect(s.lastAttack).not.toBeNull();
    expect(s.lastAttack!).toBeGreaterThanOrEqual(1);
    expect(s.lastAttack!).toBeLessThanOrEqual(20);
  });

  it("hit reduces foe HP, miss does not", () => {
    const s = reducer(initialState(3, S), { type: "attack" });
    const monster = s.monsters[0]!;
    if (s.lastDamageDealt > 0) expect(monster.hp).toBeLessThan(monster.maxHp);
    else expect(monster.hp).toBe(monster.maxHp);
  });

  it("isTerminal null until done", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });

  it("eventually reaches done across many seeds", () => {
    for (const seed of [1, 2, 5, 11, 99]) {
      const s = runUntilDone(seed);
      expect(s.phase).toBe("done");
      expect(isTerminal(s)).not.toBeNull();
    }
  });

  it("score is non-negative when done", () => {
    const s = runUntilDone(42);
    expect(s.score).toBeGreaterThanOrEqual(0);
  });
});
