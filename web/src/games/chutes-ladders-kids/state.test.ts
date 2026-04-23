import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, BOARD_SIZE, CHUTES_LADDERS } from "./state.js";

const s1 = { opponents: "1" as const };

describe("Chutes & Ladders Kids", () => {
  it("initializes with all players at 0 on 30-square board", () => {
    const s = initialState(42, s1);
    expect(s.numPlayers).toBe(2);
    expect(s.positions).toEqual([0, 0]);
    expect(s.winner).toBeNull();
    expect(BOARD_SIZE).toBe(30);
  });

  it("rolling advances player 0", () => {
    const s = initialState(42, s1);
    const next = reducer(s, { type: "roll" });
    expect(next.positions[0]).toBeGreaterThan(0);
    expect(next.die).toBeGreaterThanOrEqual(1);
    expect(next.die).toBeLessThanOrEqual(4);
  });

  it("positions never exceed 30", () => {
    let s = initialState(42, s1);
    for (let i = 0; i < 50; i++) {
      if (s.winner !== null) break;
      s = reducer(s, { type: "roll" });
      s.positions.forEach((p) => expect(p).toBeLessThanOrEqual(BOARD_SIZE));
    }
  });

  it("CHUTES_LADDERS has both chutes and ladders", () => {
    const chutes = CHUTES_LADDERS.filter((x) => x.type === "chute");
    const ladders = CHUTES_LADDERS.filter((x) => x.type === "ladder");
    expect(chutes.length).toBeGreaterThan(0);
    expect(ladders.length).toBeGreaterThan(0);
  });

  it("ladders go from lower to higher squares", () => {
    for (const cl of CHUTES_LADDERS.filter((x) => x.type === "ladder")) {
      expect(cl.to).toBeGreaterThan(cl.from);
    }
  });

  it("chutes go from higher to lower squares", () => {
    for (const cl of CHUTES_LADDERS.filter((x) => x.type === "chute")) {
      expect(cl.to).toBeLessThan(cl.from);
    }
  });

  it("winner detected when reaching square 30", () => {
    let s = initialState(42, s1);
    for (let i = 0; i < 200; i++) {
      if (s.winner !== null) break;
      s = reducer(s, { type: "roll" });
    }
    expect(s.winner).not.toBeNull();
  });

  it("isTerminal returns null during game", () => {
    const s = initialState(42, s1);
    expect(isTerminal(s)).toBeNull();
  });

  it("isTerminal returns 100 when player wins", () => {
    const s = initialState(42, s1);
    const won = { ...s, winner: 0 };
    expect(isTerminal(won)).toEqual({ score: 100 });
  });

  it("isTerminal returns 0 when bot wins", () => {
    const s = initialState(42, s1);
    const lost = { ...s, winner: 1 };
    expect(isTerminal(lost)).toEqual({ score: 0 });
  });
});
