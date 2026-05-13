import { describe, it, expect } from "vitest";
import {
  initialState,
  reducer,
  isTerminal,
  scoreSelection,
  hasScoringOption,
  bestPick,
  cpuShouldBank,
} from "./state.js";
import type { FarkleFullState, FarkleFullSettings, DieFace } from "./state.js";

const defaults: FarkleFullSettings = { target: "10000", cpuRisk: "balanced" };

describe("farkle-full scoreSelection", () => {
  it("scores a single 1 as 100 and single 5 as 50", () => {
    expect(scoreSelection([1])).toBe(100);
    expect(scoreSelection([5])).toBe(50);
  });

  it("rejects a lone non-scoring die", () => {
    expect(scoreSelection([2])).toBe(0);
    expect(scoreSelection([3])).toBe(0);
    expect(scoreSelection([4])).toBe(0);
    expect(scoreSelection([6])).toBe(0);
  });

  it("rejects mixed scoring + non-scoring", () => {
    expect(scoreSelection([1, 2])).toBe(0);
    expect(scoreSelection([5, 3])).toBe(0);
  });

  it("scores triples", () => {
    expect(scoreSelection([1, 1, 1])).toBe(1000);
    expect(scoreSelection([2, 2, 2])).toBe(200);
    expect(scoreSelection([3, 3, 3])).toBe(300);
    expect(scoreSelection([4, 4, 4])).toBe(400);
    expect(scoreSelection([5, 5, 5])).toBe(500);
    expect(scoreSelection([6, 6, 6])).toBe(600);
  });

  it("doubles for four, quadruples for five, x8 for six", () => {
    expect(scoreSelection([2, 2, 2, 2])).toBe(400);
    expect(scoreSelection([3, 3, 3, 3, 3])).toBe(1200);
    expect(scoreSelection([4, 4, 4, 4, 4, 4])).toBe(3200);
    expect(scoreSelection([1, 1, 1, 1])).toBe(2000);
    expect(scoreSelection([1, 1, 1, 1, 1])).toBe(4000);
    expect(scoreSelection([1, 1, 1, 1, 1, 1])).toBe(8000);
  });

  it("scores straight 1-6 as 1500", () => {
    expect(scoreSelection([1, 2, 3, 4, 5, 6])).toBe(1500);
    expect(scoreSelection([6, 4, 1, 5, 3, 2])).toBe(1500);
  });

  it("scores three pairs as 1500", () => {
    expect(scoreSelection([2, 2, 4, 4, 6, 6])).toBe(1500);
    expect(scoreSelection([1, 1, 3, 3, 5, 5])).toBe(1500);
  });

  it("scores two triplets as 2500", () => {
    expect(scoreSelection([2, 2, 2, 3, 3, 3])).toBe(2500);
    expect(scoreSelection([4, 4, 4, 6, 6, 6])).toBe(2500);
  });

  it("scores triple plus single 1/5 additively", () => {
    expect(scoreSelection([3, 3, 3, 1])).toBe(400);  // 300 + 100
    expect(scoreSelection([3, 3, 3, 5])).toBe(350);  // 300 + 50
    expect(scoreSelection([1, 1, 1, 5])).toBe(1050); // 1000 + 50
  });

  it("returns 0 for empty selection", () => {
    expect(scoreSelection([])).toBe(0);
  });
});

describe("farkle-full hasScoringOption", () => {
  it("true for any roll containing a 1 or 5", () => {
    expect(hasScoringOption([1, 2, 3, 4, 6, 6])).toBe(true);
    expect(hasScoringOption([5, 2, 3, 4, 6])).toBe(true);
  });
  it("true for triples", () => {
    expect(hasScoringOption([2, 2, 2, 3, 4, 6])).toBe(true);
    expect(hasScoringOption([6, 6, 6])).toBe(true);
  });
  it("false for pure non-scorers", () => {
    expect(hasScoringOption([2, 3, 4, 6])).toBe(false);
    expect(hasScoringOption([2, 2, 3, 4, 6, 6])).toBe(false);
  });
});

