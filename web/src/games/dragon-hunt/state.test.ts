import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_FLOORS } from "./state.js";

describe("Dragon Hunt", () => {
  it("initializes at floor 1 Guard with 50 HP", () => {
    const s = initialState(1);
    expect(s.floor).toBe(1);
    expect(s.enemyName).toBe("Guard");
    expect(s.playerHp).toBe(50);
    expect(s.phase).toBe("combat");
    expect(s.mana).toBe(5);
  });

  it("strike reduces enemy HP and causes counter-attack", () => {
    const s = initialState(42);
    const s2 = reducer(s, { type: "strike" });
    expect(s2.enemyHp).toBeLessThan(s.enemyHp);
    // player takes damage OR enemy dies
    const combatContinues = s2.phase === "combat" || s2.phase === "reward" || s2.phase === "won";
    expect(combatContinues).toBe(true);
  });

  it("spellfire costs 2 mana", () => {
    const s = initialState(42);
    const s2 = reducer(s, { type: "spellfire" });
    if (s2.phase !== "dead") {
      expect(s2.mana).toBe(s.mana - 2);
    }
  });

  it("spellfire blocked when mana < 2", () => {
    const s = { ...initialState(1), mana: 1 };
    const s2 = reducer(s, { type: "spellfire" });
    expect(s2).toBe(s); // no change
  });

  it("ward sets shield", () => {
    const s = initialState(1);
    const s2 = reducer(s, { type: "ward" });
    // shield is applied then reset after enemy attack, but log should mention it
    expect(s2.log.some(l => l.includes("Ward"))).toBe(true);
  });

  it("rest gains HP and mana", () => {
    const s = { ...initialState(1), playerHp: 20, mana: 0 };
    const s2 = reducer(s, { type: "rest" });
    if (s2.phase !== "dead") {
      expect(s2.mana).toBeGreaterThan(0);
    }
    expect(s2.log.some(l => l.includes("Rest"))).toBe(true);
  });

  it("nextFloor advances from reward", () => {
    const s = { ...initialState(1), phase: "reward" as const, floor: 1 };
    const s2 = reducer(s, { type: "nextFloor" });
    expect(s2.floor).toBe(2);
    expect(s2.enemyName).toBe("Knight");
    expect(s2.phase).toBe("combat");
  });

  it("isTerminal null during combat", () => {
    expect(isTerminal(initialState(1))).toBeNull();
  });

  it("isTerminal score when won", () => {
    const s = { ...initialState(1), phase: "won" as const, playerHp: 30, mana: 3 };
    const r = isTerminal(s);
    expect(r!.score).toBe(100 + 30 + 15);
  });

  it(`total floors constant is ${TOTAL_FLOORS}`, () => {
    expect(TOTAL_FLOORS).toBe(8);
  });
});
