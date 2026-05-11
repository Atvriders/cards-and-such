import { describe, it, expect } from "vitest";
import { bsCheatPlugin } from "./index.js";
import type { BsCheatState } from "./state.js";

const S = { dummy: false } as never;

describe("bs-cheat plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(bsCheatPlugin.id).toBe("bs-cheat");
    expect(bsCheatPlugin.title).toBe("BS (Cheat)");
    expect(bsCheatPlugin.category).toBe("cards");
    expect(bsCheatPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof bsCheatPlugin.description).toBe("string");
    expect(bsCheatPlugin.description.length).toBeGreaterThan(0);
    expect(bsCheatPlugin.settings).toBeDefined();
    expect(typeof bsCheatPlugin.settings).toBe("object");
    expect(typeof bsCheatPlugin.initialState).toBe("function");
    expect(typeof bsCheatPlugin.reducer).toBe("function");
    expect(typeof bsCheatPlugin.isTerminal).toBe("function");
    expect(bsCheatPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = bsCheatPlugin.initialState(42, S);
    const b = bsCheatPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.round).toBe(1);
    expect(a.you).toBeNull();
    expect(a.cpu).toBeNull();
    expect(a.phase).toBe("ready");
    expect(a.score).toBe(0);
    expect(bsCheatPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget on the ready phase and null otherwise", () => {
    expect(typeof bsCheatPlugin.hint).toBe("function");
    const state = bsCheatPlugin.initialState(5, S);
    const result = bsCheatPlugin.hint!(state);
    expect(result).not.toBeNull();
    expect(typeof result!.selector).toBe("string");
    expect(result!.selector.length).toBeGreaterThan(0);
    expect(result!.selector).toBe('[data-testid="hint-target-bs-cheat-primary"]');
    expect(result!.pulses).toBe(3);

    // Phase not "ready" must return null (covers the false branch of the ternary).
    const notReady: BsCheatState = { ...state, phase: "result" };
    expect(bsCheatPlugin.hint!(notReady)).toBeNull();
    const done: BsCheatState = { ...state, phase: "done" };
    expect(bsCheatPlugin.hint!(done)).toBeNull();
  });
});
