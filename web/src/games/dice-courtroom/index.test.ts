import { describe, it, expect } from "vitest";
import { diceCourtroomPlugin } from "./index.js";
import type { DiceCourtroomState } from "./state.js";

const S = { dummy: false } as never;

describe("dice-courtroom plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(diceCourtroomPlugin.id).toBe("dice-courtroom");
    expect(diceCourtroomPlugin.title).toBe("Dice Courtroom");
    expect(diceCourtroomPlugin.category).toBe("dice");
    expect(diceCourtroomPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof diceCourtroomPlugin.description).toBe("string");
    expect(diceCourtroomPlugin.description.length).toBeGreaterThan(0);
    expect(diceCourtroomPlugin.settings).toBeDefined();
    expect(typeof diceCourtroomPlugin.settings).toBe("object");
    expect(typeof diceCourtroomPlugin.initialState).toBe("function");
    expect(typeof diceCourtroomPlugin.reducer).toBe("function");
    expect(typeof diceCourtroomPlugin.isTerminal).toBe("function");
    expect(diceCourtroomPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh state", () => {
    const a = diceCourtroomPlugin.initialState(42, S);
    const b = diceCourtroomPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.rngSeed).toBe(42);
    expect(a.round).toBe(1);
    expect(a.myEvidence).toBe(0);
    expect(a.oppEvidence).toBe(0);
    expect(a.score).toBe(0);
    expect(a.phase).toBe("choose");
    expect(a.rolls).toBeNull();
    expect(diceCourtroomPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget for active phases and null when terminal", () => {
    expect(typeof diceCourtroomPlugin.hint).toBe("function");
    const fresh = diceCourtroomPlugin.initialState(7, S);
    const chooseHint = diceCourtroomPlugin.hint!(fresh);
    expect(chooseHint).not.toBeNull();
    expect(chooseHint!.selector).toBe('[data-testid="hint-target-dice-courtroom-roll"]');
    expect(chooseHint!.pulses).toBe(3);

    const resultState: DiceCourtroomState = { ...fresh, phase: "result" };
    const resultHint = diceCourtroomPlugin.hint!(resultState);
    expect(resultHint).not.toBeNull();
    expect(resultHint!.selector).toBe('[data-testid="hint-target-dice-courtroom-next"]');
    expect(resultHint!.pulses).toBe(3);

    const doneState: DiceCourtroomState = { ...fresh, phase: "done" };
    expect(diceCourtroomPlugin.isTerminal(doneState)).toEqual({ score: doneState.score });
    expect(diceCourtroomPlugin.hint!(doneState)).toBeNull();
  });
});
