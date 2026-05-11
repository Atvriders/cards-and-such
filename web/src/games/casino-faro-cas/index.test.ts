import { describe, it, expect } from "vitest";
import { casinoFaroCasPlugin } from "./index.js";
import type { CasState } from "./state.js";

const S = { dummy: false } as never;

describe("casino-faro-cas plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(casinoFaroCasPlugin.id).toBe("casino-faro-cas");
    expect(casinoFaroCasPlugin.title).toBe("Casino Faro");
    expect(casinoFaroCasPlugin.category).toBe("cards");
    expect(casinoFaroCasPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof casinoFaroCasPlugin.description).toBe("string");
    expect(casinoFaroCasPlugin.description.length).toBeGreaterThan(0);
    expect(casinoFaroCasPlugin.settings).toBeDefined();
    expect(typeof casinoFaroCasPlugin.settings).toBe("object");
    expect(typeof casinoFaroCasPlugin.initialState).toBe("function");
    expect(typeof casinoFaroCasPlugin.reducer).toBe("function");
    expect(typeof casinoFaroCasPlugin.isTerminal).toBe("function");
    expect(casinoFaroCasPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = casinoFaroCasPlugin.initialState(42, S);
    const b = casinoFaroCasPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.rngSeed).toBe(42);
    expect(a.round).toBe(1);
    expect(a.score).toBe(0);
    expect(a.phase).toBe("ready");
    expect(a.cardA).toBeNull();
    expect(a.cardB).toBeNull();
    expect(a.cardC).toBeNull();
    expect(casinoFaroCasPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget on ready/scored phases and null otherwise", () => {
    expect(typeof casinoFaroCasPlugin.hint).toBe("function");

    const ready = casinoFaroCasPlugin.initialState(7, S);
    const readyHint = casinoFaroCasPlugin.hint!(ready);
    expect(readyHint).not.toBeNull();
    expect(readyHint!.selector).toBe('[data-testid="hint-target-casino-faro-cas-primary"]');
    expect(readyHint!.pulses).toBe(3);

    const scored: CasState = { ...ready, phase: "scored" };
    const scoredHint = casinoFaroCasPlugin.hint!(scored);
    expect(scoredHint).not.toBeNull();
    expect(scoredHint!.selector).toBe('[data-testid="hint-target-casino-faro-cas-secondary"]');
    expect(scoredHint!.pulses).toBe(3);

    const done: CasState = { ...ready, phase: "done" };
    expect(casinoFaroCasPlugin.hint!(done)).toBeNull();
    expect(casinoFaroCasPlugin.isTerminal(done)).toEqual({ score: 0 });
  });
});
