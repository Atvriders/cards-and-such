import { describe, it, expect } from "vitest";
import { chineseTenPlugin } from "./index.js";

const S = { dummy: false } as never;

describe("chinese-ten plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(chineseTenPlugin.id).toBe("chinese-ten");
    expect(chineseTenPlugin.title).toBe("Chinese Ten");
    expect(chineseTenPlugin.category).toBe("cards");
    expect(chineseTenPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof chineseTenPlugin.description).toBe("string");
    expect(chineseTenPlugin.description.length).toBeGreaterThan(0);
    expect(chineseTenPlugin.settings).toBeDefined();
    expect(typeof chineseTenPlugin.settings).toBe("object");
    expect(typeof chineseTenPlugin.initialState).toBe("function");
    expect(typeof chineseTenPlugin.reducer).toBe("function");
    expect(typeof chineseTenPlugin.isTerminal).toBe("function");
    expect(chineseTenPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = chineseTenPlugin.initialState(42, S);
    const b = chineseTenPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.phase).toBe("ready");
    expect(a.round).toBe(1);
    expect(a.score).toBe(0);
    expect(a.rngSeed).toBe(42);
    expect(chineseTenPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget on ready/scored and null otherwise", () => {
    expect(typeof chineseTenPlugin.hint).toBe("function");
    const ready = chineseTenPlugin.initialState(5, S);
    const readyHint = chineseTenPlugin.hint!(ready);
    expect(readyHint).not.toBeNull();
    expect(typeof readyHint!.selector).toBe("string");
    expect(readyHint!.selector).toBe('[data-testid="hint-target-chinese-ten-primary"]');
    expect(readyHint!.pulses).toBe(3);

    const scored = { ...ready, phase: "scored" as const };
    const scoredHint = chineseTenPlugin.hint!(scored);
    expect(scoredHint).not.toBeNull();
    expect(scoredHint!.selector).toBe('[data-testid="hint-target-chinese-ten-next"]');
    expect(scoredHint!.pulses).toBe(3);

    const done = { ...ready, phase: "done" as const };
    expect(chineseTenPlugin.hint!(done)).toBeNull();

    // isTerminal returns score object only when phase === "done"
    expect(chineseTenPlugin.isTerminal(done)).toEqual({ score: done.score });
  });
});
