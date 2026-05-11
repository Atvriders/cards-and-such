import { describe, it, expect } from "vitest";
import { aloneAmongStarsCardPlugin } from "./index.js";

const S = { dummy: false } as never;

describe("alone-among-stars-card plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(aloneAmongStarsCardPlugin.id).toBe("alone-among-stars-card");
    expect(aloneAmongStarsCardPlugin.title).toBe("Alone Among the Stars: Card Log");
    expect(aloneAmongStarsCardPlugin.category).toBe("board");
    expect(aloneAmongStarsCardPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof aloneAmongStarsCardPlugin.description).toBe("string");
    expect(aloneAmongStarsCardPlugin.description.length).toBeGreaterThan(0);
    expect(aloneAmongStarsCardPlugin.settings).toBeDefined();
    expect(typeof aloneAmongStarsCardPlugin.settings).toBe("object");
    expect(typeof aloneAmongStarsCardPlugin.initialState).toBe("function");
    expect(typeof aloneAmongStarsCardPlugin.reducer).toBe("function");
    expect(typeof aloneAmongStarsCardPlugin.isTerminal).toBe("function");
    expect(aloneAmongStarsCardPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh state", () => {
    const a = aloneAmongStarsCardPlugin.initialState(42, S);
    const b = aloneAmongStarsCardPlugin.initialState(42, S);
    expect(a.rngSeed).toBe(b.rngSeed);
    expect(a.index).toBe(b.index);
    expect(a.phase).toBe(b.phase);
    expect(a.score).toBe(b.score);
    expect(a.selected).toBe(b.selected);
    expect(a.prompts.length).toBe(b.prompts.length);
    expect(a.prompts.map((p) => p.prompt).join("|")).toBe(b.prompts.map((p) => p.prompt).join("|"));
    expect(a.phase).toBe("choose");
    expect(aloneAmongStarsCardPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget in choose phase and null otherwise", () => {
    expect(typeof aloneAmongStarsCardPlugin.hint).toBe("function");
    const state = aloneAmongStarsCardPlugin.initialState(7, S);
    const result = aloneAmongStarsCardPlugin.hint!(state);
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toMatch(/hint-target-alone-among-stars-card/);
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }

    const resultState = { ...state, phase: "result" as const };
    expect(aloneAmongStarsCardPlugin.hint!(resultState)).toBeNull();

    const doneState = { ...state, phase: "done" as const };
    expect(aloneAmongStarsCardPlugin.hint!(doneState)).toBeNull();
  });
});
