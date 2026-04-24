import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

describe("Dice Dungeon", () => {
  it("initializes with room 1 Goblin", () => {
    const s = initialState(1);
    expect(s.room).toBe(1);
    expect(s.enemyName).toBe("Goblin");
    expect(s.playerHp).toBe(30);
    expect(s.phase).toBe("roll");
  });

  it("rolling attack changes hp values", () => {
    const s = initialState(42);
    const s2 = reducer(s, { type: "rollAttack" });
    // Either enemy takes damage or player does (or both)
    const enemyDamaged = s2.enemyHp < s.enemyHp;
    const playerDamaged = s2.playerHp < s.playerHp;
    expect(enemyDamaged || playerDamaged).toBe(true);
  });

  it("rolling defend sets shield", () => {
    const s = initialState(42);
    const s2 = reducer(s, { type: "rollDefend" });
    expect(s2.shield).toBeGreaterThan(0);
    expect(s2.lastRoll.length).toBe(s.playerDice);
  });

  it("nextRoom advances room from reward phase", () => {
    const s = { ...initialState(1), phase: "reward" as const, room: 1 };
    const s2 = reducer(s, { type: "nextRoom" });
    expect(s2.room).toBe(2);
    expect(s2.enemyName).toBe("Skeleton");
    expect(s2.phase).toBe("roll");
  });

  it("player dies when hp drops to 0", () => {
    const s = { ...initialState(1), playerHp: 1 };
    // Roll attack may kill player — run a few times
    let dead = false;
    let cur = s;
    for (let i = 0; i < 10; i++) {
      cur = reducer(cur, { type: "rollAttack" });
      if (cur.phase === "dead") { dead = true; break; }
      cur = { ...cur, playerHp: 1, phase: "roll" };
    }
    expect(dead).toBe(true);
  });

  it("isTerminal null during roll phase", () => {
    expect(isTerminal(initialState(1))).toBeNull();
  });

  it("isTerminal returns score when won", () => {
    const s = { ...initialState(1), phase: "won" as const, playerHp: 20 };
    const r = isTerminal(s);
    expect(r).not.toBeNull();
    expect(r!.score).toBe(120);
  });

  it("isTerminal returns score when dead", () => {
    const s = { ...initialState(1), phase: "dead" as const, room: 4 };
    const r = isTerminal(s);
    expect(r).not.toBeNull();
    expect(r!.score).toBe(36);
  });
});
