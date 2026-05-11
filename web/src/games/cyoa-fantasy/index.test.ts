import { describe, it, expect } from "vitest";
import { cyoaFantasyPlugin } from "./index.js";

const S = {} as never;

describe("cyoa-fantasy plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(cyoaFantasyPlugin.id).toBe("cyoa-fantasy");
    expect(cyoaFantasyPlugin.title).toBe("Choose Your Path: Fantasy");
    expect(cyoaFantasyPlugin.category).toBe("board");
    expect(cyoaFantasyPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof cyoaFantasyPlugin.description).toBe("string");
    expect(cyoaFantasyPlugin.description.length).toBeGreaterThan(0);
    expect(cyoaFantasyPlugin.settings).toBeDefined();
    expect(typeof cyoaFantasyPlugin.settings).toBe("object");
    expect(typeof cyoaFantasyPlugin.initialState).toBe("function");
    expect(typeof cyoaFantasyPlugin.reducer).toBe("function");
    expect(typeof cyoaFantasyPlugin.isTerminal).toBe("function");
    expect(cyoaFantasyPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh start", () => {
    const a = cyoaFantasyPlugin.initialState(42, S);
    const b = cyoaFantasyPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect((a as { nodeId: string }).nodeId).toBe("start");
    expect((a as { phase: string }).phase).toBe("playing");
    expect((a as { steps: number }).steps).toBe(0);
    expect((a as { scoreBonus: number }).scoreBonus).toBe(0);
    expect(cyoaFantasyPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget on the playing phase and null when finished", () => {
    expect(typeof cyoaFantasyPlugin.hint).toBe("function");
    const state = cyoaFantasyPlugin.initialState(5, S);
    const result = cyoaFantasyPlugin.hint!(state);
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toBe(".cf-choice");
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }

    // Force the terminal-phase branch so hint() returns null.
    const done = { ...(state as object), phase: "done" } as typeof state;
    expect(cyoaFantasyPlugin.hint!(done)).toBeNull();
  });
});
