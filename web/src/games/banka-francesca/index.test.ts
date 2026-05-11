import { describe, it, expect } from "vitest";
import { bankaFrancescaPlugin } from "./index.js";
import type { BankaFrancescaState } from "./state.js";

const S = { dummy: false } as never;

describe("banka-francesca plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(bankaFrancescaPlugin.id).toBe("banka-francesca");
    expect(bankaFrancescaPlugin.title).toBe("Banka Francesca");
    expect(bankaFrancescaPlugin.category).toBe("dice");
    expect(bankaFrancescaPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof bankaFrancescaPlugin.description).toBe("string");
    expect(bankaFrancescaPlugin.description.length).toBeGreaterThan(0);
    expect(bankaFrancescaPlugin.settings).toBeDefined();
    expect(typeof bankaFrancescaPlugin.settings).toBe("object");
    expect(typeof bankaFrancescaPlugin.initialState).toBe("function");
    expect(typeof bankaFrancescaPlugin.reducer).toBe("function");
    expect(typeof bankaFrancescaPlugin.isTerminal).toBe("function");
    expect(bankaFrancescaPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on a fresh game", () => {
    const a = bankaFrancescaPlugin.initialState(1234, S);
    const b = bankaFrancescaPlugin.initialState(1234, S);
    expect(a).toEqual(b);
    expect(a.rngSeed).toBe(1234);
    expect(a.round).toBe(1);
    expect(a.prediction).toBeNull();
    expect(a.dice).toBeNull();
    expect(a.resultIdx).toBeNull();
    expect(a.score).toBe(0);
    expect(a.phase).toBe("predict");
    expect(bankaFrancescaPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when terminal", () => {
    expect(typeof bankaFrancescaPlugin.hint).toBe("function");
    const state = bankaFrancescaPlugin.initialState(7, S);
    const result = bankaFrancescaPlugin.hint!(state);
    expect(result).not.toBeNull();
    expect(typeof result!.selector).toBe("string");
    expect(result!.selector.length).toBeGreaterThan(0);
    expect(result!.selector).toBe('[data-testid="hint-target-banka-francesca-primary"]');
    if (result!.pulses !== undefined) {
      expect(typeof result!.pulses).toBe("number");
      expect(result!.pulses).toBeGreaterThan(0);
    }

    const done: BankaFrancescaState = { ...state, phase: "done" };
    expect(bankaFrancescaPlugin.isTerminal(done)).toEqual({ score: done.score });
    expect(bankaFrancescaPlugin.hint!(done)).toBeNull();
  });
});
