import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, getNode } from "./state.js";

describe("Choose Your Path: Fantasy", () => {
  it("starts at start node in playing phase", () => {
    const s = initialState(1);
    expect(s.nodeId).toBe("start");
    expect(s.phase).toBe("playing");
    expect(s.steps).toBe(0);
  });

  it("choosing an option advances the node", () => {
    const s = initialState(1);
    const s2 = reducer(s, { type: "choose", nextId: "accept", scoreAdd: 0 });
    expect(s2.nodeId).toBe("accept");
    expect(s2.steps).toBe(1);
  });

  it("scoreAdd accumulates correctly", () => {
    const s = initialState(1);
    const s2 = reducer(s, { type: "choose", nextId: "mountain_pass", scoreAdd: 0 });
    const s3 = reducer(s2, { type: "choose", nextId: "gryphon_flight", scoreAdd: 10 });
    expect(s3.scoreBonus).toBe(10);
  });

  it("terminal node (no choices) ends game", () => {
    const s = initialState(1);
    const s2 = reducer(s, { type: "choose", nextId: "victory", scoreAdd: 0 });
    expect(s2.phase).toBe("done");
  });

  it("isTerminal null during play", () => {
    expect(isTerminal(initialState(1))).toBeNull();
  });

  it("isTerminal returns 100 on victory", () => {
    const s = initialState(1);
    const s2 = reducer(s, { type: "choose", nextId: "victory", scoreAdd: 0 });
    const r = isTerminal(s2);
    expect(r).not.toBeNull();
    expect(r!.score).toBe(100);
  });

  it("getNode returns correct node", () => {
    const n = getNode("sunstone_search");
    expect(n.id).toBe("sunstone_search");
    expect(n.choices.length).toBeGreaterThan(0);
  });

  it("actions ignored when done", () => {
    const s = { ...initialState(1), phase: "done" as const };
    const s2 = reducer(s, { type: "choose", nextId: "accept", scoreAdd: 5 });
    expect(s2.nodeId).toBe("start");
  });
});
