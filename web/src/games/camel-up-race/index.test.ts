import { describe, it, expect } from "vitest";
import { camelUpRacePlugin } from "./index.js";
import type { RaceState } from "./state.js";

const S = { dummy: false } as never;

describe("camel-up-race plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(camelUpRacePlugin.id).toBe("camel-up-race");
    expect(camelUpRacePlugin.title).toBe("Camel Up");
    expect(camelUpRacePlugin.category).toBe("board");
    expect(camelUpRacePlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof camelUpRacePlugin.description).toBe("string");
    expect(camelUpRacePlugin.description.length).toBeGreaterThan(0);
    expect(camelUpRacePlugin.settings).toBeDefined();
    expect(typeof camelUpRacePlugin.settings).toBe("object");
    expect(typeof camelUpRacePlugin.initialState).toBe("function");
    expect(typeof camelUpRacePlugin.reducer).toBe("function");
    expect(typeof camelUpRacePlugin.isTerminal).toBe("function");
    expect(camelUpRacePlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh state", () => {
    const a = camelUpRacePlugin.initialState(42, S);
    const b = camelUpRacePlugin.initialState(42, S);
    expect(a.pPositions).toEqual(b.pPositions);
    expect(a.cPositions).toEqual(b.cPositions);
    expect(a.rngSeed).toBe(b.rngSeed);
    expect(a.turn).toBe(b.turn);
    expect(a.phase).toBe(b.phase);
    expect(a.winner).toBe(b.winner);
    expect(a.pPositions.length).toBe(5);
    expect(a.cPositions.length).toBe(5);
    expect(a.pPositions.every((p) => p === 0)).toBe(true);
    expect(a.cPositions.every((p) => p === 0)).toBe(true);
    expect(camelUpRacePlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while rolling and null otherwise", () => {
    expect(typeof camelUpRacePlugin.hint).toBe("function");
    const state = camelUpRacePlugin.initialState(7, S);
    expect(state.phase).toBe("rolling");
    const rolling = camelUpRacePlugin.hint!(state);
    expect(rolling).not.toBeNull();
    if (rolling !== null) {
      expect(typeof rolling.selector).toBe("string");
      expect(rolling.selector.length).toBeGreaterThan(0);
      expect(rolling.selector).toBe('[data-testid="hint-target-camel-up-race-primary"]');
      expect(rolling.pulses).toBe(3);
    }

    const moving: RaceState = { ...state, phase: "moving" };
    expect(camelUpRacePlugin.hint!(moving)).toBeNull();

    const done: RaceState = { ...state, phase: "done" };
    expect(camelUpRacePlugin.hint!(done)).toBeNull();
  });
});
