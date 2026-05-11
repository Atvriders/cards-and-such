import { describe, it, expect } from "vitest";
import { badaceyCasPlugin } from "./index.js";
import type { CasState } from "./state.js";

const S = { dummy: false } as never;

describe("badacey-cas plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(badaceyCasPlugin.id).toBe("badacey-cas");
    expect(badaceyCasPlugin.title).toBe("Badacey");
    expect(badaceyCasPlugin.category).toBe("cards");
    expect(badaceyCasPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof badaceyCasPlugin.description).toBe("string");
    expect(badaceyCasPlugin.description.length).toBeGreaterThan(0);
    expect(badaceyCasPlugin.settings).toBeDefined();
    expect(typeof badaceyCasPlugin.settings).toBe("object");
    expect(typeof badaceyCasPlugin.initialState).toBe("function");
    expect(typeof badaceyCasPlugin.reducer).toBe("function");
    expect(typeof badaceyCasPlugin.isTerminal).toBe("function");
    expect(badaceyCasPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh state", () => {
    const a = badaceyCasPlugin.initialState(42, S);
    const b = badaceyCasPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.round).toBe(1);
    expect(a.phase).toBe("ready");
    expect(a.score).toBe(0);
    expect(a.cardA).toBeNull();
    expect(a.cardB).toBeNull();
    expect(a.cardC).toBeNull();
    expect(badaceyCasPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget for ready/scored phases and null otherwise", () => {
    expect(typeof badaceyCasPlugin.hint).toBe("function");
    const ready = badaceyCasPlugin.initialState(5, S);
    const readyHint = badaceyCasPlugin.hint!(ready);
    expect(readyHint).not.toBeNull();
    expect(readyHint!.selector).toBe('[data-testid="hint-target-badacey-cas-primary"]');
    expect(readyHint!.pulses).toBe(3);

    const scored: CasState = { ...ready, phase: "scored" };
    const scoredHint = badaceyCasPlugin.hint!(scored);
    expect(scoredHint).not.toBeNull();
    expect(scoredHint!.selector).toBe('[data-testid="hint-target-badacey-cas-secondary"]');
    expect(scoredHint!.pulses).toBe(3);

    const done: CasState = { ...ready, phase: "done" };
    expect(badaceyCasPlugin.hint!(done)).toBeNull();
    expect(badaceyCasPlugin.isTerminal(done)).toEqual({ score: done.score });
  });
});
