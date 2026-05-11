import { describe, it, expect } from "vitest";
import { bocceSkillPlugin } from "./index.js";
import type { BocceSkillState } from "./state.js";

const S = { dummy: true } as never;

describe("bocce-skill plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(bocceSkillPlugin.id).toBe("bocce-skill");
    expect(bocceSkillPlugin.title).toBe("Bocce Skill");
    expect(bocceSkillPlugin.category).toBe("dice");
    expect(bocceSkillPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof bocceSkillPlugin.description).toBe("string");
    expect(bocceSkillPlugin.description.length).toBeGreaterThan(0);
    expect(bocceSkillPlugin.settings).toBeDefined();
    expect(typeof bocceSkillPlugin.settings).toBe("object");
    expect(typeof bocceSkillPlugin.initialState).toBe("function");
    expect(typeof bocceSkillPlugin.reducer).toBe("function");
    expect(typeof bocceSkillPlugin.isTerminal).toBe("function");
    expect(bocceSkillPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh state", () => {
    const a = bocceSkillPlugin.initialState(42, S);
    const b = bocceSkillPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.rngSeed).toBe(42);
    expect(a.round).toBe(1);
    expect(a.dice).toBeNull();
    expect(a.score).toBe(0);
    expect(a.phase).toBe("rolling");
    expect(bocceSkillPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget with the correct selector per phase, and null when terminal", () => {
    expect(typeof bocceSkillPlugin.hint).toBe("function");
    const rollingState = bocceSkillPlugin.initialState(7, S);
    const rollingHint = bocceSkillPlugin.hint!(rollingState);
    expect(rollingHint).not.toBeNull();
    expect(rollingHint!.selector).toBe('[data-testid="hint-target-bocce-skill-roll"]');
    expect(rollingHint!.pulses).toBe(3);

    const rolledState: BocceSkillState = { ...rollingState, phase: "rolled" };
    const rolledHint = bocceSkillPlugin.hint!(rolledState);
    expect(rolledHint).not.toBeNull();
    expect(rolledHint!.selector).toBe('[data-testid="hint-target-bocce-skill-next"]');
    expect(rolledHint!.pulses).toBe(3);

    const doneState: BocceSkillState = { ...rollingState, phase: "done" };
    expect(bocceSkillPlugin.hint!(doneState)).toBeNull();
    expect(bocceSkillPlugin.isTerminal(doneState)).toEqual({ score: 0 });
  });
});
