import { describe, it, expect } from "vitest";
import { acesUpMiniPlugin } from "./index.js";
import type { AcesUpMiniState } from "./state.js";

const S = { dummy: false } as never;

describe("aces-up-mini plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(acesUpMiniPlugin.id).toBe("aces-up-mini");
    expect(acesUpMiniPlugin.title).toBe("Aces Up Mini");
    expect(acesUpMiniPlugin.category).toBe("cards");
    expect(acesUpMiniPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof acesUpMiniPlugin.description).toBe("string");
    expect(acesUpMiniPlugin.description.length).toBeGreaterThan(0);
    expect(typeof acesUpMiniPlugin.howToPlay).toBe("string");
    expect(acesUpMiniPlugin.settings).toBeDefined();
    expect(typeof acesUpMiniPlugin.settings).toBe("object");
    expect(typeof acesUpMiniPlugin.initialState).toBe("function");
    expect(typeof acesUpMiniPlugin.reducer).toBe("function");
    expect(typeof acesUpMiniPlugin.isTerminal).toBe("function");
    expect(typeof acesUpMiniPlugin.hint).toBe("function");
    expect(acesUpMiniPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh state", () => {
    const a = acesUpMiniPlugin.initialState(1234, S);
    const b = acesUpMiniPlugin.initialState(1234, S);
    expect(a).toEqual(b);
    expect(a.rngSeed).toBe(1234);
    expect(a.draw).toBe(1);
    expect(a.card).toBeNull();
    expect(a.acesFound).toBe(0);
    expect(a.score).toBe(0);
    expect(a.phase).toBe("drawing");
    expect(a.lastWasAce).toBe(false);
    expect(acesUpMiniPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while drawing and null otherwise", () => {
    const drawing = acesUpMiniPlugin.initialState(7, S);
    const result = acesUpMiniPlugin.hint!(drawing);
    expect(result).not.toBeNull();
    expect(result!.selector).toBe('[data-testid="hint-target-aces-up-mini-primary"]');
    expect(result!.pulses).toBe(3);

    const shown: AcesUpMiniState = { ...drawing, phase: "shown" };
    expect(acesUpMiniPlugin.hint!(shown)).toBeNull();

    const done: AcesUpMiniState = { ...drawing, phase: "done" };
    expect(acesUpMiniPlugin.hint!(done)).toBeNull();
  });
});
