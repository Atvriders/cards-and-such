import { describe, it, expect } from "vitest";
import { cockroachBluffPlugin } from "./index.js";
import type { CockroachBluffState } from "./state.js";

const S = { dummy: false } as const;

describe("cockroach-bluff plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(cockroachBluffPlugin.id).toBe("cockroach-bluff");
    expect(cockroachBluffPlugin.title).toBe("Cockroach Poker");
    expect(cockroachBluffPlugin.category).toBe("board");
    expect(cockroachBluffPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof cockroachBluffPlugin.description).toBe("string");
    expect(cockroachBluffPlugin.description.length).toBeGreaterThan(0);
    expect(cockroachBluffPlugin.settings).toBeDefined();
    expect(typeof cockroachBluffPlugin.settings).toBe("object");
    expect(typeof cockroachBluffPlugin.initialState).toBe("function");
    expect(typeof cockroachBluffPlugin.reducer).toBe("function");
    expect(typeof cockroachBluffPlugin.isTerminal).toBe("function");
    expect(typeof cockroachBluffPlugin.hint).toBe("function");
    expect(cockroachBluffPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh state", () => {
    const a = cockroachBluffPlugin.initialState(42, S);
    const b = cockroachBluffPlugin.initialState(42, S);
    expect(a.answer).toEqual(b.answer);
    expect(a.current).toEqual(b.current);
    expect(a.phase).toBe("guess");
    expect(b.phase).toBe("guess");
    expect(a.guesses.length).toBe(0);
    // answerLength is 2 per CockroachBluff_CFG
    expect(a.answer.length).toBe(2);
    expect(a.current.length).toBe(2);
    expect(cockroachBluffPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget on fresh state and null when not in guess phase", () => {
    const state = cockroachBluffPlugin.initialState(7, S);
    const result = cockroachBluffPlugin.hint!(state);
    expect(result).not.toBeNull();
    expect(typeof result!.selector).toBe("string");
    expect(result!.selector.length).toBeGreaterThan(0);
    expect(result!.selector).toMatch(/^\[data-testid="hint-target-deduction-/);
    expect(result!.pulses).toBe(3);

    // When phase is not "guess", the engine selector returns null,
    // so the plugin must surface null too.
    const finished: CockroachBluffState = { ...state, phase: "won" };
    expect(cockroachBluffPlugin.hint!(finished)).toBeNull();
  });
});
