import { describe, it, expect } from "vitest";
import { pushHistory, popHistory, UNDO_LIMIT } from "./undoHistory";

type S = { value: number; history: S[] };

describe("pushHistory", () => {
  it("appends a snapshot with cleared history", () => {
    const state: S = { value: 1, history: [] };
    const next = pushHistory(state);
    expect(next).toHaveLength(1);
    expect(next[0]!.value).toBe(1);
    expect(next[0]!.history).toEqual([]);
    // does not mutate original
    expect(state.history).toEqual([]);
  });

  it("caps history at UNDO_LIMIT entries by discarding the oldest", () => {
    let history: S[] = [];
    for (let i = 0; i < UNDO_LIMIT + 3; i++) {
      history = pushHistory({ value: i, history });
    }
    expect(history).toHaveLength(UNDO_LIMIT);
    // Oldest three (0, 1, 2) should have been dropped
    expect(history[0]!.value).toBe(3);
    expect(history[history.length - 1]!.value).toBe(UNDO_LIMIT + 2);
  });
});

describe("popHistory", () => {
  it("returns null when there is no history to undo", () => {
    const state: S = { value: 42, history: [] };
    expect(popHistory(state)).toBeNull();
  });

  it("restores the most recent snapshot and shrinks remaining history", () => {
    const base: S = { value: 1, history: [] };
    const h1 = pushHistory(base); // snapshot of value=1
    const mid: S = { value: 2, history: h1 };
    const h2 = pushHistory(mid); // snapshots [1, 2]
    const current: S = { value: 3, history: h2 };

    const undone = popHistory(current);
    expect(undone).not.toBeNull();
    expect(undone!.value).toBe(2);
    expect(undone!.history).toHaveLength(1);
    expect(undone!.history[0]!.value).toBe(1);

    const undoneAgain = popHistory(undone!);
    expect(undoneAgain).not.toBeNull();
    expect(undoneAgain!.value).toBe(1);
    expect(undoneAgain!.history).toEqual([]);

    // Once history is empty, further pops yield null
    expect(popHistory(undoneAgain!)).toBeNull();
  });
});
