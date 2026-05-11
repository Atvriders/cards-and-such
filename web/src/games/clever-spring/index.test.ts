import { describe, it, expect } from "vitest";
import { cleverSpringPlugin } from "./index.js";
import type { CleverSpringSettings, CleverSpringState } from "./state.js";
import { TOTAL_CELLS } from "./state.js";

const S: CleverSpringSettings = { dummy: false };

describe("cleverSpringPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(cleverSpringPlugin.id).toBe("clever-spring");
    expect(cleverSpringPlugin.title).toBe("Clever Spring");
    expect(cleverSpringPlugin.category).toBe("dice");
    expect(cleverSpringPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof cleverSpringPlugin.description).toBe("string");
    expect(cleverSpringPlugin.description.length).toBeGreaterThan(0);
    expect(cleverSpringPlugin.settings).toBeDefined();
    expect(cleverSpringPlugin.settings.dummy.kind).toBe("boolean");
    expect(cleverSpringPlugin.settings.dummy.default).toBe(false);
    expect(typeof cleverSpringPlugin.initialState).toBe("function");
    expect(typeof cleverSpringPlugin.reducer).toBe("function");
    expect(typeof cleverSpringPlugin.isTerminal).toBe("function");
    expect(typeof cleverSpringPlugin.hint).toBe("function");
    expect(cleverSpringPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = cleverSpringPlugin.initialState(42, S);
    const b = cleverSpringPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.rngSeed).toBe(42);
    expect(a.filled.length).toBe(TOTAL_CELLS);
    expect(a.filled.every((f) => f === false)).toBe(true);
    expect(a.fillValues.length).toBe(TOTAL_CELLS);
    expect(a.fillValues.every((v) => v === 0)).toBe(true);
    expect(a.rolls).toBe(0);
    expect(a.lastDice).toEqual([]);
    expect(a.selectedDie).toBeNull();
    expect(a.score).toBe(0);
    expect(a.phase).toBe("rolling");
    expect(cleverSpringPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget for known phases and a default rolling target otherwise", () => {
    const fresh = cleverSpringPlugin.initialState(7, S);
    const rolling = cleverSpringPlugin.hint!(fresh);
    expect(rolling).not.toBeNull();
    expect(rolling!.selector).toBe('[data-testid="hint-target-clever-spring-roll"]');
    expect(rolling!.pulses).toBe(3);

    const picking: CleverSpringState = { ...fresh, phase: "picking" };
    const pickTarget = cleverSpringPlugin.hint!(picking);
    expect(pickTarget).not.toBeNull();
    expect(pickTarget!.selector).toBe('[data-testid="hint-target-clever-spring-pick"]');
    expect(pickTarget!.pulses).toBe(3);

    const placing: CleverSpringState = { ...fresh, phase: "placing" };
    const placeTarget = cleverSpringPlugin.hint!(placing);
    expect(placeTarget).not.toBeNull();
    expect(placeTarget!.selector).toBe('[data-testid="hint-target-clever-spring-place"]');
    expect(placeTarget!.pulses).toBe(3);

    // Unknown phase falls through to the default roll hint target.
    const unknown = { ...fresh, phase: "mystery" as unknown as CleverSpringState["phase"] };
    const fallback = cleverSpringPlugin.hint!(unknown);
    expect(fallback).not.toBeNull();
    expect(fallback!.selector).toBe('[data-testid="hint-target-clever-spring-roll"]');
  });
});
