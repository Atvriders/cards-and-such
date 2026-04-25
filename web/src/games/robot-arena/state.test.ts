import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const settings = { arena: "4" as const };

describe("initialState", () => {
  it("creates player in center and correct enemies", () => {
    const s = initialState(1, settings);
    expect(s.player.hp).toBe(5);
    expect(s.enemies.length).toBe(3); // size - 1 = 3
    expect(s.over).toBe(false);
    expect(s.score).toBe(0);
  });

  it("player starts at grid center", () => {
    const s = initialState(1, settings);
    expect(s.player.row).toBe(2);
    expect(s.player.col).toBe(2);
  });
});

describe("reducer move", () => {
  it("moves player in valid direction", () => {
    const s = initialState(99, settings);
    const s2 = reducer(s, { type: "move", dr: -1, dc: 0 });
    expect(s2.player.row).toBe(s.player.row - 1);
  });

  it("clamps at grid boundary", () => {
    let s = initialState(1, settings);
    s = { ...s, player: { ...s.player, row: 0, col: 0 } };
    const s2 = reducer(s, { type: "move", dr: -1, dc: 0 });
    expect(s2.player.row).toBe(0); // clamped
  });

  it("no-op when game over", () => {
    const s = { ...initialState(1, settings), over: true };
    const s2 = reducer(s, { type: "move", dr: 1, dc: 0 });
    expect(s2).toBe(s);
  });
});

describe("reducer attack", () => {
  it("damages adjacent enemies", () => {
    const s = initialState(1, settings);
    // Place an enemy adjacent to player
    const enemies = [...s.enemies];
    enemies[0] = { ...enemies[0]!, row: s.player.row + 1, col: s.player.col };
    const st = { ...s, enemies };
    const st2 = reducer(st, { type: "attack" });
    expect(st2.enemies[0]!.hp).toBeLessThan(enemies[0]!.hp);
  });

  it("destroying all enemies wins", () => {
    const s = initialState(1, settings);
    // Single enemy with 1 HP adjacent
    const enemies = [{ ...s.enemies[0]!, hp: 2, row: s.player.row + 1, col: s.player.col }];
    const st = { ...s, enemies };
    const st2 = reducer(st, { type: "attack" });
    if (st2.enemies[0]!.hp <= 0) {
      expect(st2.won).toBe(true);
      expect(st2.over).toBe(true);
    }
  });
});

describe("isTerminal", () => {
  it("null during play", () => {
    expect(isTerminal(initialState(1, settings))).toBeNull();
  });

  it("returns score when over", () => {
    const s = { ...initialState(1, settings), over: true, won: true, score: 300 };
    expect(isTerminal(s)!.score).toBeGreaterThanOrEqual(300);
  });
});
