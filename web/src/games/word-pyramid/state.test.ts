import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

describe("word-pyramid", () => {
  it("initialState picks a puzzle with 7 levels", () => {
    const s = initialState(1);
    expect(s.puzzle.levels.length).toBe(7);
    expect(s.phase).toBe("playing");
  });

  it("typing updates input for the correct row", () => {
    let s = initialState(2);
    s = reducer(s, { type: "type", row: 2, text: "TAR" });
    expect(s.inputs[2]).toBe("TAR");
  });

  it("reveal fills in the word for a row", () => {
    let s = initialState(3);
    s = reducer(s, { type: "reveal", row: 0 });
    expect(s.inputs[0]).toBe(s.puzzle.levels[0]!.word);
    expect(s.revealed[0]).toBe(true);
  });

  it("check grades answers and transitions to done", () => {
    let s = initialState(4);
    s = reducer(s, { type: "check" });
    expect(s.phase).toBe("done");
    expect(typeof s.score).toBe("number");
  });

  it("isTerminal returns score when done", () => {
    let s = initialState(6);
    s = reducer(s, { type: "check" });
    const t = isTerminal(s);
    expect(t).not.toBeNull();
    expect(t!.score).toBeGreaterThanOrEqual(0);
  });
});
