import { describe, it, expect } from "vitest";
import { diceDungeonPlugin } from "./index.js";
import type { DiceDungeonState } from "./state.js";

const S = {} as never;

describe("dice-dungeon plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(diceDungeonPlugin.id).toBe("dice-dungeon");
    expect(diceDungeonPlugin.title).toBe("Dice Dungeon");
    expect(diceDungeonPlugin.category).toBe("dice");
    expect(diceDungeonPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof diceDungeonPlugin.description).toBe("string");
    expect(diceDungeonPlugin.description.length).toBeGreaterThan(0);
    expect(diceDungeonPlugin.settings).toBeDefined();
    expect(typeof diceDungeonPlugin.settings).toBe("object");
    expect(typeof diceDungeonPlugin.initialState).toBe("function");
    expect(typeof diceDungeonPlugin.reducer).toBe("function");
    expect(typeof diceDungeonPlugin.isTerminal).toBe("function");
    expect(diceDungeonPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh state", () => {
    const a = diceDungeonPlugin.initialState(123, S) as DiceDungeonState;
    const b = diceDungeonPlugin.initialState(123, S) as DiceDungeonState;
    expect(a.rngSeed).toBe(b.rngSeed);
    expect(a.room).toBe(b.room);
    expect(a.playerHp).toBe(b.playerHp);
    expect(a.enemyHp).toBe(b.enemyHp);
    expect(a.enemyName).toBe(b.enemyName);
    expect(a.enemyDice).toBe(b.enemyDice);
    expect(a.playerDice).toBe(b.playerDice);
    expect(a.phase).toBe("roll");
    expect(diceDungeonPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget for roll/reward phases and null at gameover", () => {
    expect(typeof diceDungeonPlugin.hint).toBe("function");
    const state = diceDungeonPlugin.initialState(7, S) as DiceDungeonState;

    const rollHint = diceDungeonPlugin.hint!(state);
    expect(rollHint).not.toBeNull();
    expect(typeof rollHint!.selector).toBe("string");
    expect(rollHint!.selector.length).toBeGreaterThan(0);
    expect(rollHint!.selector).toContain("dice-dungeon-roll");
    if (rollHint!.pulses !== undefined) {
      expect(typeof rollHint!.pulses).toBe("number");
      expect(rollHint!.pulses).toBeGreaterThan(0);
    }

    const rewardState: DiceDungeonState = { ...state, phase: "reward" };
    const rewardHint = diceDungeonPlugin.hint!(rewardState);
    expect(rewardHint).not.toBeNull();
    expect(rewardHint!.selector).toContain("dice-dungeon-next");

    // Source guards by phase === "gameover" or gameOver flag; pass a synthetic
    // gameOver flag to exercise the null branch without source changes.
    const gameOverState = { ...state, gameOver: true } as unknown as DiceDungeonState;
    expect(diceDungeonPlugin.hint!(gameOverState)).toBeNull();
  });
});
