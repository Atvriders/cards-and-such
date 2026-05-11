import { describe, it, expect } from "vitest";
import { crewDeepSeaCoopPlugin } from "./index.js";
import type { CrewDeepSeaCoopState } from "./state.js";

const S = { difficulty: "Standard" } as const;

describe("crew-deep-sea-coop plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(crewDeepSeaCoopPlugin.id).toBe("crew-deep-sea-coop");
    expect(crewDeepSeaCoopPlugin.title).toBe("The Crew: Deep Sea");
    expect(crewDeepSeaCoopPlugin.category).toBe("board");
    expect(crewDeepSeaCoopPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof crewDeepSeaCoopPlugin.description).toBe("string");
    expect(crewDeepSeaCoopPlugin.description.length).toBeGreaterThan(0);
    expect(crewDeepSeaCoopPlugin.settings).toBeDefined();
    expect(typeof crewDeepSeaCoopPlugin.settings).toBe("object");
    expect(typeof crewDeepSeaCoopPlugin.initialState).toBe("function");
    expect(typeof crewDeepSeaCoopPlugin.reducer).toBe("function");
    expect(typeof crewDeepSeaCoopPlugin.isTerminal).toBe("function");
    expect(typeof crewDeepSeaCoopPlugin.hint).toBe("function");
    expect(crewDeepSeaCoopPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = crewDeepSeaCoopPlugin.initialState(42, S);
    const b = crewDeepSeaCoopPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.round).toBe(1);
    expect(a.progress).toBe(0);
    expect(a.threat).toBe(0);
    expect(a.morale).toBeGreaterThan(0);
    expect(a.phase).toBe("choose");
    expect(crewDeepSeaCoopPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns either null or a HintTarget with a non-empty selector", () => {
    const state = crewDeepSeaCoopPlugin.initialState(5, S);
    const result = crewDeepSeaCoopPlugin.hint!(state);
    if (result === null) {
      expect(result).toBeNull();
    } else {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toMatch(/^\[data-testid="hint-target-coop-tactic-/);
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }

    // Force phase "done" to drive coopHintSelector through its null return.
    const finished: CrewDeepSeaCoopState = { ...state, phase: "done" };
    expect(crewDeepSeaCoopPlugin.hint!(finished)).toBeNull();
  });
});
