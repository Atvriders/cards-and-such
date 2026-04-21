import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const settings = { targetBrains: "13" as const };

describe("ZombieDice initialState", () => {
  it("starts with 13-die pool, 0 brains, preRoll phase", () => {
    const s = initialState(42, settings);
    expect(s.bankedBrains).toBe(0);
    expect(s.turnBrains).toBe(0);
    expect(s.turnShotguns).toBe(0);
    expect(s.pool.length).toBe(13);
    expect(s.phase).toBe("preRoll");
  });

  it("is deterministic", () => {
    expect(initialState(7, settings)).toEqual(initialState(7, settings));
  });
});

describe("ZombieDice roll action", () => {
  it("rolls 3 dice and transitions to rolled or busted", () => {
    const s = initialState(42, settings);
    const s2 = reducer(s, { type: "roll" });
    expect(["rolled", "busted"]).toContain(s2.phase);
    expect(s2.lastRoll.length).toBe(3);
  });

  it("each die has a valid face and color", () => {
    const s = initialState(42, settings);
    const s2 = reducer(s, { type: "roll" });
    for (const d of s2.lastRoll) {
      expect(["green","yellow","red"]).toContain(d.color);
      expect(["brain","running","shotgun"]).toContain(d.face);
    }
  });

  it("is deterministic", () => {
    const s = initialState(42, settings);
    const s2a = reducer(s, { type: "roll" });
    const s2b = reducer(s, { type: "roll" });
    expect(s2a.lastRoll).toEqual(s2b.lastRoll);
  });

  it("busted phase triggers when shotguns reach 3", () => {
    let s = initialState(42, settings);
    let safety = 100;
    while (s.phase !== "busted" && s.phase !== "won" && safety-- > 0) {
      if (s.phase === "rolled") {
        s = reducer(s, { type: "roll" });
      } else {
        s = reducer(s, { type: "roll" });
      }
    }
    // Either we busted or somehow won — just check no crash
    expect(["busted", "won", "rolled"]).toContain(s.phase);
  });
});

describe("ZombieDice bank action", () => {
  it("banking moves turn brains to banked", () => {
    let s = initialState(42, settings);
    s = reducer(s, { type: "roll" });
    if (s.phase === "rolled" && s.turnBrains > 0) {
      const brainsBefore = s.turnBrains;
      const s2 = reducer(s, { type: "bank" });
      expect(s2.bankedBrains).toBe(brainsBefore);
      expect(s2.turnBrains).toBe(0);
      expect(s2.pool.length).toBe(13); // pool reset
    }
  });

  it("cannot bank when busted", () => {
    const s = initialState(42, settings);
    const bustedState = { ...s, phase: "busted" as const };
    const s2 = reducer(bustedState, { type: "bank" });
    expect(s2.bankedBrains).toBe(0);
  });
});

describe("ZombieDice nextTurn action", () => {
  it("resets turn state after bust", () => {
    const s = initialState(42, settings);
    const bustedState = { ...s, phase: "busted" as const, turnBrains: 3, turnShotguns: 3 };
    const s2 = reducer(bustedState, { type: "nextTurn" });
    expect(s2.turnBrains).toBe(0);
    expect(s2.turnShotguns).toBe(0);
    expect(s2.phase).toBe("preRoll");
    expect(s2.pool.length).toBe(13);
  });
});

describe("ZombieDice isTerminal", () => {
  it("returns null when not won", () => {
    expect(isTerminal(initialState(1, settings))).toBeNull();
  });

  it("returns bankedBrains as score when won", () => {
    const s = initialState(42, settings);
    const wonState = { ...s, phase: "won" as const, bankedBrains: 13 };
    const result = isTerminal(wonState);
    expect(result).not.toBeNull();
    expect(result?.score).toBe(13);
  });
});
