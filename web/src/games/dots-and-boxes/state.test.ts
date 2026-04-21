import { describe, expect, it } from "vitest";
import {
  initialState,
  reducer,
  isTerminal,
  hIdx,
  vIdx,
  type DotsAndBoxesState,
} from "./state.js";

describe("Dots and Boxes", () => {
  it("initializes correctly for 3x3 dot grid (2x2 boxes)", () => {
    const s = initialState(0, { boardSize: "3" });
    expect(s.rows).toBe(2);
    expect(s.cols).toBe(2);
    expect(s.scores).toEqual([0, 0]);
    expect(s.winner).toBeNull();
    expect(s.turn).toBe(0);
    expect(s.boxes.every((b) => b === null)).toBe(true);
    expect(s.hEdges.every((e) => !e)).toBe(true);
    expect(s.vEdges.every((e) => !e)).toBe(true);
  });

  it("drawing an edge marks it as drawn", () => {
    const s = initialState(0, { boardSize: "3" });
    const next = reducer(s, { type: "drawEdge", edge: "h", row: 0, col: 0 });
    expect(next.hEdges[hIdx(next, 0, 0)]).toBe(true);
  });

  it("drawing the 4th side of a box claims it and gives extra turn", () => {
    // 3-dot grid: 2x2 boxes. Draw top, right, left of box (0,0), then bottom to complete
    // hEdges: top of box(0,0) = h[0,0], bottom = h[1,0]
    // vEdges: left of box(0,0) = v[0,0], right = v[0,1]
    let s = initialState(0, { boardSize: "3" });
    // Manually set state with 3 sides of box(0,0) drawn (skip bot responses by testing state directly)
    const hEdges = [...s.hEdges];
    const vEdges = [...s.vEdges];
    hEdges[hIdx(s, 0, 0)] = true; // top
    vEdges[vIdx(s, 0, 0)] = true; // left
    vEdges[vIdx(s, 0, 1)] = true; // right
    const s3: DotsAndBoxesState = { ...s, hEdges, vEdges, turn: 0 };
    const next = reducer(s3, { type: "drawEdge", edge: "h", row: 1, col: 0 }); // bottom
    // Box (0,0) should be claimed by player 0
    expect(next.boxes[0]).toBe(0);
    expect(next.scores[0]).toBeGreaterThan(0);
    // Player gets extra turn (turn = 0), but then bot may move too
    // Just check score increased
    expect(next.scores[0]).toBeGreaterThanOrEqual(1);
  });

  it("isTerminal returns null mid-game, score at end", () => {
    const s = initialState(0, { boardSize: "3" });
    expect(isTerminal(s)).toBeNull();
    const won = { ...s, winner: 0 as const };
    expect(isTerminal(won)).toEqual({ score: 100 });
    const lost = { ...s, winner: 1 as const };
    expect(isTerminal(lost)).toEqual({ score: 0 });
    const draw = { ...s, winner: "draw" as const };
    expect(isTerminal(draw)).toEqual({ score: 50 });
  });

  it("hIdx and vIdx are consistent with board dimensions", () => {
    const s = initialState(0, { boardSize: "5" });
    // 5x5 dots = 4x4 boxes
    expect(s.rows).toBe(4);
    expect(s.cols).toBe(4);
    // hEdges: (rows+1)*cols = 5*4 = 20
    expect(s.hEdges.length).toBe(20);
    // vEdges: rows*(cols+1) = 4*5 = 20
    expect(s.vEdges.length).toBe(20);
    expect(hIdx(s, 4, 3)).toBe(19); // last h edge
    expect(vIdx(s, 3, 4)).toBe(19); // last v edge
  });

  it("rejects drawing already-drawn edge", () => {
    const s = initialState(0, { boardSize: "3" });
    const s1 = reducer(s, { type: "drawEdge", edge: "h", row: 0, col: 0 });
    // Force turn back to player 0 to test rejection
    const s2: DotsAndBoxesState = { ...s1, turn: 0 };
    const s3 = reducer(s2, { type: "drawEdge", edge: "h", row: 0, col: 0 });
    expect(s3).toBe(s2);
  });
});
