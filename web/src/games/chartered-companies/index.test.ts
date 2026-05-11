import { describe, it, expect } from "vitest";
import { charteredCompaniesPlugin } from "./index.js";
import type { CharteredCompaniesState } from "./state.js";

const S = { dummy: false } as never;

describe("chartered-companies plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(charteredCompaniesPlugin.id).toBe("chartered-companies");
    expect(charteredCompaniesPlugin.title).toBe("Chartered Companies");
    expect(charteredCompaniesPlugin.category).toBe("board");
    expect(charteredCompaniesPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof charteredCompaniesPlugin.description).toBe("string");
    expect(charteredCompaniesPlugin.description.length).toBeGreaterThan(0);
    expect(charteredCompaniesPlugin.settings).toBeDefined();
    expect(typeof charteredCompaniesPlugin.settings).toBe("object");
    expect(typeof charteredCompaniesPlugin.initialState).toBe("function");
    expect(typeof charteredCompaniesPlugin.reducer).toBe("function");
    expect(typeof charteredCompaniesPlugin.isTerminal).toBe("function");
    expect(charteredCompaniesPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh game", () => {
    const a = charteredCompaniesPlugin.initialState(42, S);
    const b = charteredCompaniesPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.turn).toBe(1);
    expect(a.cash).toBe(200);
    expect(a.assets).toBe(0);
    expect(a.workers).toBe(0);
    expect(a.phase).toBe("choosing");
    expect(charteredCompaniesPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget when choosing and null otherwise", () => {
    expect(typeof charteredCompaniesPlugin.hint).toBe("function");
    const state = charteredCompaniesPlugin.initialState(5, S);
    const result = charteredCompaniesPlugin.hint!(state);
    expect(result).not.toBeNull();
    expect(typeof result!.selector).toBe("string");
    expect(result!.selector.length).toBeGreaterThan(0);
    expect(result!.selector).toBe('[data-testid="hint-target-chartered-companies-primary"]');
    if (result!.pulses !== undefined) {
      expect(typeof result!.pulses).toBe("number");
      expect(result!.pulses).toBeGreaterThan(0);
    }

    const resolved: CharteredCompaniesState = { ...state, phase: "resolved" };
    expect(charteredCompaniesPlugin.hint!(resolved)).toBeNull();

    const done: CharteredCompaniesState = { ...state, phase: "done" };
    expect(charteredCompaniesPlugin.hint!(done)).toBeNull();
    expect(charteredCompaniesPlugin.isTerminal(done)).not.toBeNull();
  });
});
