import { describe, it, expect } from "vitest";
import { cookieClutchPlugin } from "./index.js";
import type { CookieClutchState } from "./state.js";

const S = { dummy: false } as never;

describe("cookie-clutch plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(cookieClutchPlugin.id).toBe("cookie-clutch");
    expect(cookieClutchPlugin.title).toBe("Cookie Clutch");
    expect(cookieClutchPlugin.category).toBe("arcade");
    expect(cookieClutchPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof cookieClutchPlugin.description).toBe("string");
    expect(cookieClutchPlugin.description.length).toBeGreaterThan(0);
    expect(cookieClutchPlugin.settings).toBeDefined();
    expect(typeof cookieClutchPlugin.settings).toBe("object");
    expect(typeof cookieClutchPlugin.initialState).toBe("function");
    expect(typeof cookieClutchPlugin.reducer).toBe("function");
    expect(typeof cookieClutchPlugin.isTerminal).toBe("function");
    expect(cookieClutchPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on a fresh game", () => {
    const a = cookieClutchPlugin.initialState(42, S);
    const b = cookieClutchPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.rngSeed).toBe(42);
    expect(a.items).toEqual([]);
    expect(a.score).toBe(0);
    expect(a.popped).toBe(0);
    expect(a.missed).toBe(0);
    expect(a.phase).toBe("playing");
    expect(cookieClutchPlugin.isTerminal(a)).toBeNull();

    // A state marked as done returns the final score from isTerminal.
    const done: CookieClutchState = { ...a, phase: "done", score: 120 };
    expect(cookieClutchPlugin.isTerminal(done)).toEqual({ score: 120 });
  });

  it("hint returns null when there are no items or the game is done, otherwise a HintTarget", () => {
    expect(typeof cookieClutchPlugin.hint).toBe("function");
    const empty = cookieClutchPlugin.initialState(7, S);
    // No items spawned yet -> hint is null.
    expect(cookieClutchPlugin.hint!(empty)).toBeNull();

    // Done phase -> hint is null even if items exist.
    const doneWithItems: CookieClutchState = {
      ...empty,
      phase: "done",
      items: [{ id: 1, lane: 0, ticksLeft: 2 }],
    };
    expect(cookieClutchPlugin.hint!(doneWithItems)).toBeNull();

    // Active items -> hint returns a HintTarget with a non-empty selector.
    const withItems: CookieClutchState = {
      ...empty,
      items: [{ id: 1, lane: 0, ticksLeft: 2 }],
    };
    const result = cookieClutchPlugin.hint!(withItems);
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toContain("cookie-clutch");
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }
  });
});
