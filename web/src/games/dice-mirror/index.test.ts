import { describe, it, expect } from "vitest";
import { diceMirrorPlugin } from "./index.js";
import type { DiceMirrorState } from "./state.js";

const S = { dummy: false } as never;

describe("dice-mirror plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(diceMirrorPlugin.id).toBe("dice-mirror");
    expect(diceMirrorPlugin.title).toBe("Dice Mirror");
    expect(diceMirrorPlugin.category).toBe("dice");
    expect(diceMirrorPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof diceMirrorPlugin.description).toBe("string");
    expect(diceMirrorPlugin.description.length).toBeGreaterThan(0);
    expect(diceMirrorPlugin.settings).toBeDefined();
    expect(typeof diceMirrorPlugin.settings).toBe("object");
    expect(typeof diceMirrorPlugin.initialState).toBe("function");
    expect(typeof diceMirrorPlugin.reducer).toBe("function");
    expect(typeof diceMirrorPlugin.isTerminal).toBe("function");
    expect(diceMirrorPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh start", () => {
    const a = diceMirrorPlugin.initialState(42, S);
    const b = diceMirrorPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.round).toBe(1);
    expect(a.score).toBe(0);
    expect(a.dice).toBeNull();
    expect(a.phase).toBe("rolling");
    expect(a.lastPts).toBe(0);
    expect(diceMirrorPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget for rolling/result phases and null when terminal", () => {
    expect(typeof diceMirrorPlugin.hint).toBe("function");

    const fresh = diceMirrorPlugin.initialState(7, S);
    const rollingHint = diceMirrorPlugin.hint!(fresh);
    expect(rollingHint).not.toBeNull();
    expect(rollingHint!.selector).toBe('[data-testid="hint-target-dice-mirror-roll"]');
    expect(rollingHint!.pulses).toBe(3);

    const resultState: DiceMirrorState = { ...fresh, phase: "result", dice: [3, 3], lastPts: 30 };
    const resultHint = diceMirrorPlugin.hint!(resultState);
    expect(resultHint).not.toBeNull();
    expect(resultHint!.selector).toBe('[data-testid="hint-target-dice-mirror-next"]');
    expect(resultHint!.pulses).toBe(3);

    const doneState: DiceMirrorState = { ...fresh, phase: "done", dice: [6, 6], score: 60 };
    expect(diceMirrorPlugin.hint!(doneState)).toBeNull();
    expect(diceMirrorPlugin.isTerminal(doneState)).toEqual({ score: 60 });
  });
});
