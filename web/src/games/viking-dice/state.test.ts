import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { VikingDiceState } from "./state.js";

const defaultSettings = { target: "100" as const };

describe("VikingDice initialState", () => {
  it("starts with zero raid and preRoll phase", () => {
    const s = initialState(42, defaultSettings);
    expect(s.totalRaid).toBe(0);
    expect(s.turnRaid).toBe(0);
    expect(s.phase).toBe("preRoll");
    expect(s.won).toBe(false);
  });

  it("is deterministic", () => {
    expect(initialState(7, defaultSettings)).toEqual(initialState(7, defaultSettings));
  });
});

describe("VikingDice roll", () => {
  it("produces 6 dice on first roll", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "roll" });
    expect(s2.lastRoll.length).toBe(6);
    expect(["rolled", "busted"]).toContain(s2.phase);
  });

  it("ignores roll when not in preRoll phase", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "roll" });
    if (s2.phase !== "rolled") return;
    const s3 = reducer(s2, { type: "roll" });
    expect(s3.lastRoll).toEqual(s2.lastRoll);
  });
});

describe("VikingDice bank", () => {
  it("adds turnRaid to totalRaid and resets turn", () => {
    const s = initialState(42, defaultSettings);
    const withRaid: VikingDiceState = {
      ...s,
      turnRaid: 30,
      phase: "rolled",
    };
    const s2 = reducer(withRaid, { type: "bank" });
    expect(s2.totalRaid).toBe(30);
    expect(s2.turnRaid).toBe(0);
    expect(s2.turnsTaken).toBe(1);
    expect(s2.phase).toBe("preRoll");
  });

  it("sets won when totalRaid reaches target", () => {
    const s = initialState(42, defaultSettings);
    const nearWin: VikingDiceState = {
      ...s,
      totalRaid: 80,
      turnRaid: 30,
      phase: "rolled",
    };
    const s2 = reducer(nearWin, { type: "bank" });
    expect(s2.won).toBe(true);
  });
});

describe("VikingDice busted", () => {
  it("nextTurn resets turn after bust", () => {
    const s = initialState(42, defaultSettings);
    const busted: VikingDiceState = {
      ...s,
      phase: "busted",
      skulls: 3,
      turnRaid: 20,
    };
    const s2 = reducer(busted, { type: "nextTurn" });
    expect(s2.turnRaid).toBe(0);
    expect(s2.skulls).toBe(0);
    expect(s2.phase).toBe("preRoll");
    expect(s2.turnsTaken).toBe(1);
  });
});

describe("VikingDice isTerminal", () => {
  it("returns null while playing", () => {
    expect(isTerminal(initialState(42, defaultSettings))).toBeNull();
  });

  it("returns score when won", () => {
    const s: VikingDiceState = { ...initialState(1, defaultSettings), won: true, turnsTaken: 5 };
    const result = isTerminal(s);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(950);
  });
});
