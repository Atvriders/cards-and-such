import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, evaluateHand, compareHands, handScore, HAND_LABELS } from "./state.js";
import type { PokerDie } from "./state.js";

const defaultSettings = { winScore: "3" as const };

function makeDice(values: number[]): PokerDie[] {
  return values.map((v) => ({ value: v as PokerDie["value"], kept: false }));
}

describe("evaluateHand", () => {
  it("detects Five of a Kind", () => {
    expect(evaluateHand(makeDice([14, 14, 14, 14, 14]))).toBe("fiveOfAKind");
  });

  it("detects Four of a Kind", () => {
    expect(evaluateHand(makeDice([13, 13, 13, 13, 9]))).toBe("fourOfAKind");
  });

  it("detects Full House", () => {
    expect(evaluateHand(makeDice([10, 10, 10, 12, 12]))).toBe("fullHouse");
  });

  it("detects Straight (9-10-J-Q-K)", () => {
    expect(evaluateHand(makeDice([9, 10, 11, 12, 13]))).toBe("straight");
  });

  it("detects Straight (10-J-Q-K-A)", () => {
    expect(evaluateHand(makeDice([10, 11, 12, 13, 14]))).toBe("straight");
  });

  it("detects Three of a Kind", () => {
    expect(evaluateHand(makeDice([11, 11, 11, 9, 13]))).toBe("threeOfAKind");
  });

  it("detects Two Pair", () => {
    expect(evaluateHand(makeDice([9, 9, 12, 12, 14]))).toBe("twoPair");
  });

  it("detects One Pair", () => {
    expect(evaluateHand(makeDice([9, 9, 10, 12, 14]))).toBe("onePair");
  });

  it("detects High Card", () => {
    expect(evaluateHand(makeDice([9, 10, 12, 13, 14]))).toBe("highCard");
  });
});

describe("compareHands", () => {
  it("Five of a Kind beats Four of a Kind", () => {
    const a = makeDice([14, 14, 14, 14, 14]);
    const b = makeDice([13, 13, 13, 13, 9]);
    expect(compareHands(a, b)).toBeGreaterThan(0);
  });

  it("Full House beats Straight", () => {
    const fh = makeDice([10, 10, 10, 12, 12]);
    const str = makeDice([9, 10, 11, 12, 13]);
    expect(compareHands(fh, str)).toBeGreaterThan(0);
  });

  it("equal hands: higher sum wins", () => {
    const a = makeDice([14, 14, 10, 12, 9]); // pair of A
    const b = makeDice([9, 9, 10, 12, 14]);  // pair of 9
    expect(compareHands(a, b)).toBeGreaterThan(0);
  });
});

describe("handScore", () => {
  it("higher hands have higher scores", () => {
    expect(handScore("fiveOfAKind")).toBeGreaterThan(handScore("fourOfAKind"));
    expect(handScore("fourOfAKind")).toBeGreaterThan(handScore("fullHouse"));
    expect(handScore("highCard")).toBe(1);
  });

  it("all labels exist", () => {
    const ranks = Object.keys(HAND_LABELS);
    expect(ranks.length).toBe(8);
  });
});

describe("DicePoker reducer", () => {
  it("roll fills dice and sets playerReroll phase", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "roll" });
    expect(s2.playerDice.every((d) => [9,10,11,12,13,14].includes(d.value))).toBe(true);
    expect(s2.playerRollsUsed).toBe(1);
    expect(["playerReroll", "botTurn"]).toContain(s2.phase); // botTurn only if 3 rolls auto
    expect(s2.phase).toBe("playerReroll");
  });

  it("bank triggers bot and goes to result", () => {
    let s = initialState(42, defaultSettings);
    s = reducer(s, { type: "roll" });
    s = reducer(s, { type: "bank" });
    expect(["result", "gameOver"]).toContain(s.phase);
    expect(s.botHand).not.toBeNull();
  });

  it("toggleKeep toggles kept status", () => {
    let s = initialState(42, defaultSettings);
    s = reducer(s, { type: "roll" });
    const before = s.playerDice[0]!.kept;
    s = reducer(s, { type: "toggleKeep", index: 0 });
    expect(s.playerDice[0]!.kept).toBe(!before);
  });

  it("nextRound resets dice after result", () => {
    let s = initialState(1, defaultSettings);
    s = reducer(s, { type: "roll" });
    s = reducer(s, { type: "bank" });
    if (s.phase === "result") {
      const s2 = reducer(s, { type: "nextRound" });
      expect(s2.phase).toBe("playerRoll");
      expect(s2.playerRollsUsed).toBe(0);
      expect(s2.round).toBe(2);
    }
  });

  it("is deterministic under same seed", () => {
    const s = initialState(99, defaultSettings);
    const a = reducer(s, { type: "roll" });
    const b = reducer(s, { type: "roll" });
    expect(a.playerDice.map((d) => d.value)).toEqual(b.playerDice.map((d) => d.value));
  });
});

describe("DicePoker isTerminal", () => {
  it("null mid-game", () => {
    expect(isTerminal(initialState(42, defaultSettings))).toBeNull();
  });

  it("returns score when winner set", () => {
    const s = { ...initialState(42, defaultSettings), winner: "player" as const, playerScore: 3 };
    const result = isTerminal(s);
    expect(result).not.toBeNull();
    expect(result!.score).toBeGreaterThan(0);
  });
});
