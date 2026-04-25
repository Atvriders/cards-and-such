import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const def = { rounds: "5" as const };

describe("AceFinder initialState", () => {
  it("starts in picking phase", () => {
    expect(initialState(1, def).phase).toBe("picking");
  });

  it("has exactly one ace in cards", () => {
    const s = initialState(1, def);
    const aces = s.cards.filter(c => c % 13 === 12);
    expect(aces.length).toBe(1);
  });

  it("acePos matches ace in cards", () => {
    const s = initialState(1, def);
    expect(s.cards[s.acePos]! % 13).toBe(12);
  });

  it("is deterministic", () => {
    expect(initialState(5, def).acePos).toBe(initialState(5, def).acePos);
  });
});

describe("AceFinder reducer", () => {
  it("pick correct ace awards 25 pts", () => {
    const s = initialState(1, def);
    const s2 = reducer(s, { type: "pick", pos: s.acePos });
    expect(s2.score).toBe(25);
  });

  it("pick wrong card awards 0 pts", () => {
    const s = initialState(1, def);
    const wrong = (s.acePos + 1) % 4;
    const s2 = reducer(s, { type: "pick", pos: wrong });
    expect(s2.score).toBe(0);
  });

  it("hint reveals a non-ace card", () => {
    const s = initialState(1, def);
    const s2 = reducer(s, { type: "hint" });
    const revealedIdx = s2.revealed.findIndex(r => r === true);
    expect(revealedIdx).not.toBe(-1);
    expect(s2.cards[revealedIdx]! % 13).not.toBe(12);
  });

  it("next advances to next round", () => {
    const s = initialState(1, def);
    const s2 = reducer(s, { type: "pick", pos: s.acePos });
    if (s2.phase === "result") {
      const s3 = reducer(s2, { type: "next" });
      expect(s3.round).toBe(2);
    }
  });
});

describe("AceFinder isTerminal", () => {
  it("returns null during play", () => {
    expect(isTerminal(initialState(1, def))).toBeNull();
  });

  it("returns score when gameover", () => {
    let s = initialState(1, def);
    for (let i = 0; i < 5; i++) {
      s = reducer(s, { type: "pick", pos: s.acePos });
      if (s.phase === "result") s = reducer(s, { type: "next" });
    }
    expect(isTerminal(s)).not.toBeNull();
  });
});
