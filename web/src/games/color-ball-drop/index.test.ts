import { describe, it, expect } from "vitest";
import { colorBallDropPlugin } from "./index.js";
import type { ColorBallDropState } from "./state.js";

const S = { dummy: false } as never;

describe("color-ball-drop plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(colorBallDropPlugin.id).toBe("color-ball-drop");
    expect(colorBallDropPlugin.title).toBe("Color Ball Drop");
    expect(colorBallDropPlugin.category).toBe("arcade");
    expect(colorBallDropPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof colorBallDropPlugin.description).toBe("string");
    expect(colorBallDropPlugin.description.length).toBeGreaterThan(0);
    expect(colorBallDropPlugin.settings).toBeDefined();
    expect(typeof colorBallDropPlugin.settings).toBe("object");
    expect(typeof colorBallDropPlugin.initialState).toBe("function");
    expect(typeof colorBallDropPlugin.reducer).toBe("function");
    expect(typeof colorBallDropPlugin.isTerminal).toBe("function");
    expect(colorBallDropPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null while playing", () => {
    const a = colorBallDropPlugin.initialState(42, S);
    const b = colorBallDropPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.phase).toBe("playing");
    expect(a.playerLane).toBe(1);
    expect(a.obstacles).toEqual([]);
    expect(a.score).toBe(0);
    expect(colorBallDropPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null once the game is done", () => {
    expect(typeof colorBallDropPlugin.hint).toBe("function");
    const state = colorBallDropPlugin.initialState(7, S);
    const result = colorBallDropPlugin.hint!(state);
    expect(result).not.toBeNull();
    expect(typeof result!.selector).toBe("string");
    expect(result!.selector.length).toBeGreaterThan(0);
    expect(result!.selector).toBe('[data-testid="hint-target-color-ball-drop-primary"]');
    if (result!.pulses !== undefined) {
      expect(typeof result!.pulses).toBe("number");
      expect(result!.pulses).toBeGreaterThan(0);
    }

    const finished: ColorBallDropState = { ...state, phase: "done" };
    expect(colorBallDropPlugin.hint!(finished)).toBeNull();
    expect(colorBallDropPlugin.isTerminal(finished)).toEqual({ score: finished.score });
  });
});
