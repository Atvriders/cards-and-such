import { describe, it, expect } from "vitest";
import { blindHookeyPlugin } from "./index.js";
import type { BlindHookeyState } from "./state.js";

const S = { dummy: false } as never;

describe("blind-hookey plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(blindHookeyPlugin.id).toBe("blind-hookey");
    expect(blindHookeyPlugin.title).toBe("Blind Hookey");
    expect(blindHookeyPlugin.category).toBe("solitaire");
    expect(blindHookeyPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof blindHookeyPlugin.description).toBe("string");
    expect(blindHookeyPlugin.description.length).toBeGreaterThan(0);
    expect(blindHookeyPlugin.settings).toBeDefined();
    expect(typeof blindHookeyPlugin.settings).toBe("object");
    expect(typeof blindHookeyPlugin.initialState).toBe("function");
    expect(typeof blindHookeyPlugin.reducer).toBe("function");
    expect(typeof blindHookeyPlugin.isTerminal).toBe("function");
    expect(blindHookeyPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = blindHookeyPlugin.initialState(42, S);
    const b = blindHookeyPlugin.initialState(42, S);
    expect(a.deck.join(",")).toBe(b.deck.join(","));
    expect(a.hand.join(",")).toBe(b.hand.join(","));
    expect(a.pos).toBe(b.pos);
    expect(a.round).toBe(0);
    expect(a.score).toBe(0);
    expect(a.phase).toBe("playing");
    expect(blindHookeyPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when terminal", () => {
    expect(typeof blindHookeyPlugin.hint).toBe("function");
    const state = blindHookeyPlugin.initialState(7, S);
    const result = blindHookeyPlugin.hint!(state);
    expect(result).not.toBeNull();
    expect(typeof result!.selector).toBe("string");
    expect(result!.selector.length).toBeGreaterThan(0);
    if (result!.pulses !== undefined) {
      expect(typeof result!.pulses).toBe("number");
      expect(result!.pulses).toBeGreaterThan(0);
    }

    const finished: BlindHookeyState = { ...state, phase: "done" };
    expect(blindHookeyPlugin.hint!(finished)).toBeNull();
    expect(blindHookeyPlugin.isTerminal(finished)).toEqual({ score: finished.score });
  });
});
