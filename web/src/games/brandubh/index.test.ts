import { describe, it, expect } from "vitest";
import { brandubhPlugin } from "./index.js";

const S = { dummy: false } as never;

describe("brandubh plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(brandubhPlugin.id).toBe("brandubh");
    expect(brandubhPlugin.title).toBe("Brandubh");
    expect(brandubhPlugin.category).toBe("board");
    expect(brandubhPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof brandubhPlugin.description).toBe("string");
    expect(brandubhPlugin.description.length).toBeGreaterThan(0);
    expect(brandubhPlugin.settings).toBeDefined();
    expect(typeof brandubhPlugin.settings).toBe("object");
    expect(typeof brandubhPlugin.initialState).toBe("function");
    expect(typeof brandubhPlugin.reducer).toBe("function");
    expect(typeof brandubhPlugin.isTerminal).toBe("function");
    expect(brandubhPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh state", () => {
    const a = brandubhPlugin.initialState(42, S);
    const b = brandubhPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.rngSeed).toBe(42);
    expect(a.turn).toBe("P");
    expect(a.moves).toBe(0);
    expect(a.result).toBeNull();
    expect(a.phase).toBe("playing");
    expect(a.board.length).toBe(25);
    expect(a.board.every((c) => c === null)).toBe(true);
    expect(brandubhPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when done", () => {
    expect(typeof brandubhPlugin.hint).toBe("function");
    const playing = brandubhPlugin.initialState(7, S);
    const hint = brandubhPlugin.hint!(playing);
    expect(hint).not.toBeNull();
    expect(typeof hint!.selector).toBe("string");
    expect(hint!.selector.length).toBeGreaterThan(0);
    if (hint!.pulses !== undefined) {
      expect(typeof hint!.pulses).toBe("number");
      expect(hint!.pulses).toBeGreaterThan(0);
    }

    const done = { ...playing, phase: "done" as const };
    expect(brandubhPlugin.hint!(done)).toBeNull();
  });
});
