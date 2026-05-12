import { describe, it, expect } from "vitest";
import { arrowHitPlugin } from "./index.js";

const settings = { arrows: "5" as const };

describe("arrowHitPlugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(arrowHitPlugin.id).toBe("arrow-hit");
    expect(arrowHitPlugin.title).toBe("Arrow Hit");
    expect(arrowHitPlugin.category).toBe("arcade");
    expect(arrowHitPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof arrowHitPlugin.initialState).toBe("function");
    expect(typeof arrowHitPlugin.reducer).toBe("function");
    expect(typeof arrowHitPlugin.isTerminal).toBe("function");
    expect(typeof arrowHitPlugin.hint).toBe("function");
    expect(arrowHitPlugin.settings).toBeDefined();
    expect(arrowHitPlugin.component).toBeDefined();
  });

  it("initialState is deterministic for the same seed and isTerminal is null at start", () => {
    const a = arrowHitPlugin.initialState(42, settings);
    const b = arrowHitPlugin.initialState(42, settings);
    expect(a).toEqual(b);
    expect(a.phase).toBe("aiming");
    expect(a.arrows).toBe(0);
    expect(a.maxArrows).toBe(5);
    expect(a.score).toBe(0);
    expect(arrowHitPlugin.isTerminal!(a)).toBeNull();
  });

  it("hint returns a HintTarget while aiming and null after gameover", () => {
    const s = arrowHitPlugin.initialState(1, settings);
    const target = arrowHitPlugin.hint!(s);
    expect(target).not.toBeNull();
    expect(target).toMatchObject({ selector: expect.any(String) });
    expect((target as { selector: string }).selector.length).toBeGreaterThan(0);

    const ended = { ...s, phase: "gameover" as const };
    expect(arrowHitPlugin.hint!(ended)).toBeNull();
  });
});
