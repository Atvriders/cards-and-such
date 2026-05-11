import { describe, it, expect } from "vitest";
import { buracoRPlugin } from "./index.js";

const S = { dummy: false } as never;

describe("buraco-r plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(buracoRPlugin.id).toBe("buraco-r");
    expect(buracoRPlugin.title).toBe("Buraco");
    expect(buracoRPlugin.category).toBe("cards");
    expect(buracoRPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof buracoRPlugin.description).toBe("string");
    expect(buracoRPlugin.description.length).toBeGreaterThan(0);
    expect(buracoRPlugin.settings).toBeDefined();
    expect(typeof buracoRPlugin.settings).toBe("object");
    expect(typeof buracoRPlugin.initialState).toBe("function");
    expect(typeof buracoRPlugin.reducer).toBe("function");
    expect(typeof buracoRPlugin.isTerminal).toBe("function");
    expect(buracoRPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = buracoRPlugin.initialState(42, S);
    const b = buracoRPlugin.initialState(42, S);
    expect(a.hand).toEqual(b.hand);
    expect(a.round).toBe(1);
    expect(a.phase).toBe("play");
    expect(a.hand.length).toBe(11);
    expect(a.score).toBe(0);
    expect(a.melds).toEqual([]);
    expect(buracoRPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget for active phases and null when done", () => {
    expect(typeof buracoRPlugin.hint).toBe("function");
    const fresh = buracoRPlugin.initialState(7, S);
    const playHint = buracoRPlugin.hint!(fresh);
    expect(playHint).not.toBeNull();
    expect(playHint!.selector).toBe('[data-testid="hint-target-buraco-r-play"]');
    expect(playHint!.pulses).toBe(3);

    const scored = { ...fresh, phase: "scored" as const };
    const scoredHint = buracoRPlugin.hint!(scored);
    expect(scoredHint).not.toBeNull();
    expect(scoredHint!.selector).toBe('[data-testid="hint-target-buraco-r-next"]');
    expect(scoredHint!.pulses).toBe(3);

    const done = { ...fresh, phase: "done" as const };
    expect(buracoRPlugin.hint!(done)).toBeNull();
    expect(buracoRPlugin.isTerminal(done)).toEqual({ score: done.score });
  });
});
