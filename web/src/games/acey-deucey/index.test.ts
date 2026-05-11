import { describe, it, expect } from "vitest";
import { aceyDeuceyPlugin } from "./index.js";
import type { AceyState } from "./state.js";

const S = { dummy: false };

describe("acey-deucey plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(aceyDeuceyPlugin.id).toBe("acey-deucey");
    expect(aceyDeuceyPlugin.title).toBe("Acey-Deucey");
    expect(aceyDeuceyPlugin.category).toBe("board");
    expect(aceyDeuceyPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof aceyDeuceyPlugin.description).toBe("string");
    expect(aceyDeuceyPlugin.description.length).toBeGreaterThan(0);
    expect(aceyDeuceyPlugin.settings).toBeDefined();
    expect(typeof aceyDeuceyPlugin.settings).toBe("object");
    expect(typeof aceyDeuceyPlugin.initialState).toBe("function");
    expect(typeof aceyDeuceyPlugin.reducer).toBe("function");
    expect(typeof aceyDeuceyPlugin.isTerminal).toBe("function");
    expect(aceyDeuceyPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh state", () => {
    const a = aceyDeuceyPlugin.initialState(42, S);
    const b = aceyDeuceyPlugin.initialState(42, S);
    expect(a.rngSeed).toBe(b.rngSeed);
    expect(a.pPoints).toEqual(b.pPoints);
    expect(a.cPoints).toEqual(b.cPoints);
    expect(a.turn).toBe(b.turn);
    expect(a.phase).toBe(b.phase);
    expect(a.pBorne).toBe(0);
    expect(a.cBorne).toBe(0);
    expect(a.winner).toBeNull();
    expect(aceyDeuceyPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget on a live state and null after the game ends", () => {
    expect(typeof aceyDeuceyPlugin.hint).toBe("function");
    const state = aceyDeuceyPlugin.initialState(7, S);
    const result = aceyDeuceyPlugin.hint!(state);
    expect(result).not.toBeNull();
    expect(typeof result!.selector).toBe("string");
    expect(result!.selector.length).toBeGreaterThan(0);
    expect(result!.selector).toBe(".acey-d-movebtn");
    if (result!.pulses !== undefined) {
      expect(typeof result!.pulses).toBe("number");
      expect(result!.pulses).toBeGreaterThan(0);
    }

    // Force the early-return null branch via game-over markers used by hint().
    const finished: AceyState = { ...state, phase: "done", winner: "P" };
    expect(aceyDeuceyPlugin.hint!(finished)).toBeNull();
  });
});
