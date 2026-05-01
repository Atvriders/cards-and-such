import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, PLAYER_HP } from "./state.js";

const S = { dummy: false };

describe("dice-arena", () => {
  it("starts with full HP and 3 opponents", () => {
    const s = initialState(1, S);
    expect(s.myHp).toBe(PLAYER_HP);
    expect(s.opps.length).toBe(3);
    expect(s.opps.every(o => o.hp === o.maxHp)).toBe(true);
  });
  it("fight produces dice and damage", () => {
    const s = reducer(initialState(2, S), { type: "fight" });
    expect(s.rolls).not.toBeNull();
    expect(s.opps[0]!.hp).toBeLessThan(s.opps[0]!.maxHp);
  });
  it("isTerminal null at start", () => {
    expect(isTerminal(initialState(3, S))).toBeNull();
  });
  it("eventually ends", () => {
    let s = initialState(4, S);
    for (let i = 0; i < 200 && s.phase !== "done"; i++) {
      if (s.phase === "fight") s = reducer(s, { type: "fight" });
      else s = reducer(s, { type: "next" });
    }
    expect(s.phase).toBe("done");
  });
  it("HP never negative", () => {
    let s = initialState(7, S);
    for (let i = 0; i < 20; i++) {
      if (s.phase === "fight") s = reducer(s, { type: "fight" });
      if (s.phase === "result") s = reducer(s, { type: "next" });
      if (s.phase === "done") break;
    }
    expect(s.myHp).toBeGreaterThanOrEqual(0);
    s.opps.forEach(o => expect(o.hp).toBeGreaterThanOrEqual(0));
  });
});