describe("farkle-full initialState", () => {
  it("is deterministic by seed", () => {
    const a = initialState(123, defaults);
    const b = initialState(123, defaults);
    expect(a).toEqual(b);
  });

  it("starts with both scores 0 and human turn", () => {
    const s = initialState(7, defaults);
    expect(s.scores).toEqual([0, 0]);
    expect(s.current).toBe(0);
    expect(s.diceRemaining).toBe(6);
    expect(s.phase).toBe("preRoll");
  });
});

describe("farkle-full isTerminal", () => {
  it("returns null for a fresh state", () => {
    expect(isTerminal(initialState(1, defaults))).toBeNull();
  });

  it("returns positive score when human wins", () => {
    const s: FarkleFullState = {
      ...initialState(1, defaults),
      phase: "gameOver",
      winner: 0,
      scores: [10000, 4200],
    };
    expect(isTerminal(s)).toEqual({ score: 10000 - 4200 });
  });

  it("returns 0 when CPU wins", () => {
    const s: FarkleFullState = {
      ...initialState(1, defaults),
      phase: "gameOver",
      winner: 1,
      scores: [3000, 10000],
    };
    expect(isTerminal(s)).toEqual({ score: 0 });
  });
});

describe("farkle-full reducer — illegal actions", () => {
  it("returns same state ref when banking with 0 turnScore", () => {
    const s = initialState(1, defaults);
    const s2 = reducer(s, { type: "bank" });
    expect(s2).toBe(s);
  });

  it("returns same state ref when rolling during 'rolled' phase via a non-roll action", () => {
    const s = initialState(1, defaults);
    // setAside while no roll is on the table — illegal
    const s2 = reducer(s, { type: "setAside" });
    expect(s2).toBe(s);
  });

  it("toggleSelect is a no-op outside human's rolled phase", () => {
    const s = initialState(1, defaults);
    const s2 = reducer(s, { type: "toggleSelect", index: 0 });
    expect(s2).toBe(s);
  });

  it("reducer ignores anything once gameOver", () => {
    const s: FarkleFullState = {
      ...initialState(1, defaults),
      phase: "gameOver",
      winner: 0,
    };
    const s2 = reducer(s, { type: "roll" });
    expect(s2).toBe(s);
  });
});

describe("farkle-full roll + setAside flow", () => {
  function findRolled(seed: number): FarkleFullState {
    for (let i = seed; i < seed + 200; i++) {
      const s = initialState(i, defaults);
      const s2 = reducer(s, { type: "roll" });
      if (s2.phase === "rolled") return s2;
    }
    throw new Error("no rolled state found");
  }

  it("transitions to 'rolled' or 'farkled' after roll", () => {
    const s = initialState(42, defaults);
    const s2 = reducer(s, { type: "roll" });
    expect(["rolled", "farkled"]).toContain(s2.phase);
    expect(s2.roll.length).toBe(6);
  });

  it("setAside adds to turn score and advances to preRoll", () => {
    const rolled = findRolled(50);
    const idx = rolled.roll.findIndex((v) => v === 1 || v === 5);
    if (idx === -1) return; // very rare
    const sel = reducer(rolled, { type: "toggleSelect", index: idx });
    expect(sel.selected).toEqual([idx]);
    const aside = reducer(sel, { type: "setAside" });
    expect(aside.turnScore).toBeGreaterThan(0);
    expect(aside.phase).toBe("preRoll");
    expect([5, 6]).toContain(aside.diceRemaining); // 5 left or hot dice
  });

  it("hot dice: all 6 set aside resets to 6 remaining", () => {
    const base = initialState(1, defaults);
    const synthetic: FarkleFullState = {
      ...base,
      phase: "rolled",
      diceRemaining: 1,
      roll: [1],
      setAside: [1, 1, 1, 1, 1] as DieFace[],
      turnScore: 500,
      selected: [0],
    };
    const after = reducer(synthetic, { type: "setAside" });
    expect(after.diceRemaining).toBe(6);
    expect(after.turnScore).toBe(600);
    expect(after.phase).toBe("preRoll");
  });

  it("rejects a set-aside selection of a lone non-scoring die", () => {
    const base = initialState(1, defaults);
    const synthetic: FarkleFullState = {
      ...base,
      phase: "rolled",
      roll: [2, 1, 3, 4, 6, 5],
      selected: [0], // the lone 2
    };
    const after = reducer(synthetic, { type: "setAside" });
    expect(after).toBe(synthetic);
  });
});

