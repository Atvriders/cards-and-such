import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const def = { rounds: "10" as const };

describe("RedOrBlack initialState", () => {
  it("starts in guessing phase", () => {
    expect(initialState(1, def).phase).toBe("guessing");
  });

  it("is deterministic", () => {
    expect(initialState(7, def).deck[0]).toBe(initialState(7, def).deck[0]);
  });

  it("starts with zero score", () => {
    expect(initialState(1, def).score).toBe(0);
  });

  it("maxRounds matches settings", () => {
    expect(initialState(1, def).maxRounds).toBe(10);
  });
});

describe("RedOrBlack reducer", () => {
  it("guess transitions to reveal or gameover", () => {
    const s = initialState(1, def);
    const s2 = reducer(s, { type: "guess", color: "red" });
    expect(["reveal", "gameover"]).toContain(s2.phase);
  });

  it("correct guess awards 10 points", () => {
    const s = initialState(1, def);
    const card = s.deck[0]!;
    const suit = Math.floor(card / 13);
    const color = (suit === 1 || suit === 2) ? "red" : "black";
    const s2 = reducer(s, { type: "guess", color });
    expect(s2.score).toBe(10);
  });

  it("wrong guess awards 0 points", () => {
    const s = initialState(1, def);
    const card = s.deck[0]!;
    const suit = Math.floor(card / 13);
    const wrong = (suit === 1 || suit === 2) ? "black" : "red";
    const s2 = reducer(s, { type: "guess", color: wrong });
    expect(s2.score).toBe(0);
  });

  it("next advances round", () => {
    const s = initialState(1, def);
    const s2 = reducer(s, { type: "guess", color: "red" });
    if (s2.phase === "reveal") {
      expect(reducer(s2, { type: "next" }).round).toBe(2);
    }
  });
});

describe("RedOrBlack isTerminal", () => {
  it("returns null during play", () => {
    expect(isTerminal(initialState(1, def))).toBeNull();
  });

  it("returns score when gameover", () => {
    let s = initialState(1, def);
    for (let i = 0; i < 10; i++) {
      s = reducer(s, { type: "guess", color: "red" });
      if (s.phase === "reveal") s = reducer(s, { type: "next" });
    }
    expect(isTerminal(s)).not.toBeNull();
  });
});
