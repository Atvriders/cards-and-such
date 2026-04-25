import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const s10 = { rounds: "10" as const };

describe("DiceMirrorRoll initialState", () => {
  it("starts in betting phase", () => {
    expect(initialState(1, s10).phase).toBe("betting");
  });
  it("currentDie is 1-6", () => {
    const s = initialState(1, s10);
    expect(s.currentDie).toBeGreaterThanOrEqual(1);
    expect(s.currentDie).toBeLessThanOrEqual(6);
  });
  it("is deterministic", () => {
    expect(initialState(42, s10).currentDie).toBe(initialState(42, s10).currentDie);
  });
  it("score starts 0", () => {
    expect(initialState(1, s10).score).toBe(0);
  });
});

describe("DiceMirrorRoll reducer", () => {
  it("bet reveals nextDie", () => {
    const s = reducer(initialState(1, s10), { type: "bet", call: "higher" });
    expect(s.nextDie).not.toBeNull();
  });
  it("correct higher bet earns 25", () => {
    // find a seed where nextDie > currentDie
    for (let seed = 0; seed < 50; seed++) {
      const init = initialState(seed, s10);
      const s = reducer(init, { type: "bet", call: "higher" });
      if (s.nextDie! > init.currentDie) {
        expect(s.lastPts).toBe(25);
        break;
      }
    }
  });
  it("correct same bet earns 60", () => {
    for (let seed = 0; seed < 200; seed++) {
      const init = initialState(seed, s10);
      const s = reducer(init, { type: "bet", call: "same" });
      if (s.nextDie === init.currentDie) {
        expect(s.lastPts).toBe(60);
        break;
      }
    }
  });
  it("next uses nextDie as new currentDie", () => {
    const init = initialState(1, s10);
    const s2 = reducer(init, { type: "bet", call: "higher" });
    const s3 = s2.phase === "reveal" ? reducer(s2, { type: "next" }) : s2;
    if (s3.phase === "betting") expect(s3.currentDie).toBe(s2.nextDie!);
  });
});

describe("DiceMirrorRoll isTerminal", () => {
  it("null during play", () => {
    expect(isTerminal(initialState(1, s10))).toBeNull();
  });
  it("returns score when done", () => {
    let s = initialState(1, { rounds: "8" });
    for (let i = 0; i < 8; i++) {
      s = reducer(s, { type: "bet", call: "higher" });
      if (s.phase === "reveal") s = reducer(s, { type: "next" });
    }
    expect(isTerminal(s)).not.toBeNull();
  });
});
