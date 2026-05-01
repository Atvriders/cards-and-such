import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const S = { difficulty: "hard" as const };

describe("oklahoma-gin-r", () => {
  it("starts in player-draw phase", () => {
    expect(initialState(1, S).phase).toBe("player-draw");
  });
  it("deals correct hand sizes", () => {
    const s = initialState(1, S);
    expect(s.playerHand.length).toBe(10);
    expect(s.botHand.length).toBe(10);
  });
  it("draw from stock advances to discard phase", () => {
    const s = reducer(initialState(7, S), { type: "draw", from: "stock" });
    expect(s.phase).toBe("player-discard");
    expect(s.playerHand.length).toBe(10 + 1);
  });
  it("isTerminal is null at start", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });
  it("plays a sequence without crashing", () => {
    let s = initialState(11, S);
    for (let i = 0; i < 30 && s.phase !== "done"; i++) {
      if (s.phase === "player-draw") {
        s = reducer(s, { type: "draw", from: "stock" });
      } else if (s.phase === "player-discard") {
        s = reducer(s, { type: "discard", cardId: s.playerHand[0]!.id });
      } else break;
    }
    expect(["player-draw", "player-discard", "done"].includes(s.phase)).toBe(true);
  });
});
