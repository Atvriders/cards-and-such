import { describe, it, expect } from "vitest";
import {
  initialState,
  isTerminal,
  isValidMeld,
  meldKind,
  reducer,
} from "./state.js";
import type {
  RummikubFullSettings,
  RummikubFullState,
  Tile,
} from "./state.js";

const settings: RummikubFullSettings = { _dummy: "ok" };

function freshState(seed = 1): RummikubFullState {
  return initialState(seed, settings);
}

/** Helper: build a deterministic state where the human's hand contains
 *  a known valid initial-meld worth ≥30. */
function stateWithRunInHand(seed = 1): { state: RummikubFullState; run: Tile[] } {
  const base = freshState(seed);
  const run: Tile[] = [
    { id: 9001, num: 10, color: "red" },
    { id: 9002, num: 11, color: "red" },
    { id: 9003, num: 12, color: "red" },
    // 10+11+12 = 33 ≥ 30
  ];
  const hands = base.hands.slice();
  hands[0] = [...base.hands[0]!, ...run];
  const handCommitted = [...base.handCommitted, ...run];
  return { state: { ...base, hands, handCommitted }, run };
}

describe("rummikub-full initialState", () => {
  it("deals 14 tiles to each of the 4 seats", () => {
    const s = freshState(42);
    expect(s.hands).toHaveLength(4);
    for (const h of s.hands) expect(h).toHaveLength(14);
  });

  it("leaves 106 - 4*14 = 50 tiles in the pool", () => {
    const s = freshState(42);
    expect(s.pool).toHaveLength(106 - 14 * 4);
  });

  it("is deterministic for a given seed", () => {
    const a = freshState(123);
    const b = freshState(123);
    expect(a.hands.map((h) => h.map((t) => t.id))).toEqual(
      b.hands.map((h) => h.map((t) => t.id)),
    );
    expect(a.pool.map((t) => t.id)).toEqual(b.pool.map((t) => t.id));
  });

  it("returns null from isTerminal on a fresh state", () => {
    expect(isTerminal(freshState(7))).toBeNull();
  });

  it("starts with no melds, nobody opened, turn = 0", () => {
    const s = freshState(2);
    expect(s.table).toHaveLength(0);
    expect(s.opened).toEqual([false, false, false, false]);
    expect(s.turn).toBe(0);
  });
});

describe("meld validation", () => {
  it("accepts a 3-tile group", () => {
    const meld: Tile[] = [
      { id: 1, num: 7, color: "red" },
      { id: 2, num: 7, color: "blue" },
      { id: 3, num: 7, color: "orange" },
    ];
    expect(meldKind(meld)).toBe("group");
    expect(isValidMeld(meld)).toBe(true);
  });

  it("accepts a 3-tile run", () => {
    const meld: Tile[] = [
      { id: 1, num: 4, color: "blue" },
      { id: 2, num: 5, color: "blue" },
      { id: 3, num: 6, color: "blue" },
    ];
    expect(meldKind(meld)).toBe("run");
  });

  it("rejects 2-tile candidates", () => {
    const meld: Tile[] = [
      { id: 1, num: 4, color: "blue" },
      { id: 2, num: 5, color: "blue" },
    ];
    expect(isValidMeld(meld)).toBe(false);
  });

  it("rejects mixed-color runs", () => {
    const meld: Tile[] = [
      { id: 1, num: 4, color: "blue" },
      { id: 2, num: 5, color: "red" },
      { id: 3, num: 6, color: "blue" },
    ];
    expect(isValidMeld(meld)).toBe(false);
  });

  it("rejects duplicate colors in a group", () => {
    const meld: Tile[] = [
      { id: 1, num: 7, color: "red" },
      { id: 2, num: 7, color: "red" },
      { id: 3, num: 7, color: "blue" },
    ];
    expect(isValidMeld(meld)).toBe(false);
  });

  it("accepts a run with a joker filling a gap", () => {
    const meld: Tile[] = [
      { id: 1, num: 4, color: "blue" },
      { id: 2, num: 0, color: "joker" },
      { id: 3, num: 6, color: "blue" },
    ];
    expect(meldKind(meld)).toBe("run");
  });
});

