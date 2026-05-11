import { describe, it, expect } from "vitest";
import { boliviaCanastaRPlugin } from "./index.js";

const S = { dummy: false } as never;

describe("bolivia-canasta-r plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(boliviaCanastaRPlugin.id).toBe("bolivia-canasta-r");
    expect(boliviaCanastaRPlugin.title).toBe("Bolivia Canasta");
    expect(boliviaCanastaRPlugin.category).toBe("cards");
    expect(boliviaCanastaRPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof boliviaCanastaRPlugin.description).toBe("string");
    expect(boliviaCanastaRPlugin.description.length).toBeGreaterThan(0);
    expect(boliviaCanastaRPlugin.settings).toBeDefined();
    expect(typeof boliviaCanastaRPlugin.settings).toBe("object");
    expect(typeof boliviaCanastaRPlugin.initialState).toBe("function");
    expect(typeof boliviaCanastaRPlugin.reducer).toBe("function");
    expect(typeof boliviaCanastaRPlugin.isTerminal).toBe("function");
    expect(boliviaCanastaRPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = boliviaCanastaRPlugin.initialState(42, S);
    const b = boliviaCanastaRPlugin.initialState(42, S);
    expect(a.hand).toEqual(b.hand);
    expect(a.round).toBe(1);
    expect(a.phase).toBe("play");
    expect(a.hand.length).toBe(11);
    expect(a.score).toBe(0);
    expect(a.melds).toEqual([]);
    expect(boliviaCanastaRPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget for active phases and null when done", () => {
    expect(typeof boliviaCanastaRPlugin.hint).toBe("function");
    const fresh = boliviaCanastaRPlugin.initialState(7, S);
    const playHint = boliviaCanastaRPlugin.hint!(fresh);
    expect(playHint).not.toBeNull();
    expect(playHint!.selector).toBe('[data-testid="hint-target-bolivia-canasta-r-play"]');
    expect(playHint!.pulses).toBe(3);

    const scored = { ...fresh, phase: "scored" as const };
    const scoredHint = boliviaCanastaRPlugin.hint!(scored);
    expect(scoredHint).not.toBeNull();
    expect(scoredHint!.selector).toBe('[data-testid="hint-target-bolivia-canasta-r-next"]');
    expect(scoredHint!.pulses).toBe(3);

    const done = { ...fresh, phase: "done" as const };
    expect(boliviaCanastaRPlugin.hint!(done)).toBeNull();
    expect(boliviaCanastaRPlugin.isTerminal(done)).toEqual({ score: done.score });
  });
});
