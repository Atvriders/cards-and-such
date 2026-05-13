import { describe, expect, it } from "vitest";
import {
  BOARD,
  BOARD_LEN,
  CAGE_TRACK,
  CHEESE_WHEEL_SQUARE,
  NUM_PLAYERS,
  PART_NAMES,
  initialState,
  isTerminal,
  reducer,
  score,
  type MouseTrapFullState,
} from "./state.js";

const defaults = { _dummy: false } as const;

describe("Mouse Trap (Full Build)", () => {
  it("initial state is deterministic by seed", () => {
    const a = initialState(123, defaults);
    const b = initialState(123, defaults);
    expect(a).toEqual(b);
    const c = initialState(124, defaults);
    expect(c.rngSeed).not.toBe(a.rngSeed);
  });

  it("fresh state has all defaults set up correctly", () => {
    const s = initialState(7, defaults);
    expect(s.positions).toEqual(new Array(NUM_PLAYERS).fill(0));
    expect(s.caught).toEqual(new Array(NUM_PLAYERS).fill(false));
    expect(s.partsBuilt).toEqual(new Array(PART_NAMES.length).fill(false));
    expect(s.armed).toBe(false);
    expect(s.phase).toBe("rolling");
    expect(s.winner).toBeNull();
    expect(s.current).toBe(0);
    expect(s.trapFired).toBe(false);
    expect(BOARD.length).toBe(BOARD_LEN);
  });

  it("isTerminal is null on fresh state", () => {
    const s = initialState(1, defaults);
    expect(isTerminal(s)).toBeNull();
  });

  it("BOARD has 8 build squares (1..8) mapping to PART_NAMES", () => {
    for (let i = 1; i <= 8; i++) {
      expect(BOARD[i]!.kind).toBe("build");
      expect(BOARD[i]!.buildIndex).toBe(i - 1);
    }
    expect(BOARD[CHEESE_WHEEL_SQUARE]!.kind).toBe("cheese");
  });

  it("rolling produces a 1..6 result and moves player 0", () => {
    const s = initialState(42, defaults);
    const next = reducer(s, { type: "roll" });
    expect(next.lastRoll).not.toBeNull();
    expect(next.lastRoll!).toBeGreaterThanOrEqual(1);
    expect(next.lastRoll!).toBeLessThanOrEqual(6);
    expect(next.phase).toBe("resolved");
    expect(next.positions[0]!).toBe((s.positions[0]! + next.lastRoll!) % BOARD_LEN);
  });

  it("illegal action returns the same state reference", () => {
    const s = initialState(42, defaults);
    // Calling 'next' while still in 'rolling' phase is illegal.
    const same = reducer(s, { type: "next" });
    expect(same).toBe(s);
  });

  it("landing on a build square marks the part as built", () => {
    // Force player to be at position 0 and roll deterministic by seed.
    let s = initialState(42, defaults);
    s = reducer(s, { type: "roll" });
    // If we happened to land on a build square, the corresponding part is built.
    const landed = BOARD[s.positions[0]!]!;
    if (landed.kind === "build" && typeof landed.buildIndex === "number") {
      expect(s.partsBuilt[landed.buildIndex]).toBe(true);
    }
  });

  it("building all 8 parts arms the trap", () => {
    // Manually set 7 parts then simulate a synthetic "roll" that lands on the 8th.
    const s0 = initialState(1, defaults);
    const partsBuilt = new Array(PART_NAMES.length).fill(true);
    partsBuilt[7] = false; // last one missing
    // Find a build square for the missing part (index 7 → square 8).
    // We construct an artificial state with current player one square shy.
    const synth: MouseTrapFullState = {
      ...s0,
      positions: [7, 0, 0, 0],
      partsBuilt,
      armed: false,
    };
    const after = reducer(synth, { type: "roll" });
    // Whatever they roll, the build state should be unchanged unless they
    // landed on square 8. We deterministically check the armed flag is set
    // only if the roll happens to land them on a build square for an
    // unbuilt part — otherwise it stays false. Repeat to find a roll
    // outcome where the trap is armed.
    let s = synth;
    let armedAtSomePoint = false;
    for (let attempt = 0; attempt < 20 && !armedAtSomePoint; attempt++) {
      s = { ...synth, rngSeed: attempt + 1, positions: [7, 0, 0, 0] };
      const r = reducer(s, { type: "roll" });
      if (r.armed) armedAtSomePoint = true;
    }
    expect(armedAtSomePoint).toBe(true);
    void after; // satisfy unused
  });

  it("armed trap fires when active player lands on the cheese wheel", () => {
    const s0 = initialState(1, defaults);
    // Synthesize: trap armed, player 0 one square shy of cheese (sq 18),
    // player 1 sitting on a cage track square.
    const armedState: MouseTrapFullState = {
      ...s0,
      armed: true,
      partsBuilt: new Array(PART_NAMES.length).fill(true),
      positions: [CHEESE_WHEEL_SQUARE - 1, CAGE_TRACK[0]!, 0, 0],
    };
    // Try multiple seeds until the d6 lands player 0 exactly on the cheese.
    let fired: MouseTrapFullState | null = null;
    for (let seed = 1; seed < 500 && fired === null; seed++) {
      const r = reducer({ ...armedState, rngSeed: seed }, { type: "roll" });
      if (r.positions[0] === CHEESE_WHEEL_SQUARE) fired = r;
    }
    expect(fired).not.toBeNull();
    // Player 1 was on the cage track and should now be caught.
    expect(fired!.caught[1]).toBe(true);
    expect(fired!.trapFired).toBe(true);
    expect(fired!.caughtByHuman).toBeGreaterThanOrEqual(1);
  });

  it("trap with all opponents on cage track ends the game with human win", () => {
    const s0 = initialState(1, defaults);
    const armedState: MouseTrapFullState = {
      ...s0,
      armed: true,
      partsBuilt: new Array(PART_NAMES.length).fill(true),
      positions: [
        CHEESE_WHEEL_SQUARE - 1,
        CAGE_TRACK[0]!,
        CAGE_TRACK[1]!,
        CAGE_TRACK[2]!,
      ],
    };
    let end: MouseTrapFullState | null = null;
    for (let seed = 1; seed < 1000 && end === null; seed++) {
      const r = reducer({ ...armedState, rngSeed: seed }, { type: "roll" });
      if (r.phase === "done") end = r;
    }
    expect(end).not.toBeNull();
    expect(end!.winner).toBe(0);
    const term = isTerminal(end!);
    expect(term).not.toBeNull();
    // +50 × 3 caught + 100 win bonus
    expect(term!.score).toBe(50 * 3 + 100);
    expect(score(end!)).toBe(250);
  });

  it("end-turn advances to the next non-caught player", () => {
    const s0 = initialState(99, defaults);
    const s = reducer(s0, { type: "roll" });
    expect(s.phase).toBe("resolved");
    const next = reducer(s, { type: "next" });
    expect(next.current).toBe(1);
    expect(next.phase).toBe("rolling");
    expect(next.turn).toBe(s.turn + 1);
  });

  it("cpu-step is a no-op when it's the human's turn", () => {
    const s = initialState(5, defaults);
    expect(reducer(s, { type: "cpu-step" })).toBe(s);
  });

  it("cpu-step advances when it's a CPU's turn (rolling phase)", () => {
    const s0 = initialState(5, defaults);
    // Human rolls and ends turn → CPU 1 now active.
    const s1 = reducer(reducer(s0, { type: "roll" }), { type: "next" });
    expect(s1.current).toBe(1);
    const s2 = reducer(s1, { type: "cpu-step" });
    // After cpu-step, either we advanced to next player or game ended.
    expect(s2).not.toBe(s1);
  });
});
