import { describe, it, expect } from "vitest";
import { breathGaugePlugin } from "./index.js";

describe("breath-gauge plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(breathGaugePlugin.id).toBe("breath-gauge");
    expect(breathGaugePlugin.title).toBe("Breath Gauge");
    expect(breathGaugePlugin.category).toBe("arcade");
    expect(breathGaugePlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof breathGaugePlugin.description).toBe("string");
    expect(breathGaugePlugin.description.length).toBeGreaterThan(0);
    expect(breathGaugePlugin.settings).toBeDefined();
    expect(typeof breathGaugePlugin.settings).toBe("object");
    expect(typeof breathGaugePlugin.initialState).toBe("function");
    expect(typeof breathGaugePlugin.reducer).toBe("function");
    expect(typeof breathGaugePlugin.isTerminal).toBe("function");
    expect(breathGaugePlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh state", () => {
    const settings = { target: "50" as const };
    const a = breathGaugePlugin.initialState(123, settings);
    const b = breathGaugePlugin.initialState(123, settings);
    expect(a).toEqual(b);
    expect(a.rngSeed).toBe(123);
    expect(a.targetPercent).toBe(50);
    expect(a.targetLow).toBe(42);
    expect(a.targetHigh).toBe(58);
    expect(a.rounds).toBe(0);
    expect(a.totalRounds).toBe(5);
    expect(a.holding).toBe(false);
    expect(a.fillPercent).toBe(0);
    expect(a.releasePercent).toBeNull();
    expect(a.score).toBe(0);
    expect(a.roundScores).toEqual([]);
    expect(a.roundResult).toBeNull();
    expect(a.gameOver).toBe(false);
    expect(breathGaugePlugin.isTerminal(a)).toBeNull();

    // Terminal once gameOver flips true.
    const terminal = breathGaugePlugin.isTerminal({ ...a, gameOver: true, score: 750 });
    expect(terminal).toEqual({ score: 750 });
  });

  it("hint returns a HintTarget on active play and null after game over", () => {
    expect(typeof breathGaugePlugin.hint).toBe("function");
    const state = breathGaugePlugin.initialState(7, { target: "75" as const });
    const result = breathGaugePlugin.hint!(state);
    expect(result).not.toBeNull();
    expect(typeof result!.selector).toBe("string");
    expect(result!.selector.length).toBeGreaterThan(0);
    expect(result!.selector).toBe('[data-testid="hint-target-breath-gauge-action"]');
    expect(result!.pulses).toBe(3);

    expect(breathGaugePlugin.hint!({ ...state, gameOver: true })).toBeNull();
  });
});
