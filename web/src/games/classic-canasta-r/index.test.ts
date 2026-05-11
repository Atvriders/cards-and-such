import { describe, it, expect } from "vitest";
import { classicCanastaRPlugin } from "./index.js";
import type { GState } from "./state.js";

const S = {} as never;

describe("classic-canasta-r plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(classicCanastaRPlugin.id).toBe("classic-canasta-r");
    expect(classicCanastaRPlugin.title).toBe("Classic Canasta");
    expect(classicCanastaRPlugin.category).toBe("cards");
    expect(classicCanastaRPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof classicCanastaRPlugin.description).toBe("string");
    expect(classicCanastaRPlugin.description.length).toBeGreaterThan(0);
    expect(classicCanastaRPlugin.settings).toBeDefined();
    expect(typeof classicCanastaRPlugin.settings).toBe("object");
    expect(typeof classicCanastaRPlugin.initialState).toBe("function");
    expect(typeof classicCanastaRPlugin.reducer).toBe("function");
    expect(typeof classicCanastaRPlugin.isTerminal).toBe("function");
    expect(classicCanastaRPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = classicCanastaRPlugin.initialState(1234, S);
    const b = classicCanastaRPlugin.initialState(1234, S);
    expect(a.hand).toEqual(b.hand);
    expect(a.round).toBe(1);
    expect(a.phase).toBe("play");
    expect(a.score).toBe(0);
    expect(a.hand.length).toBe(11);
    // All dealt cards should be unique 0..51
    const unique = new Set(a.hand);
    expect(unique.size).toBe(11);
    for (const c of a.hand) {
      expect(c).toBeGreaterThanOrEqual(0);
      expect(c).toBeLessThan(52);
    }
    expect(classicCanastaRPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget with a non-empty selector for play/scored, null on done", () => {
    expect(typeof classicCanastaRPlugin.hint).toBe("function");
    const playState = classicCanastaRPlugin.initialState(7, S);
    const playHint = classicCanastaRPlugin.hint!(playState);
    expect(playHint).not.toBeNull();
    expect(typeof playHint!.selector).toBe("string");
    expect(playHint!.selector.length).toBeGreaterThan(0);
    expect(playHint!.selector).toContain("classic-canasta-r-play");
    expect(playHint!.pulses).toBe(3);

    const scoredState: GState = { ...playState, phase: "scored" };
    const scoredHint = classicCanastaRPlugin.hint!(scoredState);
    expect(scoredHint).not.toBeNull();
    expect(scoredHint!.selector).toContain("classic-canasta-r-next");
    expect(scoredHint!.pulses).toBe(3);

    const doneState: GState = { ...playState, phase: "done" };
    expect(classicCanastaRPlugin.hint!(doneState)).toBeNull();
    expect(classicCanastaRPlugin.isTerminal(doneState)).toEqual({ score: doneState.score });
  });
});
