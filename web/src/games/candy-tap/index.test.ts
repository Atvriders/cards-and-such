import { describe, it, expect } from "vitest";
import { candyTapPlugin } from "./index.js";
import type { CandyTapState } from "./state.js";

describe("candyTapPlugin", () => {
  it("has correct plugin shape", () => {
    expect(candyTapPlugin.id).toBe("candy-tap");
    expect(candyTapPlugin.title).toBe("Candy Tap");
    expect(candyTapPlugin.category).toBe("arcade");
    expect(candyTapPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof candyTapPlugin.initialState).toBe("function");
    expect(typeof candyTapPlugin.reducer).toBe("function");
    expect(typeof candyTapPlugin.isTerminal).toBe("function");
    expect(typeof candyTapPlugin.hint).toBe("function");
    expect(candyTapPlugin.component).toBeDefined();
  });

  it("produces deterministic initialState and null isTerminal", () => {
    const s1 = candyTapPlugin.initialState(42, { dummy: false });
    const s2 = candyTapPlugin.initialState(42, { dummy: false });
    expect(s1).toEqual(s2);
    expect(s1.rngSeed).toBe(42);
    expect(s1.targets).toEqual([]);
    expect(s1.score).toBe(0);
    expect(s1.popped).toBe(0);
    expect(s1.missed).toBe(0);
    expect(s1.ticksRemaining).toBe(30);
    expect(s1.phase).toBe("playing");
    expect(candyTapPlugin.isTerminal!(s1)).toBeNull();
  });

  it("hint returns null when no targets or done, returns HintTarget when targets present", () => {
    const empty = candyTapPlugin.initialState(1, { dummy: false });
    expect(candyTapPlugin.hint!(empty)).toBeNull();

    const done: CandyTapState = { ...empty, phase: "done" };
    expect(candyTapPlugin.hint!(done)).toBeNull();

    const withTargets: CandyTapState = {
      ...empty,
      targets: [{ id: 1, lane: 0, ticksLeft: 3 }],
    };
    const hint = candyTapPlugin.hint!(withTargets);
    expect(hint).not.toBeNull();
    expect(hint).toEqual({ selector: ".fc-target", pulses: 3 });
  });
});
