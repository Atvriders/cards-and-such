import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, rollRank, rollLabel, rollBeats, canonicalize, startNextRound } from "./state.js";
import type { MiaRoll } from "./state.js";

const defaultSettings = { startingLives: "3" as const };

describe("Mia rollRank", () => {
  it("Mia (2-1) is the highest rank", () => {
    const mia: MiaRoll = [2, 1];
    expect(rollRank(mia)).toBe(1000);
  });

  it("Doubles rank above normal rolls", () => {
    const double6: MiaRoll = [6, 6];
    const normal65: MiaRoll = [6, 5];
    expect(rollRank(double6)).toBeGreaterThan(rollRank(normal65));
  });

  it("Higher normal beats lower normal (65 > 64)", () => {
    expect(rollRank([6, 5])).toBeGreaterThan(rollRank([6, 4]));
  });

  it("rollBeats works correctly", () => {
    expect(rollBeats([6, 6], [6, 5])).toBe(true);
    expect(rollBeats([3, 1], [6, 5])).toBe(false);
  });
});

describe("Mia rollLabel", () => {
  it("labels Mia correctly", () => {
    expect(rollLabel([2, 1])).toBe("Mia!");
  });

  it("labels doubles correctly", () => {
    expect(rollLabel([4, 4])).toBe("Double 4s");
  });

  it("labels normal roll as hi-lo", () => {
    expect(rollLabel([5, 3])).toBe("5-3");
  });
});

describe("Mia canonicalize", () => {
  it("puts higher die first", () => {
    expect(canonicalize(3, 5)).toEqual([5, 3]);
    expect(canonicalize(6, 1)).toEqual([6, 1]);
  });

  it("Mia: canonicalize(1,2) = [2,1]", () => {
    expect(canonicalize(1, 2)).toEqual([2, 1]);
  });
});

describe("Mia initialState", () => {
  it("starts with full lives and playerRoll phase", () => {
    const s = initialState(42, defaultSettings);
    expect(s.playerLives).toBe(3);
    expect(s.botLives).toBe(3);
    expect(s.phase).toBe("playerRoll");
    expect(s.winner).toBeNull();
  });

  it("is deterministic under same seed", () => {
    expect(initialState(7, defaultSettings)).toEqual(initialState(7, defaultSettings));
  });
});

describe("Mia reducer: roll", () => {
  it("roll changes phase to playerDeclare and sets playerRoll", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "roll" });
    expect(s2.phase).toBe("playerDeclare");
    expect(s2.playerRoll).not.toBeNull();
    expect(s2.playerRoll!.length).toBe(2);
  });

  it("roll is deterministic under same seed", () => {
    const s = initialState(99, defaultSettings);
    expect(reducer(s, { type: "roll" }).playerRoll).toEqual(reducer(s, { type: "roll" }).playerRoll);
  });
});

describe("Mia reducer: declare + botDecide", () => {
  it("declare transitions to botDecision", () => {
    let s = initialState(42, defaultSettings);
    s = reducer(s, { type: "roll" });
    s = reducer(s, { type: "declare", claim: [6, 6] });
    expect(s.phase).toBe("botDecision");
    expect(s.playerClaim).toEqual([6, 6]);
  });

  it("botDecide resolves round and adjusts lives", () => {
    let s = initialState(42, defaultSettings);
    s = reducer(s, { type: "roll" });
    s = reducer(s, { type: "declare", claim: [2, 1] }); // claim Mia (very high — bot will challenge)
    s = reducer(s, { type: "botDecide" });
    expect(["reveal", "gameOver"]).toContain(s.phase);
    // Someone should have lost a life
    const totalLost = (3 - s.playerLives) + (3 - s.botLives);
    expect(totalLost).toBeGreaterThanOrEqual(1);
  });
});

describe("Mia startNextRound", () => {
  it("resets phase back to playerRoll", () => {
    let s = initialState(42, defaultSettings);
    s = reducer(s, { type: "roll" });
    s = reducer(s, { type: "declare", claim: [3, 1] });
    s = reducer(s, { type: "botDecide" });
    if (s.phase === "reveal") {
      const s2 = startNextRound(s);
      expect(s2.phase).toBe("playerRoll");
      expect(s2.playerRoll).toBeNull();
      expect(s2.round).toBe(2);
    }
  });
});

describe("Mia isTerminal", () => {
  it("returns null when game is not over", () => {
    expect(isTerminal(initialState(42, defaultSettings))).toBeNull();
  });

  it("returns score when winner is set", () => {
    const s = { ...initialState(42, defaultSettings), winner: "player" as const, botLives: 0 };
    const result = isTerminal(s);
    expect(result).not.toBeNull();
    expect(result!.score).toBeGreaterThan(0);
  });
});
