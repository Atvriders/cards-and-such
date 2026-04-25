import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, getNode } from "./state.js";

describe("Choose Your Path: Horror", () => {
  it("starts at start node in playing phase", () => {
    const s = initialState(1);
    expect(s.nodeId).toBe("start");
    expect(s.phase).toBe("playing");
  });

  it("choosing advances to next node", () => {
    const s = initialState(1);
    const s2 = reducer(s, { type: "choose", nextId: "manor_door", scoreAdd: 0 });
    expect(s2.nodeId).toBe("manor_door");
    expect(s2.steps).toBe(1);
  });

  it("score bonus accumulates", () => {
    const s = initialState(1);
    const s2 = reducer(s, { type: "choose", nextId: "library", scoreAdd: 0 });
    const s3 = reducer(s2, { type: "choose", nextId: "chapel", scoreAdd: 5 });
    expect(s3.scoreBonus).toBe(5);
  });

  it("terminal node ends game", () => {
    const s = initialState(1);
    const s2 = reducer(s, { type: "choose", nextId: "still_wait", scoreAdd: 0 });
    expect(s2.phase).toBe("done");
  });

  it("isTerminal null while playing", () => {
    expect(isTerminal(initialState(1))).toBeNull();
  });

  it("isTerminal returns score on done", () => {
    const s = initialState(1);
    const s2 = reducer(s, { type: "choose", nextId: "east_ritual", scoreAdd: 0 });
    const r = isTerminal(s2);
    expect(r).not.toBeNull();
    expect(r!.score).toBe(100);
  });

  it("getNode returns correct node", () => {
    const n = getNode("chapel");
    expect(n.id).toBe("chapel");
    expect(n.score).toBe(90);
  });

  it("actions ignored when done", () => {
    const s = { ...initialState(1), phase: "done" as const };
    const s2 = reducer(s, { type: "choose", nextId: "manor_door", scoreAdd: 0 });
    expect(s2.nodeId).toBe("start");
  });
});
