import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, FINISH, SPECIAL_SPACES } from "./state.js";

const settings = { opponents: "1" as const };
const settings3 = { opponents: "3" as const };

describe("UncleWiggily initialState", () => {
  it("starts with all players at 0", () => {
    const s = initialState(1, settings);
    expect(s.positions).toEqual([0, 0]);
  });

  it("has correct numPlayers", () => {
    const s = initialState(1, settings3);
    expect(s.numPlayers).toBe(4);
  });

  it("starts with no winner", () => {
    const s = initialState(1, settings);
    expect(s.winner).toBeNull();
  });

  it("phase starts as drawing", () => {
    const s = initialState(1, settings);
    expect(s.phase).toBe("drawing");
  });
});

describe("UncleWiggily special spaces", () => {
  it("has at least 5 special spaces defined", () => {
    expect(SPECIAL_SPACES.length).toBeGreaterThanOrEqual(5);
  });

  it("no special space exceeds FINISH", () => {
    for (const sp of SPECIAL_SPACES) {
      expect(sp.space).toBeLessThan(FINISH);
    }
  });
});

describe("UncleWiggily reducer", () => {
  it("draw changes phase to result", () => {
    const s = initialState(42, settings);
    const s2 = reducer(s, { type: "draw" });
    expect(s2.phase).toBe("result");
    expect(s2.currentCard).not.toBeNull();
  });

  it("confirm after result changes phase back to drawing", () => {
    const s = initialState(42, { opponents: "1" as const });
    const s2 = reducer(s, { type: "draw" });
    if (s2.phase === "result") {
      const s3 = reducer(s2, { type: "confirm" });
      // Either back to drawing or bots advanced to player's turn
      expect(s3.phase).toBe("drawing");
    }
  });

  it("cannot draw when it is not player's turn", () => {
    const s = initialState(1, settings);
    const s2 = { ...s, turn: 1 };
    const s3 = reducer(s2, { type: "draw" });
    expect(s3).toBe(s2);
  });

  it("FINISH constant is 80", () => {
    expect(FINISH).toBe(80);
  });
});

describe("UncleWiggily isTerminal", () => {
  it("returns null when no winner", () => {
    const s = initialState(1, settings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score 100 when player 0 wins", () => {
    const s = initialState(1, settings);
    const won = { ...s, winner: 0 };
    expect(isTerminal(won)).toEqual({ score: 100 });
  });

  it("returns score 0 when bot wins", () => {
    const s = initialState(1, settings);
    const won = { ...s, winner: 1 };
    expect(isTerminal(won)).toEqual({ score: 0 });
  });
});
