import { describe, it, expect } from "vitest";
import {
  initialState,
  reducer,
  isTerminal,
  STARTING_HP,
  WIN_VP,
  DICE_COUNT,
  MAX_ROLLS,
  MONSTER_NAMES,
  type KingOfTokyoFullState,
  type KingOfTokyoFullAction,
} from "./state.js";

const S = { _dummy: false };

describe("KingOfTokyoFull", () => {
  it("initialState is deterministic by seed", () => {
    const a = initialState(42, S);
    const b = initialState(42, S);
    expect(a.dice).toEqual(b.dice);
    expect(a.players.map((p) => p.name)).toEqual(b.players.map((p) => p.name));
    expect(a.rngSeed).toBe(b.rngSeed);
  });

  it("initialState seeds differ", () => {
    const a = initialState(1, S);
    const b = initialState(2, S);
    // 6 dice — overwhelmingly unlikely to be byte-identical for different seeds
    expect(JSON.stringify(a.dice)).not.toBe(JSON.stringify(b.dice));
  });

  it("starts with 4 players, each 10 HP and 0 VP", () => {
    const s = initialState(7, S);
    expect(s.players).toHaveLength(MONSTER_NAMES.length);
    for (const p of s.players) {
      expect(p.hp).toBe(STARTING_HP);
      expect(p.vp).toBe(0);
      expect(p.energy).toBe(0);
      expect(p.alive).toBe(true);
    }
    expect(s.tokyo).toBeNull();
  });

  it("rolls 6 dice initially in rolling phase", () => {
    const s = initialState(7, S);
    expect(s.phase).toBe("rolling");
    expect(s.dice).toHaveLength(DICE_COUNT);
    expect(s.rollsUsed).toBe(1);
  });

  it("isTerminal is null on fresh state", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });

  it("toggleKeep flips kept flag for human turn", () => {
    const s0 = initialState(7, S);
    const s1 = reducer(s0, { type: "toggleKeep", index: 0 });
    expect(s1.kept[0]).toBe(true);
    const s2 = reducer(s1, { type: "toggleKeep", index: 0 });
    expect(s2.kept[0]).toBe(false);
  });

  it("reroll advances rollsUsed and may change dice", () => {
    const s0 = initialState(7, S);
    const s1 = reducer(s0, { type: "reroll" });
    expect(s1.rollsUsed).toBe(2);
    const s2 = reducer(s1, { type: "reroll" });
    expect(s2.rollsUsed).toBe(3);
    // Fourth reroll should be a no-op (returns same reference)
    const s3 = reducer(s2, { type: "reroll" });
    expect(s3).toBe(s2);
  });

  it("endRolling moves to buyPhase or yieldPrompt", () => {
    const s0 = initialState(7, S);
    const s1 = reducer(s0, { type: "endRolling" });
    expect(["buyPhase", "yieldPrompt", "gameOver"]).toContain(s1.phase);
  });

  it("illegal actions return same reference", () => {
    const s0 = initialState(7, S);
    // buy in rolling phase
    const s1 = reducer(s0, { type: "buy", cardId: "detritivore" });
    expect(s1).toBe(s0);
    // yield in rolling phase
    const s2 = reducer(s0, { type: "yieldTokyo", yield: true });
    expect(s2).toBe(s0);
    // toggleKeep out-of-range
    const s3 = reducer(s0, { type: "toggleKeep", index: 99 });
    expect(s3).toBe(s0);
  });

  it("CPU step on human turn is a no-op for rolling", () => {
    const s0 = initialState(7, S);
    // It's player 0's turn (human); cpuStep should not advance
    const s1 = reducer(s0, { type: "cpuStep" });
    expect(s1).toBe(s0);
  });

  it("game can be forced to terminal via crafted state (20 VP)", () => {
    // Build a state where player 0 has 19 VP and is in Tokyo.
    // Then advanceTurn would award them +2 VP on start of next turn... but
    // since `current` advances to next player first, we instead simulate the
    // VP-trigger via resolveDice path by giving 3+ matching dice.
    const base = initialState(7, S);
    const crafted: KingOfTokyoFullState = {
      ...base,
      players: base.players.map((p, i) => i === 0 ? { ...p, vp: WIN_VP - 1 } : p),
      dice: ["3", "3", "3", "energy", "energy", "energy"],
      kept: [true, true, true, true, true, true],
      rollsUsed: MAX_ROLLS,
      phase: "rolling",
    };
    const after = reducer(crafted, { type: "endRolling" } as KingOfTokyoFullAction);
    expect(after.phase).toBe("gameOver");
    const t = isTerminal(after);
    expect(t).not.toBeNull();
    expect(t!.score).toBeGreaterThanOrEqual(WIN_VP);
  });

  it("loss returns score 0 (off leaderboard)", () => {
    const base = initialState(7, S);
    const crafted: KingOfTokyoFullState = {
      ...base,
      players: base.players.map((p, i) =>
        i === 1 ? { ...p, vp: WIN_VP - 1 } : p
      ),
      current: 1,
      dice: ["3", "3", "3", "energy", "energy", "energy"],
      kept: [true, true, true, true, true, true],
      rollsUsed: MAX_ROLLS,
      phase: "rolling",
    };
    const after = reducer(crafted, { type: "endRolling" } as KingOfTokyoFullAction);
    expect(after.phase).toBe("gameOver");
    expect(after.winnerIndex).toBe(1);
    expect(isTerminal(after)).toEqual({ score: 0 });
  });

  it("attacking empty Tokyo enters Tokyo and gains 1 VP", () => {
    const base = initialState(7, S);
    const crafted: KingOfTokyoFullState = {
      ...base,
      dice: ["claw", "claw", "claw", "1", "2", "3"],
      kept: [true, true, true, true, true, true],
      rollsUsed: MAX_ROLLS,
      tokyo: null,
    };
    const after = reducer(crafted, { type: "endRolling" } as KingOfTokyoFullAction);
    // We entered Tokyo and gained +1 VP for entering
    expect(after.tokyo).toBe(0);
    expect(after.players[0]!.vp).toBeGreaterThanOrEqual(1);
  });

  it("heart in Tokyo does not heal", () => {
    const base = initialState(7, S);
    const crafted: KingOfTokyoFullState = {
      ...base,
      players: base.players.map((p, i) => i === 0 ? { ...p, hp: 5 } : p),
      tokyo: 0,
      dice: ["heart", "heart", "heart", "1", "2", "3"],
      kept: [true, true, true, true, true, true],
      rollsUsed: MAX_ROLLS,
    };
    const after = reducer(crafted, { type: "endRolling" } as KingOfTokyoFullAction);
    expect(after.players[0]!.hp).toBe(5);
  });
});
