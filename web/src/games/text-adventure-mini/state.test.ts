import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, getNode } from "./state.js";

describe("Text Adventure Mini", () => {
  it("initializes at start node", () => {
    const s = initialState(1);
    expect(s.nodeId).toBe("start");
    expect(s.phase).toBe("playing");
    expect(s.scoreBonus).toBe(0);
    expect(s.visitedIds).toContain("start");
  });

  it("making a choice advances node", () => {
    const s = initialState(1);
    const s2 = reducer(s, { type: "choose", nextId: "forest_path", scoreAdd: 0 });
    expect(s2.nodeId).toBe("forest_path");
    expect(s2.visitedIds.length).toBe(2);
  });

  it("score bonus accumulates", () => {
    const s = initialState(1);
    const s2 = reducer(s, { type: "choose", nextId: "river", scoreAdd: 0 });
    const s3 = reducer(s2, { type: "choose", nextId: "river_cross", scoreAdd: 10 });
    expect(s3.scoreBonus).toBe(10);
  });

  it("terminal node sets phase done", () => {
    const s = initialState(1);
    const s2 = reducer(s, { type: "choose", nextId: "chest_success", scoreAdd: 0 });
    expect(s2.phase).toBe("done");
  });

  it("isTerminal returns null during play", () => {
    const s = initialState(1);
    expect(isTerminal(s)).toBeNull();
  });

  it("isTerminal returns score on done", () => {
    const s = initialState(1);
    const s2 = reducer(s, { type: "choose", nextId: "chest_success", scoreAdd: 0 });
    const result = isTerminal(s2);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(100);
  });

  it("getNode returns correct node", () => {
    const node = getNode("town");
    expect(node.id).toBe("town");
    expect(node.choices.length).toBeGreaterThan(0);
  });

  it("actions do nothing when game is done", () => {
    const s = { ...initialState(1), phase: "done" as const };
    const s2 = reducer(s, { type: "choose", nextId: "forest_path", scoreAdd: 5 });
    expect(s2.nodeId).toBe("start");
    expect(s2.phase).toBe("done");
  });
});
