import { describe, it, expect } from "vitest";
import { antAttackPlugin } from "./index.js";
import type { AntAttackState } from "./state.js";

const S = { dummy: false } as never;

describe("ant-attack plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(antAttackPlugin.id).toBe("ant-attack");
    expect(antAttackPlugin.title).toBe("Ant Attack");
    expect(antAttackPlugin.category).toBe("arcade");
    expect(antAttackPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof antAttackPlugin.description).toBe("string");
    expect(antAttackPlugin.description.length).toBeGreaterThan(0);
    expect(typeof antAttackPlugin.howToPlay).toBe("string");
    expect(antAttackPlugin.settings).toBeDefined();
    expect(typeof antAttackPlugin.settings).toBe("object");
    expect(typeof antAttackPlugin.initialState).toBe("function");
    expect(typeof antAttackPlugin.reducer).toBe("function");
    expect(typeof antAttackPlugin.isTerminal).toBe("function");
    expect(antAttackPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh start", () => {
    const a = antAttackPlugin.initialState(99, S);
    const b = antAttackPlugin.initialState(99, S);
    expect(a).toEqual(b);
    expect(a.phase).toBe("playing");
    expect(a.critters).toEqual([]);
    expect(a.score).toBe(0);
    expect(a.popped).toBe(0);
    expect(a.missed).toBe(0);
    expect(a.ticksRemaining).toBeGreaterThan(0);
    expect(antAttackPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns null when no critters and a HintTarget with valid selector when critters exist", () => {
    expect(typeof antAttackPlugin.hint).toBe("function");

    // Fresh state has empty critters -> hint should be null.
    const fresh = antAttackPlugin.initialState(7, S);
    expect(antAttackPlugin.hint!(fresh)).toBeNull();

    // Inject a critter to force hint() to return a HintTarget.
    const withCritter: AntAttackState = {
      ...fresh,
      critters: [{ id: 1, lane: 2, ticksLeft: 3 }],
    };
    const target = antAttackPlugin.hint!(withCritter);
    expect(target).not.toBeNull();
    if (target !== null) {
      expect(typeof target.selector).toBe("string");
      expect(target.selector.length).toBeGreaterThan(0);
      expect(target.selector).toMatch(/^\[data-testid="/);
      if (target.pulses !== undefined) {
        expect(typeof target.pulses).toBe("number");
        expect(target.pulses).toBeGreaterThan(0);
      }
    }

    // Phase done -> hint should be null even with critters present.
    const done: AntAttackState = {
      ...fresh,
      phase: "done",
      critters: [{ id: 2, lane: 1, ticksLeft: 2 }],
    };
    expect(antAttackPlugin.hint!(done)).toBeNull();
  });
});
