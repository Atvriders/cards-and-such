import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const def = { spells: "8" as const };

describe("MagicWandCast initialState", () => {
  it("starts in casting phase", () => {
    expect(initialState(1, def).phase).toBe("casting");
  });

  it("creates correct number of spells", () => {
    expect(initialState(1, def).spells.length).toBe(8);
  });

  it("each spell has 3-5 colors", () => {
    for (const spell of initialState(1, def).spells) {
      expect(spell.length).toBeGreaterThanOrEqual(3);
      expect(spell.length).toBeLessThanOrEqual(5);
    }
  });

  it("is deterministic", () => {
    const s1 = initialState(7, def);
    const s2 = initialState(7, def);
    expect(JSON.stringify(s1.spells)).toBe(JSON.stringify(s2.spells));
  });
});

describe("MagicWandCast reducer", () => {
  it("correct color advances progress", () => {
    const s = initialState(1, def);
    const firstColor = s.spells[0]![0]!;
    const s2 = reducer(s, { type: "cast", color: firstColor });
    expect(s2.inputProgress.length).toBe(1);
  });

  it("wrong color resets progress and increments attempts", () => {
    const s = initialState(1, def);
    const firstColor = s.spells[0]![0]!;
    const wrongColor = firstColor === "red" ? "blue" : "red";
    const s2 = reducer(s, { type: "cast", color: wrongColor });
    expect(s2.inputProgress.length).toBe(0);
    expect(s2.attemptsOnSpell).toBe(1);
  });

  it("tick decrements timeLeft", () => {
    expect(reducer(initialState(1, def), { type: "tick" }).timeLeft).toBe(14);
  });

  it("completing a spell scores points", () => {
    let s = initialState(1, def);
    const spell = s.spells[0]!;
    for (const c of spell) s = reducer(s, { type: "cast", color: c });
    expect(s.score).toBeGreaterThan(0);
  });
});

describe("MagicWandCast isTerminal", () => {
  it("returns null during play", () => {
    expect(isTerminal(initialState(1, def))).toBeNull();
  });

  it("returns score when gameover", () => {
    let s = initialState(1, { spells: "5" });
    for (let i = 0; i < 5; i++) {
      const spell = s.spells[s.spellIndex]!;
      for (const c of spell) s = reducer(s, { type: "cast", color: c });
      if (s.phase === "success") s = reducer(s, { type: "next" });
    }
    expect(isTerminal(s)).not.toBeNull();
  });
});
