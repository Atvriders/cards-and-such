import { describe, it, expect } from "vitest";
import { brazilianCanastaRPlugin } from "./index.js";
import type { BrazilianCanastaRState } from "./state.js";

const S = { dummy: false } as never;

describe("brazilian-canasta-r plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(brazilianCanastaRPlugin.id).toBe("brazilian-canasta-r");
    expect(brazilianCanastaRPlugin.title).toBe("Brazilian Canasta");
    expect(brazilianCanastaRPlugin.category).toBe("cards");
    expect(brazilianCanastaRPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof brazilianCanastaRPlugin.description).toBe("string");
    expect(brazilianCanastaRPlugin.description.length).toBeGreaterThan(0);
    expect(brazilianCanastaRPlugin.settings).toBeDefined();
    expect(typeof brazilianCanastaRPlugin.settings).toBe("object");
    expect(typeof brazilianCanastaRPlugin.initialState).toBe("function");
    expect(typeof brazilianCanastaRPlugin.reducer).toBe("function");
    expect(typeof brazilianCanastaRPlugin.isTerminal).toBe("function");
    expect(brazilianCanastaRPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on a fresh deal", () => {
    const a = brazilianCanastaRPlugin.initialState(123, S);
    const b = brazilianCanastaRPlugin.initialState(123, S);
    expect(a.round).toBe(1);
    expect(a.phase).toBe("play");
    expect(a.score).toBe(0);
    expect(a.hand.length).toBe(11);
    expect(a.hand.join(",")).toBe(b.hand.join(","));
    expect(a.rngSeed).toBe(b.rngSeed);
    expect(brazilianCanastaRPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget in play/scored phases and null when done", () => {
    expect(typeof brazilianCanastaRPlugin.hint).toBe("function");
    const playState = brazilianCanastaRPlugin.initialState(7, S);
    const playHint = brazilianCanastaRPlugin.hint!(playState);
    expect(playHint).not.toBeNull();
    expect(typeof playHint!.selector).toBe("string");
    expect(playHint!.selector).toBe('[data-testid="hint-target-brazilian-canasta-r-play"]');
    expect(playHint!.pulses).toBe(3);

    const scoredState: BrazilianCanastaRState = { ...playState, phase: "scored" };
    const scoredHint = brazilianCanastaRPlugin.hint!(scoredState);
    expect(scoredHint).not.toBeNull();
    expect(scoredHint!.selector).toBe('[data-testid="hint-target-brazilian-canasta-r-next"]');
    expect(scoredHint!.pulses).toBe(3);

    const doneState: BrazilianCanastaRState = { ...playState, phase: "done" };
    expect(brazilianCanastaRPlugin.hint!(doneState)).toBeNull();
    expect(brazilianCanastaRPlugin.isTerminal(doneState)).toEqual({ score: doneState.score });
  });
});
