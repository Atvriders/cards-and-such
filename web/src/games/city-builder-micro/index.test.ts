import { describe, it, expect } from "vitest";
import { cityBuilderMicroPlugin } from "./index.js";
import type { CityBuilderState } from "./state.js";

const S = {} as never;

describe("city-builder-micro plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(cityBuilderMicroPlugin.id).toBe("city-builder-micro");
    expect(cityBuilderMicroPlugin.title).toBe("City Builder Micro");
    expect(cityBuilderMicroPlugin.category).toBe("board");
    expect(cityBuilderMicroPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof cityBuilderMicroPlugin.description).toBe("string");
    expect(cityBuilderMicroPlugin.description.length).toBeGreaterThan(0);
    expect(cityBuilderMicroPlugin.settings).toBeDefined();
    expect(typeof cityBuilderMicroPlugin.settings).toBe("object");
    expect(typeof cityBuilderMicroPlugin.initialState).toBe("function");
    expect(typeof cityBuilderMicroPlugin.reducer).toBe("function");
    expect(typeof cityBuilderMicroPlugin.isTerminal).toBe("function");
    expect(cityBuilderMicroPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh start", () => {
    const a = cityBuilderMicroPlugin.initialState(42, S) as CityBuilderState;
    const b = cityBuilderMicroPlugin.initialState(42, S) as CityBuilderState;
    expect(a.turn).toBe(b.turn);
    expect(a.budget).toBe(b.budget);
    expect(a.happiness).toBe(b.happiness);
    expect(a.phase).toBe(b.phase);
    expect(a.selectedBuilding).toBe(b.selectedBuilding);
    expect(a.grid.length).toBe(b.grid.length);
    const aGrid = a.grid.map((c) => c.building).join("|");
    const bGrid = b.grid.map((c) => c.building).join("|");
    expect(aGrid).toBe(bGrid);
    expect(cityBuilderMicroPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns either null or a HintTarget with a non-empty selector", () => {
    expect(typeof cityBuilderMicroPlugin.hint).toBe("function");
    const state = cityBuilderMicroPlugin.initialState(5, S) as CityBuilderState;
    const result = cityBuilderMicroPlugin.hint!(state);
    if (result === null) {
      expect(result).toBeNull();
    } else {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toBe(".city-cell");
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }

    // Force the terminal-phase early return branch.
    const finished: CityBuilderState = { ...state, phase: "done" };
    expect(cityBuilderMicroPlugin.hint!(finished)).toBeNull();
  });
});
