import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, posToCoord, coordToPos } from "./state.js";
import type { SantoriniState } from "./state.js";

describe("Santorini", () => {
  it("starts in place0 phase with no workers placed", () => {
    const s = initialState(0, {});
    expect(s.phase).toBe("place0");
    expect(s.workers).toEqual([-1, -1, -1, -1]);
    expect(s.heights).toHaveLength(25);
    expect(s.heights.every((h) => h === 0)).toBe(true);
  });

  it("placing two workers transitions to play phase", () => {
    const s = initialState(0, {});
    const s1 = reducer(s, { type: "placeWorker", pos: 0 });
    expect(s1.workers[0]).toBe(0);
    expect(s1.phase).toBe("place0");
    const s2 = reducer(s1, { type: "placeWorker", pos: 1 });
    expect(s2.phase).toBe("play");
    expect(s2.workers[2]).toBeGreaterThanOrEqual(0);
    expect(s2.workers[3]).toBeGreaterThanOrEqual(0);
  });

  it("detects win when worker moves to height 3", () => {
    // Set up state with human worker at pos 0 (height 2), pos 1 has height 3
    // Worker can move from height 2 to height 3 (at most 1 higher)
    const s = initialState(0, {});
    const ready: SantoriniState = {
      ...s,
      phase: "play",
      turn: 0,
      workers: [0, 5, 24, 23],
      heights: [2, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      playStep: "select",
    };
    const s1 = reducer(ready, { type: "selectWorker", workerIdx: 0 });
    expect(s1.playStep).toBe("move");
    const s2 = reducer(s1, { type: "moveWorker", pos: 1 }); // move to height-3 cell
    expect(s2.winner).toBe(0);
    expect(isTerminal(s2)).toEqual({ score: 100 });
  });

  it("posToCoord and coordToPos are inverses", () => {
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        const pos = coordToPos(r, c);
        const coord = posToCoord(pos);
        expect(coord.row).toBe(r);
        expect(coord.col).toBe(c);
      }
    }
  });

  it("cannot move to a cell with a height difference > 1", () => {
    const s = initialState(0, {});
    const ready: SantoriniState = {
      ...s,
      phase: "play",
      turn: 0,
      workers: [0, 5, 24, 23],
      heights: [0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      playStep: "select",
    };
    const s1 = reducer(ready, { type: "selectWorker", workerIdx: 0 });
    const s2 = reducer(s1, { type: "moveWorker", pos: 1 }); // height 2 from height 0 — illegal
    // Should be rejected (state unchanged from s1 because it's illegal)
    expect(s2.movedTo).toBeNull();
    expect(s2.playStep).toBe("move");
  });

  it("isTerminal returns null mid-game", () => {
    const s = initialState(0, {});
    expect(isTerminal(s)).toBeNull();
  });
});
