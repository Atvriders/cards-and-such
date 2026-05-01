import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, scoreGuess } from "./state.js";
import type { WordleMiniSettings } from "./state.js";

const S: WordleMiniSettings = { rounds: "8" };

describe("wordle-mini", () => {
  it("creates a 5-letter target", () => {
    const s = initialState(1, S);
    expect(s.answer.length).toBe(5);
    expect(s.maxGuesses).toBe(8);
    expect(s.status).toBe("playing");
  });
  it("scoreGuess marks greens and yellows correctly", () => {
    const tiles = scoreGuess("CRANE", "CRATE");
    expect(tiles[0]).toBe("correct");
    expect(tiles[1]).toBe("correct");
    expect(tiles[2]).toBe("correct");
    expect(tiles[3]).toBe("absent");
    expect(tiles[4]).toBe("correct");
  });
  it("typing letters builds current input", () => {
    let s = initialState(1, S);
    s = reducer(s, { type: "key", ch: "C" });
    s = reducer(s, { type: "key", ch: "R" });
    s = reducer(s, { type: "key", ch: "A" });
    s = reducer(s, { type: "key", ch: "N" });
    s = reducer(s, { type: "key", ch: "E" });
    expect(s.current).toBe("CRANE");
  });
  it("guessing the answer wins", () => {
    let s = initialState(1, S);
    const ans = s.answer;
    for (const ch of ans) s = reducer(s, { type: "key", ch });
    s = reducer(s, { type: "enter" });
    expect(s.status).toBe("won");
    const t = isTerminal(s);
    expect(t).not.toBeNull();
    expect(t!.score).toBeGreaterThan(0);
  });
  it("rejects words not in the list", () => {
    let s = initialState(1, S);
    for (const ch of "ZZZZZ") s = reducer(s, { type: "key", ch });
    s = reducer(s, { type: "enter" });
    expect(s.status).toBe("playing");
    expect(s.message).toMatch(/word list/);
  });
});
