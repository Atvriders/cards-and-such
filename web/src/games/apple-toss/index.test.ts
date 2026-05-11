import { describe, it, expect } from "vitest";
import { appleTossPlugin } from "./index.js";
import type { AppleTossState } from "./state.js";

const S = { duration: "30" } as const;

describe("apple-toss plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(appleTossPlugin.id).toBe("apple-toss");
    expect(appleTossPlugin.title).toBe("Apple Toss");
    expect(appleTossPlugin.category).toBe("arcade");
    expect(appleTossPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof appleTossPlugin.description).toBe("string");
    expect(appleTossPlugin.description.length).toBeGreaterThan(0);
    expect(appleTossPlugin.settings).toBeDefined();
    expect(typeof appleTossPlugin.settings).toBe("object");
    expect(typeof appleTossPlugin.initialState).toBe("function");
    expect(typeof appleTossPlugin.reducer).toBe("function");
    expect(typeof appleTossPlugin.isTerminal).toBe("function");
    expect(appleTossPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh start", () => {
    const a = appleTossPlugin.initialState(42, S);
    const b = appleTossPlugin.initialState(42, S);
    expect(a.items.map((i) => `${i.id}:${i.x}:${i.y}:${i.speed}:${i.points}`).join("|"))
      .toBe(b.items.map((i) => `${i.id}:${i.x}:${i.y}:${i.speed}:${i.points}`).join("|"));
    expect(a.score).toBe(0);
    expect(a.caught).toBe(0);
    expect(a.missed).toBe(0);
    expect(a.lives).toBe(3);
    expect(a.timeLeft).toBe(30);
    expect(a.phase).toBe("playing");
    expect(a.rngSeed).toBe(b.rngSeed);
    expect(appleTossPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null on gameover", () => {
    expect(typeof appleTossPlugin.hint).toBe("function");
    const state = appleTossPlugin.initialState(7, S);
    const result = appleTossPlugin.hint!(state);
    expect(result).not.toBeNull();
    expect(typeof result!.selector).toBe("string");
    expect(result!.selector.length).toBeGreaterThan(0);
    expect(result!.selector).toBe('[data-testid="hint-target-apple-toss-action"]');
    expect(result!.pulses).toBe(3);

    const ended: AppleTossState = { ...state, phase: "gameover" };
    expect(appleTossPlugin.hint!(ended)).toBeNull();
    expect(appleTossPlugin.isTerminal(ended)).toEqual({ score: ended.score });
  });
});
