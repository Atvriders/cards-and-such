import { describe, it, expect } from "vitest";
import { blackPeterPlugin } from "./index.js";

const S = { dummy: false } as never;

describe("black-peter plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(blackPeterPlugin.id).toBe("black-peter");
    expect(blackPeterPlugin.title).toBe("Black Peter");
    expect(blackPeterPlugin.category).toBe("cards");
    expect(blackPeterPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof blackPeterPlugin.description).toBe("string");
    expect(blackPeterPlugin.description.length).toBeGreaterThan(0);
    expect(blackPeterPlugin.settings).toBeDefined();
    expect(typeof blackPeterPlugin.settings).toBe("object");
    expect(typeof blackPeterPlugin.initialState).toBe("function");
    expect(typeof blackPeterPlugin.reducer).toBe("function");
    expect(typeof blackPeterPlugin.isTerminal).toBe("function");
    expect(blackPeterPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh state", () => {
    const a = blackPeterPlugin.initialState(123, S);
    const b = blackPeterPlugin.initialState(123, S);
    expect(a).toEqual(b);
    expect(a.round).toBe(1);
    expect(a.phase).toBe("ready");
    expect(a.score).toBe(0);
    expect(a.wins).toBe(0);
    expect(a.losses).toBe(0);
    expect(a.you).toBe(7);
    expect(a.cpu).toBe(7);
    expect(blackPeterPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget on ready phase and null otherwise", () => {
    expect(typeof blackPeterPlugin.hint).toBe("function");
    const ready = blackPeterPlugin.initialState(7, S);
    const readyHint = blackPeterPlugin.hint!(ready);
    expect(readyHint).not.toBeNull();
    expect(readyHint!.selector).toBe('[data-testid="hint-target-black-peter-primary"]');
    expect(readyHint!.pulses).toBe(3);

    const done = { ...ready, phase: "done" as const };
    expect(blackPeterPlugin.hint!(done)).toBeNull();
    expect(blackPeterPlugin.isTerminal(done)).toEqual({ score: done.score });

    const scored = { ...ready, phase: "scored" as const };
    expect(blackPeterPlugin.hint!(scored)).toBeNull();
  });
});
