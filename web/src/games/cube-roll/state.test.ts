import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const easySettings = { difficulty: "easy" as const };
const medSettings = { difficulty: "medium" as const };

describe("CubeRoll initialState", () => {
  it("creates a valid state for easy difficulty", () => {
    const s = initialState(0, easySettings);
    expect(s.cols).toBeGreaterThan(0);
    expect(s.rows).toBeGreaterThan(0);
    expect(s.faces).toHaveLength(6);
    expect(s.won).toBe(false);
  });

  it("starts with standard die orientation top=1", () => {
    const s = initialState(0, easySettings);
    expect(s.faces[0]).toBe(1);
  });

  it("creates medium difficulty puzzle with larger grid", () => {
    const s = initialState(0, medSettings);
    expect(s.cols).toBeGreaterThanOrEqual(6);
  });

  it("puzzle index selects correct set", () => {
    const easy = initialState(0, easySettings);
    const hard = initialState(0, { difficulty: "hard" as const });
    expect(hard.cols).toBeGreaterThanOrEqual(easy.cols);
  });
});

describe("CubeRoll reducer", () => {
  it("moving right changes column", () => {
    const s = initialState(0, easySettings);
    const s2 = reducer(s, { type: "move", dir: "right" });
    expect(s2.col).toBe(s.col + 1);
    expect(s2.moves).toBe(1);
  });

  it("moving down changes row", () => {
    const s = initialState(0, easySettings);
    const s2 = reducer(s, { type: "move", dir: "down" });
    expect(s2.row).toBe(s.row + 1);
  });

  it("cannot move out of bounds", () => {
    const s = initialState(0, easySettings);
    // start is at 0,0 — cannot go up or left
    const s2 = reducer(s, { type: "move", dir: "up" });
    expect(s2).toBe(s);
    const s3 = reducer(s, { type: "move", dir: "left" });
    expect(s3).toBe(s);
  });

  it("rolling right then left returns to original faces", () => {
    const s = initialState(0, easySettings);
    const s2 = reducer(s, { type: "move", dir: "right" });
    const s3 = reducer(s2, { type: "move", dir: "left" });
    expect(s3.faces).toEqual(s.faces);
  });

  it("rolling 4 times in same direction returns to original orientation", () => {
    const s = initialState(0, easySettings);
    let cur = s;
    for (let i = 0; i < 4; i++) cur = reducer(cur, { type: "move", dir: "down" });
    expect(cur.faces).toEqual(s.faces);
  });

  it("no-op when already won", () => {
    const s = { ...initialState(0, easySettings), won: true };
    const s2 = reducer(s, { type: "move", dir: "right" });
    expect(s2).toBe(s);
  });
});

describe("CubeRoll isTerminal", () => {
  it("returns null when not won", () => {
    const s = initialState(0, easySettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score when won", () => {
    const s = { ...initialState(0, easySettings), won: true, moves: 10 };
    const result = isTerminal(s);
    expect(result).not.toBeNull();
    expect(result!.score).toBeGreaterThan(0);
  });

  it("score floors at 50", () => {
    const s = { ...initialState(0, easySettings), won: true, moves: 10000 };
    expect(isTerminal(s)!.score).toBe(50);
  });
});
