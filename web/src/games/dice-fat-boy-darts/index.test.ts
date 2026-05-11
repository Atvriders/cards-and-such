import { describe, it, expect } from "vitest";
import { diceFatBoyDartsPlugin } from "./index.js";
import type { DiceFatBoyDartsState } from "./state.js";

const S = { dummy: true } as never;

describe("dice-fat-boy-darts plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(diceFatBoyDartsPlugin.id).toBe("dice-fat-boy-darts");
    expect(diceFatBoyDartsPlugin.title).toBe("Dice Fat Boy Darts");
    expect(diceFatBoyDartsPlugin.category).toBe("dice");
    expect(diceFatBoyDartsPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof diceFatBoyDartsPlugin.description).toBe("string");
    expect(diceFatBoyDartsPlugin.description.length).toBeGreaterThan(0);
    expect(diceFatBoyDartsPlugin.settings).toBeDefined();
    expect(typeof diceFatBoyDartsPlugin.settings).toBe("object");
    expect(typeof diceFatBoyDartsPlugin.initialState).toBe("function");
    expect(typeof diceFatBoyDartsPlugin.reducer).toBe("function");
    expect(typeof diceFatBoyDartsPlugin.isTerminal).toBe("function");
    expect(diceFatBoyDartsPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh game", () => {
    const a = diceFatBoyDartsPlugin.initialState(123, S);
    const b = diceFatBoyDartsPlugin.initialState(123, S);
    expect(a).toEqual(b);
    expect(a.round).toBe(1);
    expect(a.score).toBe(0);
    expect(a.dice).toBeNull();
    expect(a.phase).toBe("rolling");
    expect(a.history).toEqual([]);
    expect(a.log).toEqual([]);
    expect(diceFatBoyDartsPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns either null or a HintTarget with a non-empty selector across phases", () => {
    expect(typeof diceFatBoyDartsPlugin.hint).toBe("function");
    const rolling = diceFatBoyDartsPlugin.initialState(7, S);
    const rollingHint = diceFatBoyDartsPlugin.hint!(rolling);
    expect(rollingHint).not.toBeNull();
    expect(typeof rollingHint!.selector).toBe("string");
    expect(rollingHint!.selector.length).toBeGreaterThan(0);
    expect(rollingHint!.selector).toContain("hint-target-dice-fat-boy-darts-roll");
    expect(rollingHint!.pulses).toBe(3);

    const rolled: DiceFatBoyDartsState = { ...rolling, phase: "rolled" };
    const rolledHint = diceFatBoyDartsPlugin.hint!(rolled);
    expect(rolledHint).not.toBeNull();
    expect(rolledHint!.selector).toContain("hint-target-dice-fat-boy-darts-next");
    expect(rolledHint!.pulses).toBe(3);

    const done: DiceFatBoyDartsState = { ...rolling, phase: "done", score: 200 };
    expect(diceFatBoyDartsPlugin.hint!(done)).toBeNull();
    expect(diceFatBoyDartsPlugin.isTerminal(done)).toEqual({ score: 200 });
  });
});
