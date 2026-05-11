import { describe, it, expect } from "vitest";
import { aeonsEndMagesPlugin } from "./index.js";
import type { AeonsEndMagesState } from "./state.js";

const S = { difficulty: "Standard" } as const;

describe("aeons-end-mages plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(aeonsEndMagesPlugin.id).toBe("aeons-end-mages");
    expect(aeonsEndMagesPlugin.title).toBe("Aeon's End: Mages");
    expect(aeonsEndMagesPlugin.category).toBe("board");
    expect(aeonsEndMagesPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof aeonsEndMagesPlugin.description).toBe("string");
    expect(aeonsEndMagesPlugin.description.length).toBeGreaterThan(0);
    expect(aeonsEndMagesPlugin.settings).toBeDefined();
    expect(aeonsEndMagesPlugin.settings.difficulty.kind).toBe("enum");
    expect(typeof aeonsEndMagesPlugin.initialState).toBe("function");
    expect(typeof aeonsEndMagesPlugin.reducer).toBe("function");
    expect(typeof aeonsEndMagesPlugin.isTerminal).toBe("function");
    expect(aeonsEndMagesPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh state", () => {
    const a = aeonsEndMagesPlugin.initialState(42, S);
    const b = aeonsEndMagesPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.round).toBe(1);
    expect(a.progress).toBe(0);
    expect(a.threat).toBe(0);
    expect(a.phase).toBe("choose");
    expect(a.morale).toBeGreaterThan(0);
    expect(aeonsEndMagesPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget with a tactic selector while in choose phase, null when done", () => {
    expect(typeof aeonsEndMagesPlugin.hint).toBe("function");
    const state = aeonsEndMagesPlugin.initialState(5, S);
    const result = aeonsEndMagesPlugin.hint!(state);
    expect(result).not.toBeNull();
    expect(typeof result!.selector).toBe("string");
    expect(result!.selector).toMatch(/^\[data-testid="hint-target-coop-tactic-/);
    expect(result!.pulses).toBe(3);

    // Force the engine out of "choose" phase to exercise the null branch.
    const done: AeonsEndMagesState = { ...state, phase: "done" };
    expect(aeonsEndMagesPlugin.hint!(done)).toBeNull();
  });
});
