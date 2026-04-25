import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const def = { jumps: "12" as const };

describe("FrogLeap initialState", () => {
  it("starts in jumping phase", () => {
    expect(initialState(1, def).phase).toBe("jumping");
  });

  it("has 6 lily pads", () => {
    expect(initialState(1, def).pads.length).toBe(6);
  });

  it("jumpsLeft matches settings", () => {
    expect(initialState(1, def).jumpsLeft).toBe(12);
    expect(initialState(1, { jumps: "8" }).jumpsLeft).toBe(8);
  });

  it("is deterministic", () => {
    const s1 = initialState(5, def);
    const s2 = initialState(5, def);
    expect(s1.frog).toEqual(s2.frog);
  });
});

describe("FrogLeap reducer", () => {
  it("jump to a different pad decrements jumpsLeft", () => {
    const s = initialState(1, def);
    const targetPad = s.pads.find(p => p.id !== s.currentPad)!;
    const s2 = reducer(s, { type: "jump", padId: targetPad.id });
    expect(s2.jumpsLeft).toBe(s.jumpsLeft - 1);
  });

  it("jump scores points", () => {
    const s = initialState(1, def);
    const targetPad = s.pads.find(p => p.id !== s.currentPad)!;
    const s2 = reducer(s, { type: "jump", padId: targetPad.id });
    expect(s2.score).toBeGreaterThan(0);
  });

  it("cannot jump to current pad", () => {
    const s = initialState(1, def);
    const s2 = reducer(s, { type: "jump", padId: s.currentPad });
    expect(s2.jumpsLeft).toBe(s.jumpsLeft);
  });

  it("gameover when jumpsLeft reaches 0", () => {
    let s = initialState(1, { jumps: "8" });
    for (let i = 0; i < 8; i++) {
      const targetPad = s.pads.find(p => p.id !== s.currentPad);
      if (!targetPad) break;
      s = reducer(s, { type: "jump", padId: targetPad.id });
    }
    expect(s.phase).toBe("gameover");
  });
});

describe("FrogLeap isTerminal", () => {
  it("returns null during play", () => {
    expect(isTerminal(initialState(1, def))).toBeNull();
  });

  it("returns score when gameover", () => {
    let s = initialState(1, { jumps: "8" });
    for (let i = 0; i < 8; i++) {
      const targetPad = s.pads.find(p => p.id !== s.currentPad);
      if (!targetPad) break;
      s = reducer(s, { type: "jump", padId: targetPad.id });
    }
    const result = isTerminal(s);
    expect(result).not.toBeNull();
    expect(typeof result!.score).toBe("number");
  });
});
