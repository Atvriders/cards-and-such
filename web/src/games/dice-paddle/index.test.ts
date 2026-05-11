import { describe, it, expect } from "vitest";
import { dicePaddlePlugin } from "./index.js";

const S = { dummy: false } as never;

describe("dice-paddle plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(dicePaddlePlugin.id).toBe("dice-paddle");
    expect(dicePaddlePlugin.title).toBe("Dice Paddle");
    expect(dicePaddlePlugin.category).toBe("dice");
    expect(dicePaddlePlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof dicePaddlePlugin.description).toBe("string");
    expect(dicePaddlePlugin.description.length).toBeGreaterThan(0);
    expect(typeof dicePaddlePlugin.howToPlay).toBe("string");
    expect(dicePaddlePlugin.settings).toBeDefined();
    expect(typeof dicePaddlePlugin.initialState).toBe("function");
    expect(typeof dicePaddlePlugin.reducer).toBe("function");
    expect(typeof dicePaddlePlugin.isTerminal).toBe("function");
    expect(dicePaddlePlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh start", () => {
    const a = dicePaddlePlugin.initialState(42, S);
    const b = dicePaddlePlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.round).toBe(1);
    expect(a.score).toBe(0);
    expect(a.pick).toBeNull();
    expect(a.roll).toBeNull();
    expect(a.phase).toBe("picking");
    expect(dicePaddlePlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget for picking/result phases and null when terminal", () => {
    expect(typeof dicePaddlePlugin.hint).toBe("function");

    const picking = dicePaddlePlugin.initialState(7, S);
    const pickingHint = dicePaddlePlugin.hint!(picking);
    expect(pickingHint).not.toBeNull();
    expect(pickingHint!.selector).toBe('[data-testid="hint-target-dice-paddle-roll"]');
    expect(pickingHint!.pulses).toBe(3);

    // Move through reducer into result phase to exercise the second hint branch.
    const afterPick = dicePaddlePlugin.reducer(picking, { type: "pick", choice: "light" });
    expect(afterPick.phase).toBe("result");
    const resultHint = dicePaddlePlugin.hint!(afterPick);
    expect(resultHint).not.toBeNull();
    expect(resultHint!.selector).toBe('[data-testid="hint-target-dice-paddle-next"]');
    expect(resultHint!.pulses).toBe(3);

    // Terminal state should produce null.
    const done = { ...picking, phase: "done" as const };
    expect(dicePaddlePlugin.isTerminal(done)).toEqual({ score: done.score });
    expect(dicePaddlePlugin.hint!(done)).toBeNull();
  });
});