describe("rummikub-full reducer", () => {
  it("toggle-hand selects and deselects tiles", () => {
    const s = freshState(5);
    const id = s.hands[0]![0]!.id;
    const a = reducer(s, { type: "toggle-hand", id });
    expect(a.selectedHandIds).toContain(id);
    const b = reducer(a, { type: "toggle-hand", id });
    expect(b.selectedHandIds).not.toContain(id);
  });

  it("place-new-meld rejects an invalid hand selection (no-op)", () => {
    const s = freshState(5);
    const ids = s.hands[0]!.slice(0, 2).map((t) => t.id);
    let cur: RummikubFullState = s;
    for (const id of ids) cur = reducer(cur, { type: "toggle-hand", id });
    const after = reducer(cur, { type: "place-new-meld" });
    expect(after.table).toHaveLength(0);
    expect(after.hands[0]!.length).toBe(s.hands[0]!.length);
  });

  it("place-new-meld puts a valid hand selection on the table", () => {
    const { state, run } = stateWithRunInHand(11);
    let cur = state;
    for (const t of run) cur = reducer(cur, { type: "toggle-hand", id: t.id });
    const after = reducer(cur, { type: "place-new-meld" });
    expect(after.table).toHaveLength(1);
    expect(after.table[0]).toHaveLength(3);
    expect(after.hands[0]!.length).toBe(state.hands[0]!.length - 3);
  });

  it("commit without playing any tiles is rejected", () => {
    const s = freshState(7);
    const after = reducer(s, { type: "commit" });
    // No play -> no-op-ish (same hand/table sizes)
    expect(after.hands[0]!.length).toBe(s.hands[0]!.length);
    expect(after.table).toHaveLength(0);
    expect(after.opened[0]).toBe(false);
  });

  it("commit before opening fails when face value < 30", () => {
    // Inject a small valid meld: 1+2+3 red = 6 points
    const base = freshState(13);
    const lowRun: Tile[] = [
      { id: 5001, num: 1, color: "red" },
      { id: 5002, num: 2, color: "red" },
      { id: 5003, num: 3, color: "red" },
    ];
    const hands = base.hands.slice();
    hands[0] = [...base.hands[0]!, ...lowRun];
    const s: RummikubFullState = {
      ...base,
      hands,
      handCommitted: [...base.handCommitted, ...lowRun],
    };
    let cur = s;
    for (const t of lowRun) cur = reducer(cur, { type: "toggle-hand", id: t.id });
    cur = reducer(cur, { type: "place-new-meld" });
    const committed = reducer(cur, { type: "commit" });
    // Initial meld rejected -> opened still false, message mentions 30.
    expect(committed.opened[0]).toBe(false);
    expect(committed.message).toMatch(/30/);
  });

  it("commit opens the player when face value ≥ 30 and advances turn", () => {
    const { state, run } = stateWithRunInHand(17);
    let cur = state;
    for (const t of run) cur = reducer(cur, { type: "toggle-hand", id: t.id });
    cur = reducer(cur, { type: "place-new-meld" });
    cur = reducer(cur, { type: "commit" });
    expect(cur.opened[0]).toBe(true);
    // CPU turns auto-run and the turn ring lands back on 0 (or game ended).
    expect(cur.phase === "play" ? cur.turn : 0).toBe(0);
  });

  it("draw adds a tile and advances turn", () => {
    const s = freshState(21);
    const before = s.hands[0]!.length;
    const poolBefore = s.pool.length;
    const after = reducer(s, { type: "draw" });
    // Hand grew by exactly 1 tile (you drew before turn passed).
    expect(after.hands[0]!.length).toBe(before + 1);
    // Pool shrank by at least one (CPUs may also have drawn if they
    // couldn't play this round).
    expect(after.pool.length).toBeLessThan(poolBefore);
    expect(poolBefore - after.pool.length).toBeGreaterThanOrEqual(1);
    // CPU loop ran, control returns to the player (or game ended).
    expect(after.phase === "play" ? after.turn : 0).toBe(0);
  });

  it("reset-turn rolls back pending plays to the start-of-turn snapshot", () => {
    const { state, run } = stateWithRunInHand(31);
    let cur = state;
    for (const t of run) cur = reducer(cur, { type: "toggle-hand", id: t.id });
    cur = reducer(cur, { type: "place-new-meld" });
    expect(cur.table).toHaveLength(1);
    const reset = reducer(cur, { type: "reset-turn" });
    expect(reset.table).toHaveLength(0);
    expect(reset.hands[0]!.length).toBe(state.hands[0]!.length);
  });

  it("restart deals a fresh hand", () => {
    const s = freshState(41);
    const after = reducer(s, { type: "restart" });
    expect(after.hands[0]!.length).toBe(14);
    expect(after.table).toHaveLength(0);
    expect(after.opened).toEqual([false, false, false, false]);
  });

  it("ignores actions during CPU turns", () => {
    const s: RummikubFullState = { ...freshState(53), turn: 2 };
    const after = reducer(s, { type: "toggle-hand", id: s.hands[0]![0]!.id });
    expect(after).toBe(s);
  });
});

describe("rummikub-full terminal scoring", () => {
  it("returns positive score when the human empties their hand", () => {
    const base = freshState(2);
    const ended: RummikubFullState = {
      ...base,
      phase: "gameover",
      winner: 0,
      hands: [[], base.hands[1]!, base.hands[2]!, base.hands[3]!],
    };
    const t = isTerminal(ended);
    expect(t).not.toBeNull();
    expect(t!.score).toBeGreaterThan(0);
  });

  it("returns 0 when a CPU wins", () => {
    const base = freshState(2);
    const ended: RummikubFullState = {
      ...base,
      phase: "gameover",
      winner: 1,
    };
    expect(isTerminal(ended)!.score).toBe(0);
  });

  it("returns 0 on a stalemate", () => {
    const base = freshState(2);
    const ended: RummikubFullState = {
      ...base,
      phase: "gameover",
      winner: -1,
    };
    expect(isTerminal(ended)!.score).toBe(0);
  });
});
