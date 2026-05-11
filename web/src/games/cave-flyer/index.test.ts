import { describe, it, expect } from "vitest";
import { caveFlyerPlugin, caveFlyerSettings } from "./index.js";
import type { CaveFlyerState } from "./state.js";

const S = { speed: "medium" as const };

describe("cave-flyer plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(caveFlyerPlugin.id).toBe("cave-flyer");
    expect(caveFlyerPlugin.title).toBe("Cave Flyer");
    expect(caveFlyerPlugin.category).toBe("arcade");
    expect(caveFlyerPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof caveFlyerPlugin.description).toBe("string");
    expect(caveFlyerPlugin.description.length).toBeGreaterThan(0);
    expect(caveFlyerPlugin.settings).toBe(caveFlyerSettings);
    expect(typeof caveFlyerPlugin.initialState).toBe("function");
    expect(typeof caveFlyerPlugin.reducer).toBe("function");
    expect(typeof caveFlyerPlugin.isTerminal).toBe("function");
    expect(caveFlyerPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh start", () => {
    const a = caveFlyerPlugin.initialState(42, S);
    const b = caveFlyerPlugin.initialState(42, S);
    const aSegs = a.segments.map((s) => `${s.x.toFixed(4)}:${s.topY.toFixed(4)}:${s.botY.toFixed(4)}`).join("|");
    const bSegs = b.segments.map((s) => `${s.x.toFixed(4)}:${s.topY.toFixed(4)}:${s.botY.toFixed(4)}`).join("|");
    expect(aSegs).toBe(bSegs);
    expect(a.playerY).toBe(b.playerY);
    expect(a.playerVy).toBe(b.playerVy);
    expect(a.score).toBe(0);
    expect(a.over).toBe(false);
    expect(caveFlyerPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget on fresh state and null once the game is over", () => {
    expect(typeof caveFlyerPlugin.hint).toBe("function");
    const state = caveFlyerPlugin.initialState(7, S);
    const result = caveFlyerPlugin.hint!(state);
    expect(result).not.toBeNull();
    expect(typeof result!.selector).toBe("string");
    expect(result!.selector.length).toBeGreaterThan(0);
    expect(result!.selector).toBe(".cf-player");
    expect(result!.pulses).toBe(3);

    // Force the fallthroughs the hint function checks for.
    const phaseState = { ...state, phase: "gameover" } as unknown as CaveFlyerState;
    expect(caveFlyerPlugin.hint!(phaseState)).toBeNull();

    const doneState = { ...state, done: true } as unknown as CaveFlyerState;
    expect(caveFlyerPlugin.hint!(doneState)).toBeNull();

    const gameOverState = { ...state, gameOver: true } as unknown as CaveFlyerState;
    expect(caveFlyerPlugin.hint!(gameOverState)).toBeNull();
  });
});
