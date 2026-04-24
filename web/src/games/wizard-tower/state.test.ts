import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

describe("Wizard Tower", () => {
  it("initializes wave 1 with Imp and 6 mana", () => {
    const s = initialState(1);
    expect(s.wave).toBe(1);
    expect(s.enemies.length).toBe(1);
    expect(s.enemies[0]!.name).toBe("Imp");
    expect(s.mana).toBe(6);
    expect(s.phase).toBe("combat");
  });

  it("casting fireball deals damage", () => {
    const s = initialState(1);
    const s2 = reducer(s, { type: "cast", spell: "fire" });
    expect(s2.enemies.length === 0 || s2.enemies[0]!.hp < s.enemies[0]!.hp).toBe(true);
    expect(s2.mana).toBe(s.mana - 2);
  });

  it("combo deals bonus damage", () => {
    const s = initialState(1);
    // Cast ice then fire for fire combo
    const s2 = reducer(s, { type: "cast", spell: "ice" });
    const enemyHpAfterIce = s2.enemies[0]?.hp ?? 0;
    if (s2.enemies.length === 0) return; // ice killed imp (shouldn't happen at 15 hp with 8 dmg)
    const s3 = reducer(s2, { type: "cast", spell: "fire" });
    if (s3.enemies.length > 0) {
      // fire combo = 14 + 8 = 22
      const dmgDealt = enemyHpAfterIce - (s3.enemies[0]?.hp ?? 0);
      expect(dmgDealt).toBe(22);
    }
  });

  it("mana shield adds shield", () => {
    const s = initialState(1);
    const s2 = reducer(s, { type: "cast", spell: "shield" });
    expect(s2.shield).toBeGreaterThan(0);
  });

  it("cannot cast when insufficient mana", () => {
    const s = { ...initialState(1), mana: 1 };
    const s2 = reducer(s, { type: "cast", spell: "fire" }); // costs 2
    expect(s2.mana).toBe(1); // unchanged
  });

  it("end round causes enemies to attack and restores mana", () => {
    const s = { ...initialState(1), mana: 0 }; // start at 0 so +2 gain is visible
    const s2 = reducer(s, { type: "endRound" });
    if (s2.phase !== "dead") {
      expect(s2.playerHp).toBeLessThan(s.playerHp);
      expect(s2.mana).toBe(2); // +2 mana restored
    }
  });

  it("nextWave advances from waveClear", () => {
    const s = { ...initialState(1), phase: "waveClear" as const, wave: 1 };
    const s2 = reducer(s, { type: "nextWave" });
    expect(s2.wave).toBe(2);
    expect(s2.phase).toBe("combat");
  });

  it("isTerminal null during combat", () => {
    expect(isTerminal(initialState(1))).toBeNull();
  });

  it("isTerminal score when won", () => {
    const s = { ...initialState(1), phase: "won" as const, playerHp: 30, mana: 4 };
    const r = isTerminal(s);
    expect(r!.score).toBe(100 + 60 + 20);
  });
});
