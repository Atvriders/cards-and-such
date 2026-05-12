import { describe, it, expect } from "vitest";
import { archeryTargetPlugin } from "./index.js";
import { initialState } from "./state.js";

describe("archery-target plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(archeryTargetPlugin.id).toBe("archery-target");
    expect(archeryTargetPlugin.title).toBe("Archery Target");
    expect(archeryTargetPlugin.category).toBe("arcade");
    expect(archeryTargetPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof archeryTargetPlugin.description).toBe("string");
    expect(archeryTargetPlugin.description.length).toBeGreaterThan(0);
    expect(archeryTargetPlugin.settings).toBeDefined();
    expect(typeof archeryTargetPlugin.settings).toBe("object");
    expect(typeof archeryTargetPlugin.initialState).toBe("function");
    expect(typeof archeryTargetPlugin.reducer).toBe("function");
    expect(typeof archeryTargetPlugin.isTerminal).toBe("function");
    expect(archeryTargetPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh start", () => {
    const settings = { arrows: "10" as const };
    const a = archeryTargetPlugin.initialState(42, settings);
    const b = archeryTargetPlugin.initialState(42, settings);
    expect(a).toEqual(b);
    expect(a.arrowsShot).toBe(0);
    expect(a.score).toBe(0);
    expect(a.totalArrows).toBe(10);
    expect(a.over).toBe(false);
    expect(archeryTargetPlugin.isTerminal!(a)).toBeNull();
  });

  it("hint returns a HintTarget on active game and null when game is over", () => {
    expect(typeof archeryTargetPlugin.hint).toBe("function");
    const settings = { arrows: "5" as const };
    const state = archeryTargetPlugin.initialState(5, settings);
    const result = archeryTargetPlugin.hint!(state);
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toBe(".archery-canvas");
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }

    // The hint function inspects `phase`, `gameOver`, and `done` flags via untyped access,
    // so force the null branch using those signals.
    const gameOverState = { ...(initialState(5, settings) as object), gameOver: true } as never;
    expect(archeryTargetPlugin.hint!(gameOverState)).toBeNull();

    const doneState = { ...(initialState(5, settings) as object), done: true } as never;
    expect(archeryTargetPlugin.hint!(doneState)).toBeNull();

    const phaseState = { ...(initialState(5, settings) as object), phase: "gameover" } as never;
    expect(archeryTargetPlugin.hint!(phaseState)).toBeNull();
  });
});
