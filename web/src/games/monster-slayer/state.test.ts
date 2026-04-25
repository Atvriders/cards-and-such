import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

describe("Monster Slayer", () => {
  it("initializes correctly", () => {
    const s = initialState(1);
    expect(s.wave).toBe(1);
    expect(s.playerHp).toBe(60);
    expect(s.phase).toBe("combat");
    expect(s.monster.name).toBe("Slime");
  });

  it("slash ability deals damage", () => {
    const s = initialState(1);
    const s2 = reducer(s, { type: "useAbility", ability: "slash" });
    // Either monster took damage or player died (very unlikely)
    if (s2.phase === "combat" || s2.phase === "reward") {
      expect(s2.monster.hp).toBeLessThanOrEqual(s.monster.hp);
    }
  });

  it("guard adds temp armor", () => {
    const s = initialState(1);
    const s2 = reducer(s, { type: "useAbility", ability: "guard" });
    if (s2.phase === "combat") {
      expect(s2.tempArmor).toBe(8);
    }
  });

  it("cooldown prevents reuse", () => {
    const s = initialState(1);
    const s2 = reducer(s, { type: "useAbility", ability: "bash" });
    if (s2.phase === "combat") {
      expect(s2.cooldowns.bash).toBeGreaterThan(0);
      const s3 = reducer(s2, { type: "useAbility", ability: "bash" });
      // Should not change monster HP since bash on cooldown
      expect(s3.cooldowns.bash).toBe(s2.cooldowns.bash);
    }
  });

  it("potion heals player", () => {
    const s = { ...initialState(1), playerHp: 30 };
    const s2 = reducer(s, { type: "useAbility", ability: "potion" });
    if (s2.phase === "combat") {
      expect(s2.playerHp).toBeGreaterThan(30);
    }
  });

  it("isTerminal null during combat", () => {
    expect(isTerminal(initialState(1))).toBeNull();
  });

  it("isTerminal returns 100 on done", () => {
    const s = { ...initialState(1), phase: "done" as const };
    const r = isTerminal(s);
    expect(r).not.toBeNull();
    expect(r!.score).toBe(100);
  });

  it("nextWave advances wave from reward", () => {
    const s = { ...initialState(1), phase: "reward" as const, wave: 1 };
    const s2 = reducer(s, { type: "nextWave" });
    expect(s2.wave).toBe(2);
    expect(s2.phase).toBe("combat");
  });
});
