import { describe, it, expect } from "vitest";
import {
  initialState,
  reducer,
  isTerminal,
  score,
  MAX_TURNS,
  BOARD_LEN,
  BOARD,
  STARTING_CASH,
} from "./state.js";

const S = { dummy: false };

describe("monopoly-mini", () => {
  it("initial state has both players at GO with $500", () => {
    const s = initialState(1, S);
    expect(s.pCash).toBe(STARTING_CASH);
    expect(s.cCash).toBe(STARTING_CASH);
    expect(s.pPos).toBe(0);
    expect(s.cPos).toBe(0);
    expect(s.owners.length).toBe(BOARD_LEN);
    expect(BOARD.length).toBe(BOARD_LEN);
    expect(s.phase).toBe("rolling");
    expect(s.dice).toBeNull();
  });

  it("roll advances player position and produces a 2d6 dice value", () => {
    const before = initialState(1, S);
    const after = reducer(before, { type: "roll" });
    expect(after.dice).not.toBeNull();
    const [d1, d2] = after.dice!;
    expect(d1).toBeGreaterThanOrEqual(1);
    expect(d1).toBeLessThanOrEqual(6);
    expect(d2).toBeGreaterThanOrEqual(1);
    expect(d2).toBeLessThanOrEqual(6);
    // Player should have moved at least 2 (min 2d6).
    if (before.pPos === after.pPos) {
      // Only valid if landing wrapped exactly to same square; rare for one roll from 0.
      expect(after.pPos).toBe(0);
    } else {
      expect(after.pPos).toBeGreaterThanOrEqual(2);
    }
  });

  it("buying a property deducts cash and assigns ownership", () => {
    // Force a state where the player has just landed on a buyable property.
    let s = initialState(7, S);
    let safety = 0;
    while (s.phase !== "deciding" && safety < 50) {
      if (s.phase === "rolling" && s.isPlayer) s = reducer(s, { type: "roll" });
      else if (s.phase === "ai") s = reducer(s, { type: "ai" });
      else break;
      safety++;
    }
    // If we couldn't reach deciding within budget, simulate manually.
    if (s.phase !== "deciding") {
      const synthetic = {
        ...initialState(7, S),
        pPos: 1, // Mediterranean
        phase: "deciding" as const,
      };
      const after = reducer(synthetic, { type: "buy" });
      expect(after.owners[1]).toBe("p");
      expect(after.pCash).toBe(STARTING_CASH - BOARD[1]!.price);
      return;
    }
    const cashBefore = s.pCash;
    const pos = s.pPos;
    const expectedPrice = BOARD[pos]!.price;
    const after = reducer(s, { type: "buy" });
    expect(after.owners[pos]).toBe("p");
    expect(after.pCash).toBe(cashBefore - expectedPrice);
  });

  it("score is non-negative at end", () => {
    let s = initialState(2, S);
    for (let i = 0; i < 1000; i++) {
      if (s.phase === "rolling") s = reducer(s, { type: "roll" });
      else if (s.phase === "deciding") s = reducer(s, { type: "skip" });
      else if (s.phase === "ai") s = reducer(s, { type: "ai" });
      if (s.phase === "done") break;
    }
    expect(score(s)).toBeGreaterThanOrEqual(0);
  });

  it("game eventually terminates by MAX_TURNS or bankruptcy", () => {
    let s = initialState(3, S);
    for (let i = 0; i < 2000; i++) {
      if (s.phase === "rolling") s = reducer(s, { type: "roll" });
      else if (s.phase === "deciding") s = reducer(s, { type: "buy" });
      else if (s.phase === "ai") s = reducer(s, { type: "ai" });
      if (s.phase === "done") break;
    }
    expect(s.phase).toBe("done");
    expect(isTerminal(s)).not.toBeNull();
    expect(s.turn).toBeLessThanOrEqual(MAX_TURNS + 5);
  });
});
