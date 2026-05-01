import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_ROUNDS, spellPower, STARTING_MANA } from "./state.js";

const S = { dummy: false };

describe("dice-wizard-spell", () => {
  it("starts with full mana, no rolls, channel phase", () => {
    const s = initialState(1, S);
    expect(s.phase).toBe("channel");
    expect(s.mana).toBe(STARTING_MANA);
    expect(s.rolls.length).toBe(0);
  });

  it("rolling spends mana and produces 4 d6", () => {
    const s = reducer(initialState(1, S), { type: "roll" });
    expect(s.rolls.length).toBe(4);
    expect(s.mana).toBe(STARTING_MANA - 1);
    s.rolls.forEach(r => { expect(r).toBeGreaterThanOrEqual(1); expect(r).toBeLessThanOrEqual(6); });
  });

  it("cast scores points and advances phase", () => {
    let s = reducer(initialState(2, S), { type: "roll" });
    s = reducer(s, { type: "cast", school: "arcane" });
    expect(s.phase).toBe("scored");
    expect(s.score).toBeGreaterThan(0);
    expect(s.lastPts).toBeGreaterThan(0);
  });

  it("spellPower differs by school for the same rolls", () => {
    const rolls = [6, 6, 6, 1];
    const fire = spellPower(rolls, "fire").pts;
    const ice = spellPower(rolls, "ice").pts;
    expect(fire).not.toBe(ice);
  });

  it("triple bonus on fire with three matching dice", () => {
    const trip = spellPower([5, 5, 5, 2], "fire");
    expect(trip.desc).toContain("BURN");
  });

  it("game ends after TOTAL_ROUNDS rounds", () => {
    let s = initialState(99, S);
    for (let i = 0; i < TOTAL_ROUNDS + 2; i++) {
      if (s.phase === "channel") {
        s = reducer(s, { type: "roll" });
        s = reducer(s, { type: "cast", school: "arcane" });
      }
      if (s.phase === "scored") s = reducer(s, { type: "next" });
    }
    expect(s.phase).toBe("done");
    expect(isTerminal(s)).not.toBeNull();
  });
});
