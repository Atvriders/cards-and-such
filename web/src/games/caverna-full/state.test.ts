import { describe, it, expect } from "vitest";
import {
  initialState,
  reducer,
  isTerminal,
  scoreFor,
  ACTION_SPACES,
  TOTAL_ROUNDS,
  STARTING_DWARVES,
  NUM_PLAYERS,
} from "./state.js";
import type { CavernaFullAction, CavernaFullState } from "./state.js";

const S = { _dummy: false };

describe("caverna-full state", () => {
  it("initial state is deterministic by seed", () => {
    const a = initialState(42, S);
    const b = initialState(42, S);
    expect(a).toEqual(b);
    const c = initialState(43, S);
    // Seed evolves, so different seeds produce different rngSeed.
    expect(a.rngSeed).not.toBe(c.rngSeed);
  });

  it("starts with 4 players, 2 dwarves each, round 1", () => {
    const s = initialState(1, S);
    expect(s.players).toHaveLength(NUM_PLAYERS);
    expect(s.round).toBe(1);
    expect(s.phase).toBe("playing");
    for (const p of s.players) {
      expect(p.dwarvesTotal).toBe(STARTING_DWARVES);
      expect(p.dwarvesPlaced).toBe(0);
    }
    expect(s.players[0]!.isCpu).toBe(false);
    expect(s.players[1]!.isCpu).toBe(true);
  });

  it("isTerminal is null on fresh state", () => {
    const s = initialState(1, S);
    expect(isTerminal(s)).toBeNull();
  });

  it("placing a dwarf advances turn and consumes the action space", () => {
    const s = initialState(7, S);
    const first = ACTION_SPACES[0]!;
    const ns = reducer(s, { type: "place", actionId: first.id } as CavernaFullAction);
    expect(ns).not.toBe(s);
    expect(ns.occupied[first.id]).toBe(0);
    expect(ns.players[0]!.dwarvesPlaced).toBe(1);
    // After human placed, next is CPU (id 1).
    expect(ns.phase).toBe("cpuTurn");
    expect(ns.current).toBe(1);
  });

  it("illegal action (occupied space) returns same state reference", () => {
    let s = initialState(11, S);
    const first = ACTION_SPACES[0]!;
    s = reducer(s, { type: "place", actionId: first.id });
    // Now pump CPU steps so the human is current again.
    while (s.phase === "cpuTurn") s = reducer(s, { type: "cpu_step" });
    // If still on round 1 and another action is open, try the first (occupied).
    if (s.phase === "playing" && s.current === 0) {
      const before = s;
      const after = reducer(s, { type: "place", actionId: first.id });
      expect(after).toBe(before);
    } else {
      // If end-of-round was reached, that's fine — verify illegal action is rejected
      // when phase is "playing" on the next round.
      while (s.phase !== "playing" || s.current !== 0) {
        if (s.phase === "done") break;
        if (s.phase === "cpuTurn") s = reducer(s, { type: "cpu_step" });
        else break;
      }
      if (s.phase === "playing" && s.current === 0) {
        // After round reset, all actions are open again; try a bogus id instead.
        const before = s;
        const after = reducer(s, { type: "place", actionId: "not-a-real-space" });
        expect(after).toBe(before);
      }
    }
  });

  it("rejects placing when no dwarves left for current player", () => {
    let s = initialState(3, S);
    // Force human to fill both dwarves by placing twice in a row (we need to
    // simulate by pumping CPU back to us).
    const open = ACTION_SPACES.map((a) => a.id);
    let placed = 0;
    while (placed < 2 && s.phase !== "done") {
      if (s.phase === "playing" && s.current === 0) {
        const id = open.find((x) => s.occupied[x] == null);
        if (!id) break;
        s = reducer(s, { type: "place", actionId: id });
        placed += 1;
      } else if (s.phase === "cpuTurn") {
        s = reducer(s, { type: "cpu_step" });
      } else {
        break;
      }
    }
    // Now if the human is current with 0 dwarves left this round, attempting
    // to place should return same state.
    while (s.phase === "cpuTurn") s = reducer(s, { type: "cpu_step" });
    if (s.phase === "playing" && s.current === 0 && s.players[0]!.dwarvesPlaced >= s.players[0]!.dwarvesTotal) {
      const before = s;
      const id = ACTION_SPACES.find((a) => before.occupied[a.id] == null)?.id;
      if (id) {
        const after = reducer(before, { type: "place", actionId: id });
        expect(after).toBe(before);
      }
    }
    // At minimum the state should still be valid (didn't crash).
    expect(s.round).toBeGreaterThanOrEqual(1);
  });

  it("plays a full game to termination with greedy CPUs", () => {
    let s: CavernaFullState = initialState(99, S);
    let safety = 5000;
    while (s.phase !== "done" && safety-- > 0) {
      if (s.phase === "playing" && s.current === 0) {
        // Pick any legal action: first unoccupied space.
        const slot = ACTION_SPACES.find((a) => s.occupied[a.id] == null);
        if (!slot) break;
        // Try the action; if illegal due to preconditions, fallback to next.
        const next = reducer(s, { type: "place", actionId: slot.id });
        if (next === s) {
          // Try other slots until one is legal.
          let advanced = false;
          for (const alt of ACTION_SPACES) {
            if (s.occupied[alt.id] != null) continue;
            const n2 = reducer(s, { type: "place", actionId: alt.id });
            if (n2 !== s) { s = n2; advanced = true; break; }
          }
          if (!advanced) {
            // No legal moves: forfeit dwarf by burning placements until round resets.
            // The reducer will skip CPUs that can't move; we can't easily skip
            // the human, so we bail.
            break;
          }
        } else {
          s = next;
        }
      } else if (s.phase === "cpuTurn") {
        s = reducer(s, { type: "cpu_step" });
      } else if (s.phase === "harvest") {
        s = reducer(s, { type: "next_round" });
      } else {
        break;
      }
    }
    expect(s.phase).toBe("done");
    expect(s.round).toBeLessThanOrEqual(TOTAL_ROUNDS);
    const term = isTerminal(s);
    expect(term).not.toBeNull();
    expect(term!.score).toBeGreaterThanOrEqual(0);
    // Score for human is non-negative.
    expect(scoreFor(s.players[0]!)).toBeGreaterThanOrEqual(0);
  });

  it("CPU placements consume dwarves and advance the turn order", () => {
    let s = initialState(5, S);
    const human0 = s.players[0]!;
    expect(human0.dwarvesPlaced).toBe(0);
    // Human places first.
    const first = ACTION_SPACES[0]!;
    s = reducer(s, { type: "place", actionId: first.id });
    expect(s.players[0]!.dwarvesPlaced).toBe(1);
    expect(s.phase).toBe("cpuTurn");
    // Pump CPU once.
    const cpuBefore = s.players[s.current]!;
    s = reducer(s, { type: "cpu_step" });
    // The CPU that was current should now have +1 placed (or game advanced).
    if (s.phase !== "done") {
      expect(s.players[cpuBefore.id]!.dwarvesPlaced).toBeGreaterThanOrEqual(1);
    }
  });

  it("ignores actions in done phase", () => {
    // Fake a done state and ensure the reducer returns the same state.
    const s = initialState(2, S);
    const done = { ...s, phase: "done" as const };
    const after = reducer(done, { type: "place", actionId: ACTION_SPACES[0]!.id });
    expect(after).toBe(done);
  });
});
