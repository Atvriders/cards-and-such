import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, MORSE_LETTERS } from "./state.js";
import type { MorseTapState } from "./state.js";

const noSettings = {} as Record<string, never>;

describe("MorseTap initialState", () => {
  it("starts idle", () => {
    const s = initialState(42, noSettings);
    expect(s.phase).toBe("idle");
    expect(s.round).toBe(0);
    expect(s.score).toBe(0);
  });

  it("is deterministic", () => {
    const s1 = initialState(7, noSettings);
    const s2 = initialState(7, noSettings);
    expect(s1.rngSeed).toBe(s2.rngSeed);
  });
});

describe("MorseTap start", () => {
  it("picks a letter and enters showing", () => {
    const s = initialState(42, noSettings);
    const s2 = reducer(s, { type: "start" });
    expect(s2.phase).toBe("showing");
    expect(s2.letter).not.toBe("");
    expect(MORSE_LETTERS).toHaveProperty(s2.letter);
    expect(s2.target.length).toBeGreaterThan(0);
    expect(s2.round).toBe(1);
  });

  it("start is no-op in showing phase", () => {
    const s = initialState(42, noSettings);
    const s2 = reducer(s, { type: "start" });
    const s3 = reducer(s2, { type: "start" });
    expect(s3.round).toBe(1);
  });
});

describe("MorseTap advance-flash", () => {
  it("toggles between active and gap states", () => {
    const s = initialState(42, noSettings);
    const s2 = reducer(s, { type: "start" }); // showing, flashIndex=0, activeSymbol=null
    const s3 = reducer(s2, { type: "advance-flash" }); // should show first symbol
    expect(s3.activeSymbol).not.toBeNull();
    const s4 = reducer(s3, { type: "advance-flash" }); // clear or advance
    // either still showing or moved to input
    expect(["showing", "input"]).toContain(s4.phase);
  });

  it("eventually transitions to input", () => {
    const s = initialState(42, noSettings);
    let cur = reducer(s, { type: "start" });
    // advance-flash enough times to exhaust any letter's sequence
    for (let i = 0; i < 20; i++) {
      if (cur.phase === "input") break;
      cur = reducer(cur, { type: "advance-flash" });
    }
    expect(cur.phase).toBe("input");
  });
});

describe("MorseTap tap and submit", () => {
  const getInputState = (): MorseTapState => {
    const s = initialState(42, noSettings);
    const s2 = reducer(s, { type: "start" });
    return { ...s2, phase: "input", playerInput: [] };
  };

  it("tap adds symbol to playerInput", () => {
    const s = getInputState();
    const s2 = reducer(s, { type: "tap", symbol: "dot" });
    expect(s2.playerInput).toEqual(["dot"]);
  });

  it("correct submission completes round and increments score", () => {
    const s = getInputState();
    const target = s.target;
    let cur: MorseTapState = s;
    for (const sym of target) {
      cur = reducer(cur, { type: "tap", symbol: sym });
    }
    const submitted = reducer(cur, { type: "submit" });
    expect(submitted.phase).toBe("complete");
    expect(submitted.score).toBe(1);
  });

  it("wrong submission fails", () => {
    const s = getInputState();
    const wrong = s.target[0] === "dot" ? "dash" : "dot";
    let cur = reducer(s, { type: "tap", symbol: wrong });
    cur = reducer(cur, { type: "submit" });
    expect(cur.phase).toBe("failed");
  });

  it("tap is no-op when not in input", () => {
    const s = initialState(42, noSettings);
    const s2 = reducer(s, { type: "tap", symbol: "dot" });
    expect(s2.playerInput.length).toBe(0);
  });
});

describe("MorseTap isTerminal", () => {
  it("null when not failed", () => {
    const s = initialState(42, noSettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score when failed", () => {
    const s: MorseTapState = { ...initialState(42, noSettings), phase: "failed", score: 3 };
    expect(isTerminal(s)!.score).toBe(3);
  });
});
