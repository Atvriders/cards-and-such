import { describe, it, expect } from "vitest";
import { antFarmPlugin } from "./index.js";
import type { AntFarmSettings, AntFarmState } from "./state.js";

const SETTINGS: AntFarmSettings = { difficulty: "normal" };

describe("ant-farm plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(antFarmPlugin.id).toBe("ant-farm");
    expect(antFarmPlugin.title).toBe("Ant Farm");
    expect(antFarmPlugin.category).toBe("board");
    expect(antFarmPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof antFarmPlugin.description).toBe("string");
    expect(antFarmPlugin.description.length).toBeGreaterThan(0);
    expect(antFarmPlugin.settings).toBeDefined();
    expect(typeof antFarmPlugin.settings).toBe("object");
    expect(typeof antFarmPlugin.initialState).toBe("function");
    expect(typeof antFarmPlugin.reducer).toBe("function");
    expect(typeof antFarmPlugin.isTerminal).toBe("function");
    expect(antFarmPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh start", () => {
    const a = antFarmPlugin.initialState(42, SETTINGS);
    const b = antFarmPlugin.initialState(42, SETTINGS);
    expect(a.turn).toBe(b.turn);
    expect(a.maxTurns).toBe(b.maxTurns);
    expect(a.food).toBe(b.food);
    expect(a.population).toBe(b.population);
    expect(a.workers).toBe(b.workers);
    expect(a.soldiers).toBe(b.soldiers);
    expect(a.nurses).toBe(b.nurses);
    expect(a.tunnels).toBe(b.tunnels);
    expect(a.threats).toBe(b.threats);
    expect(a.score).toBe(b.score);
    expect(a.over).toBe(false);
    expect(a.log).toBe(b.log);
    expect(antFarmPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget on active state and null when the game is over", () => {
    expect(typeof antFarmPlugin.hint).toBe("function");
    const fresh = antFarmPlugin.initialState(5, SETTINGS);
    const result = antFarmPlugin.hint!(fresh);
    expect(result).not.toBeNull();
    expect(typeof result!.selector).toBe("string");
    expect(result!.selector.length).toBeGreaterThan(0);
    expect(result!.selector).toBe(".af-btn");
    if (result!.pulses !== undefined) {
      expect(typeof result!.pulses).toBe("number");
      expect(result!.pulses).toBeGreaterThan(0);
    }

    // The hint helper checks for several "done" flags; the plugin's own
    // isTerminal contract uses `over`, so verify both behaviors separately.
    const finishedHint = { ...fresh, gameOver: true } as unknown as AntFarmState;
    expect(antFarmPlugin.hint!(finishedHint)).toBeNull();

    const terminal: AntFarmState = { ...fresh, over: true, score: 123 };
    const term = antFarmPlugin.isTerminal(terminal);
    expect(term).not.toBeNull();
    expect(term!.score).toBe(123);
  });
});
