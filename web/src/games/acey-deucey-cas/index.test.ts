import { describe, it, expect } from "vitest";
import { aceyDeuceyCasPlugin } from "./index.js";
import type { AceyDeuceyCasState } from "./state.js";

const S = { dummy: false } as never;

describe("acey-deucey-cas plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(aceyDeuceyCasPlugin.id).toBe("acey-deucey-cas");
    expect(aceyDeuceyCasPlugin.title).toBe("Acey-Deucey Casino");
    expect(aceyDeuceyCasPlugin.category).toBe("cards");
    expect(aceyDeuceyCasPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof aceyDeuceyCasPlugin.description).toBe("string");
    expect(aceyDeuceyCasPlugin.description.length).toBeGreaterThan(0);
    expect(typeof aceyDeuceyCasPlugin.howToPlay).toBe("string");
    expect(aceyDeuceyCasPlugin.settings).toBeDefined();
    expect(typeof aceyDeuceyCasPlugin.settings).toBe("object");
    expect(typeof aceyDeuceyCasPlugin.initialState).toBe("function");
    expect(typeof aceyDeuceyCasPlugin.reducer).toBe("function");
    expect(typeof aceyDeuceyCasPlugin.isTerminal).toBe("function");
    expect(typeof aceyDeuceyCasPlugin.hint).toBe("function");
    expect(aceyDeuceyCasPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh state", () => {
    const a = aceyDeuceyCasPlugin.initialState(1234, S);
    const b = aceyDeuceyCasPlugin.initialState(1234, S);
    expect(a).toEqual(b);
    expect(a.round).toBe(1);
    expect(a.phase).toBe("ready");
    expect(a.score).toBe(0);
    expect(a.left).toBeNull();
    expect(a.right).toBeNull();
    expect(a.middle).toBeNull();
    expect(aceyDeuceyCasPlugin.isTerminal(a)).toBeNull();

    const done: AceyDeuceyCasState = { ...a, phase: "done", score: 42 };
    expect(aceyDeuceyCasPlugin.isTerminal(done)).toEqual({ score: 42 });
  });

  it("hint returns a HintTarget for ready/scored phases and null when terminal or unknown", () => {
    const ready = aceyDeuceyCasPlugin.initialState(7, S);
    const readyHint = aceyDeuceyCasPlugin.hint!(ready);
    expect(readyHint).not.toBeNull();
    expect(typeof readyHint!.selector).toBe("string");
    expect(readyHint!.selector.length).toBeGreaterThan(0);
    expect(readyHint!.selector).toContain("acey-deucey-cas");
    expect(readyHint!.pulses).toBe(3);

    const scored: AceyDeuceyCasState = { ...ready, phase: "scored" };
    const scoredHint = aceyDeuceyCasPlugin.hint!(scored);
    expect(scoredHint).not.toBeNull();
    expect(scoredHint!.selector).toContain("acey-deucey-cas");
    expect(scoredHint!.selector).not.toBe(readyHint!.selector);

    const done: AceyDeuceyCasState = { ...ready, phase: "done" };
    expect(aceyDeuceyCasPlugin.hint!(done)).toBeNull();
  });
});
