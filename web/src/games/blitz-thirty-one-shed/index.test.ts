import { describe, it, expect } from "vitest";
import { blitzThirtyOneShedPlugin } from "./index.js";

describe("blitzThirtyOneShedPlugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(blitzThirtyOneShedPlugin.id).toBe("blitz-thirty-one-shed");
    expect(blitzThirtyOneShedPlugin.title).toBe("Blitz / Thirty-One");
    expect(blitzThirtyOneShedPlugin.category).toBe("cards");
    expect(blitzThirtyOneShedPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof blitzThirtyOneShedPlugin.initialState).toBe("function");
    expect(typeof blitzThirtyOneShedPlugin.reducer).toBe("function");
    expect(typeof blitzThirtyOneShedPlugin.isTerminal).toBe("function");
    expect(typeof blitzThirtyOneShedPlugin.hint).toBe("function");
    expect(blitzThirtyOneShedPlugin.component).toBeDefined();
  });

  it("produces a deterministic initial state that is not terminal", () => {
    const s = { dummy: false };
    const a = blitzThirtyOneShedPlugin.initialState(42, s);
    const b = blitzThirtyOneShedPlugin.initialState(42, s);
    expect(a).toEqual(b);
    expect(a.round).toBe(1);
    expect(a.phase).toBe("ready");
    expect(a.score).toBe(0);
    expect(a.rngSeed).toBe(42);
    expect(blitzThirtyOneShedPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget for ready/scored phases and null for done", () => {
    const s = { dummy: false };
    const ready = blitzThirtyOneShedPlugin.initialState(1, s);
    const hintReady = blitzThirtyOneShedPlugin.hint!(ready);
    expect(hintReady).not.toBeNull();
    expect(hintReady!.selector).toContain("hint-target-blitz-thirty-one-shed-play");
    expect(hintReady!.pulses).toBe(3);

    const scored = { ...ready, phase: "scored" as const };
    const hintScored = blitzThirtyOneShedPlugin.hint!(scored);
    expect(hintScored).not.toBeNull();
    expect(hintScored!.selector).toContain("hint-target-blitz-thirty-one-shed-next");

    const done = { ...ready, phase: "done" as const };
    expect(blitzThirtyOneShedPlugin.hint!(done)).toBeNull();
    expect(blitzThirtyOneShedPlugin.isTerminal(done)).toEqual({ score: done.score });
  });
});
