import { describe, it, expect } from "vitest";
import { canastaMexicanaRPlugin } from "./index.js";
import type { GState } from "./state.js";

const S = { dummy: false } as never;

describe("canasta-mexicana-r plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(canastaMexicanaRPlugin.id).toBe("canasta-mexicana-r");
    expect(canastaMexicanaRPlugin.title).toBe("Canasta Mexicana");
    expect(canastaMexicanaRPlugin.category).toBe("cards");
    expect(canastaMexicanaRPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof canastaMexicanaRPlugin.description).toBe("string");
    expect(canastaMexicanaRPlugin.description.length).toBeGreaterThan(0);
    expect(canastaMexicanaRPlugin.settings).toBeDefined();
    expect(typeof canastaMexicanaRPlugin.settings).toBe("object");
    expect(typeof canastaMexicanaRPlugin.initialState).toBe("function");
    expect(typeof canastaMexicanaRPlugin.reducer).toBe("function");
    expect(typeof canastaMexicanaRPlugin.isTerminal).toBe("function");
    expect(canastaMexicanaRPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = canastaMexicanaRPlugin.initialState(42, S);
    const b = canastaMexicanaRPlugin.initialState(42, S);
    expect(a.hand).toEqual(b.hand);
    expect(a.round).toBe(1);
    expect(a.phase).toBe("play");
    expect(a.score).toBe(0);
    expect(a.melds).toEqual([]);
    expect(a.hand.length).toBe(11);
    expect(canastaMexicanaRPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget when in play/scored and null when done", () => {
    expect(typeof canastaMexicanaRPlugin.hint).toBe("function");
    const playState = canastaMexicanaRPlugin.initialState(7, S);
    const playHint = canastaMexicanaRPlugin.hint!(playState);
    expect(playHint).not.toBeNull();
    expect(playHint!.selector).toBe('[data-testid="hint-target-canasta-mexicana-r-play"]');
    expect(playHint!.pulses).toBe(3);

    const scoredState: GState = { ...playState, phase: "scored" };
    const scoredHint = canastaMexicanaRPlugin.hint!(scoredState);
    expect(scoredHint).not.toBeNull();
    expect(scoredHint!.selector).toBe('[data-testid="hint-target-canasta-mexicana-r-next"]');
    expect(scoredHint!.pulses).toBe(3);

    const doneState: GState = { ...playState, phase: "done" };
    expect(canastaMexicanaRPlugin.hint!(doneState)).toBeNull();
    expect(canastaMexicanaRPlugin.isTerminal(doneState)).toEqual({ score: doneState.score });
  });
});