describe("farkle-full bank + game-over", () => {
  it("bank transfers turnScore and switches to CPU", () => {
    const base = initialState(1, defaults);
    const ready: FarkleFullState = {
      ...base,
      phase: "preRoll",
      turnScore: 350,
      diceRemaining: 4,
      setAside: [1, 5, 5, 5] as DieFace[],
    };
    const after = reducer(ready, { type: "bank" });
    expect(after.scores[0]).toBe(350);
    expect(after.current).toBe(1);
    expect(after.phase).toBe("cpuThinking");
    expect(after.turnScore).toBe(0);
    expect(after.diceRemaining).toBe(6);
  });

  it("bank that crosses target ends the game with human win", () => {
    const base = initialState(1, defaults);
    const ready: FarkleFullState = {
      ...base,
      phase: "preRoll",
      scores: [9700, 2000],
      turnScore: 500,
    };
    const after = reducer(ready, { type: "bank" });
    expect(after.phase).toBe("gameOver");
    expect(after.winner).toBe(0);
    expect(after.scores[0]).toBe(10200);
    const t = isTerminal(after);
    expect(t?.score).toBe(10200 - 2000);
  });
});

describe("farkle-full bestPick", () => {
  it("picks all 1s and 5s from a partial roll", () => {
    // 5-die roll (not eligible for the 6-die specials)
    const roll: DieFace[] = [1, 5, 2, 3, 4];
    const pick = bestPick(roll);
    expect([...pick.indices].sort()).toEqual([0, 1]);
    expect(pick.score).toBe(150);
  });

  it("picks all 6 for a straight", () => {
    const roll: DieFace[] = [1, 2, 3, 4, 5, 6];
    const pick = bestPick(roll);
    expect(pick.indices.length).toBe(6);
    expect(pick.score).toBe(1500);
  });

  it("picks all 6 for two triplets", () => {
    const roll: DieFace[] = [2, 2, 2, 3, 3, 3];
    const pick = bestPick(roll);
    expect(pick.score).toBe(2500);
  });
});

describe("farkle-full cpuShouldBank", () => {
  it("banks immediately when banking wins", () => {
    expect(cpuShouldBank(500, 5, 9700, 0, 10000, "cautious")).toBe(true);
  });

  it("pushes for tiny scores with many dice", () => {
    // Balanced CPU, turnScore=100, 4 dice left, not close to target
    expect(cpuShouldBank(100, 4, 1000, 1000, 10000, "balanced")).toBe(false);
  });

  it("cautious banks earlier than aggressive", () => {
    // turnScore=500, 3 dice left, no game pressure
    const cautious = cpuShouldBank(500, 3, 1000, 1000, 10000, "cautious");
    const aggressive = cpuShouldBank(500, 3, 1000, 1000, 10000, "aggressive");
    expect(cautious).toBe(true);
    expect(aggressive).toBe(false);
  });
});

describe("farkle-full play-through", () => {
  it("a simulated CPU turn eventually ends in either bank or farkle", () => {
    // Put CPU at start of its turn and step it until it hands back.
    const base = initialState(42, defaults);
    let s: FarkleFullState = {
      ...base,
      current: 1,
      phase: "cpuThinking",
    };
    let safety = 200;
    while (s.current === 1 && safety-- > 0 && s.phase !== "gameOver") {
      s = reducer(s, { type: "cpuStep" });
    }
    expect(safety).toBeGreaterThan(0);
    // Either the game ended, or the turn has handed off to the human.
    if (s.phase !== "gameOver") {
      expect(s.current).toBe(0);
    }
  });
});
