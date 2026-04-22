import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, FINISH } from "./state.js";
import type { RatRaceState } from "./state.js";

const s1 = { opponents: "1" as const };

describe("Rat Race", () => {
  it("initializes with players at 0 and shuffled deck", () => {
    const s = initialState(42, s1);
    expect(s.numPlayers).toBe(2);
    expect(s.positions).toEqual([0, 0]);
    expect(s.deck.length).toBeGreaterThan(0);
    expect(s.phase).toBe("drawing");
    expect(s.winner).toBeNull();
  });

  it("drawing a card applies a move-forward effect", () => {
    const base = initialState(42, s1);
    // Force a known card by overriding deck
    const s: RatRaceState = {
      ...base,
      deck: [{ kind: "move", value: 5 }],
    };
    const next = reducer(s, { type: "draw" });
    // Player 0 moved forward 5
    expect(next.positions[0]).toBe(5);
    expect(next.currentCard).toEqual({ kind: "move", value: 5 });
    expect(next.phase).toBe("result");
  });

  it("back card moves player backward", () => {
    const base = initialState(42, s1);
    const s: RatRaceState = {
      ...base,
      positions: [20, 0],
      deck: [{ kind: "back", value: 3 }],
    };
    const next = reducer(s, { type: "draw" });
    expect(next.positions[0]).toBe(17);
  });

  it("skip card sets skipNext flag", () => {
    const base = initialState(42, s1);
    const s: RatRaceState = {
      ...base,
      deck: [{ kind: "skip" }],
    };
    const next = reducer(s, { type: "draw" });
    expect(next.skipNext[0]).toBe(true);
  });

  it("extra turn card sets extraTurn flag", () => {
    const base = initialState(42, s1);
    const s: RatRaceState = {
      ...base,
      deck: [{ kind: "extra" }],
    };
    const next = reducer(s, { type: "draw" });
    expect(next.extraTurn).toBe(true);
  });

  it("confirm after extra turn keeps player 0's turn", () => {
    const base = initialState(42, s1);
    const s: RatRaceState = {
      ...base,
      deck: [{ kind: "extra" }],
    };
    const afterDraw = reducer(s, { type: "draw" });
    const afterConfirm = reducer(afterDraw, { type: "confirm" });
    expect(afterConfirm.turn).toBe(0);
    expect(afterConfirm.phase).toBe("drawing");
  });

  it("win detected when reaching FINISH", () => {
    const base = initialState(42, s1);
    const s: RatRaceState = {
      ...base,
      positions: [75, 0],
      deck: [{ kind: "move", value: 5 }],
    };
    const next = reducer(s, { type: "draw" });
    expect(next.positions[0]).toBe(FINISH);
    expect(next.winner).toBe(0);
  });

  it("teleport card moves to specified square", () => {
    const base = initialState(42, s1);
    const s: RatRaceState = {
      ...base,
      positions: [10, 0],
      deck: [{ kind: "teleport", to: 50 }],
    };
    const next = reducer(s, { type: "draw" });
    expect(next.positions[0]).toBe(50);
  });

  it("isTerminal returns correct scores", () => {
    const s = initialState(42, s1);
    expect(isTerminal(s)).toBeNull();
    expect(isTerminal({ ...s, winner: 0 })).toEqual({ score: 100 });
    expect(isTerminal({ ...s, winner: 1 })).toEqual({ score: 0 });
  });
});
