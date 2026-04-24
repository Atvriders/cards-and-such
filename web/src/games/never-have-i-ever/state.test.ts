import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const defaultSettings = { rounds: "10" as const, mode: "all-ages" as const };

describe("NeverHaveIEver initialState", () => {
  it("creates the correct number of statements", () => {
    const s = initialState(1, defaultSettings);
    expect(s.statements.length).toBe(10);
  });

  it("starts with drankCount 0 and playing phase", () => {
    const s = initialState(1, defaultSettings);
    expect(s.drankCount).toBe(0);
    expect(s.phase).toBe("playing");
  });

  it("is deterministic under same seed", () => {
    const s1 = initialState(42, defaultSettings);
    const s2 = initialState(42, defaultSettings);
    expect(s1.statements).toEqual(s2.statements);
  });

  it("produces different order under different seeds", () => {
    const s1 = initialState(1, defaultSettings);
    const s2 = initialState(99, defaultSettings);
    expect(s1.statements).not.toEqual(s2.statements);
  });
});

describe("NeverHaveIEver reducer", () => {
  it("did-it increments drankCount", () => {
    const s = initialState(1, defaultSettings);
    const s2 = reducer(s, { type: "did-it" });
    expect(s2.drankCount).toBe(1);
    expect(s2.currentIndex).toBe(1);
  });

  it("never does not increment drankCount", () => {
    const s = initialState(1, defaultSettings);
    const s2 = reducer(s, { type: "never" });
    expect(s2.drankCount).toBe(0);
    expect(s2.currentIndex).toBe(1);
  });

  it("reaches done after all statements", () => {
    let s = initialState(1, { rounds: "10" as const, mode: "all-ages" as const });
    for (let i = 0; i < 10; i++) {
      s = reducer(s, { type: "did-it" });
    }
    expect(s.phase).toBe("done");
  });

  it("does nothing when already done", () => {
    let s = initialState(1, { rounds: "10" as const, mode: "all-ages" as const });
    for (let i = 0; i < 10; i++) s = reducer(s, { type: "never" });
    const s2 = reducer(s, { type: "did-it" });
    expect(s2.drankCount).toBe(0);
  });
});

describe("NeverHaveIEver isTerminal", () => {
  it("returns null during play", () => {
    const s = initialState(1, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score when done", () => {
    let s = initialState(1, { rounds: "10" as const, mode: "all-ages" as const });
    for (let i = 0; i < 10; i++) s = reducer(s, { type: "did-it" });
    const t = isTerminal(s);
    expect(t).not.toBeNull();
    expect(t!.score).toBe(10);
  });
});
