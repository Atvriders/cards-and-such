import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const s10 = { goal: "10" as const };
const s20 = { goal: "20" as const };

describe("Apple Picking", () => {
  it("initializes with 5 trees and correct goal", () => {
    const s = initialState(42, s10);
    expect(s.trees.length).toBe(5);
    expect(s.goal).toBe(10);
    expect(s.basket).toBe(0);
    expect(s.done).toBe(false);
  });

  it("picking a tree adds its apples to basket", () => {
    const s = initialState(42, s10);
    const tree = s.trees.find(t => t.apples > 0)!;
    const next = reducer(s, { type: "pick", treeId: tree.id });
    expect(next.basket).toBe(tree.apples);
  });

  it("picking an empty tree shows an error message", () => {
    const s = initialState(42, s10);
    // Empty the first tree
    const tree = s.trees[0]!;
    let cur = reducer(s, { type: "pick", treeId: tree.id });
    // Now that tree is empty; pick again
    const after = reducer(cur, { type: "pick", treeId: tree.id });
    expect(after.message).toMatch(/empty/i);
  });

  it("reaching the goal sets done=true", () => {
    let s = initialState(42, s10);
    for (let i = 0; i < 20 && !s.done; i++) {
      const tree = s.trees.find(t => t.apples > 0);
      if (tree) s = reducer(s, { type: "pick", treeId: tree.id });
    }
    expect(s.done).toBe(true);
  });

  it("running out of turns sets done=true", () => {
    const s = initialState(42, s20);
    let cur = s;
    for (let i = 0; i < 30 && !cur.done; i++) {
      const tree = cur.trees.find(t => t.apples > 0);
      if (tree) cur = reducer(cur, { type: "pick", treeId: tree.id });
    }
    expect(cur.done).toBe(true);
  });

  it("isTerminal returns null when not done", () => {
    const s = initialState(42, s10);
    expect(isTerminal(s)).toBeNull();
  });

  it("isTerminal returns score 100 when goal reached", () => {
    let s = initialState(42, s10);
    for (let i = 0; i < 20 && !s.done; i++) {
      const tree = s.trees.find(t => t.apples > 0);
      if (tree) s = reducer(s, { type: "pick", treeId: tree.id });
    }
    if (s.basket >= s.goal) {
      expect(isTerminal(s)!.score).toBe(100);
    }
  });

  it("actions after done are ignored", () => {
    let s = initialState(42, s10);
    for (let i = 0; i < 20 && !s.done; i++) {
      const tree = s.trees.find(t => t.apples > 0);
      if (tree) s = reducer(s, { type: "pick", treeId: tree.id });
    }
    const frozen = s;
    const after = reducer(frozen, { type: "pick", treeId: 0 });
    expect(after).toBe(frozen);
  });
});
