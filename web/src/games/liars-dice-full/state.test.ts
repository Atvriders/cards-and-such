import { describe, it, expect } from "vitest";
import {
  initialState,
  reducer,
  isTerminal,
  __test,
} from "./state.js";
import type {
  LiarsDiceFullState,
  LiarsDiceFullSettings,
  DieFace,
} from "./state.js";

const defaultSettings: LiarsDiceFullSettings = {
  startingDice: "5",
  botDifficulty: "normal",
};

describe("liars-dice-full initialState", () => {
  it("deterministic by seed", () => {
    const a = initialState(1234, defaultSettings);
    const b = initialState(1234, defaultSettings);
    expect(a.diceBySeat).toEqual(b.diceBySeat);
    expect(a.turn).toBe(b.turn);
    expect(a.round).toBe(1);
  });

  it("4 seats each with 5 dice", () => {
    const s = initialState(99, defaultSettings);
    expect(s.diceBySeat.length).toBe(4);
    for (const arr of s.diceBySeat) expect(arr.length).toBe(5);
  });

  it("respects starting dice setting (3)", () => {
    const s = initialState(7, { startingDice: "3", botDifficulty: "normal" });
    for (const arr of s.diceBySeat) expect(arr.length).toBe(3);
  });

  it("all dice values are 1..6", () => {
    const s = initialState(42, defaultSettings);
    for (const arr of s.diceBySeat) {
      for (const d of arr) {
        expect(d).toBeGreaterThanOrEqual(1);
        expect(d).toBeLessThanOrEqual(6);
      }
    }
  });

  it("isTerminal null at start", () => {
    const s = initialState(2, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("opening turn is seat 1 (left of dealer 0)", () => {
    const s = initialState(2, defaultSettings);
    expect(s.turn).toBe(1);
  });
});

describe("countFaceWithWilds", () => {
  it("counts ones as wildcards for non-1 faces", () => {
    const c = __test.countFaceWithWilds([1, 1, 3, 4, 5] as DieFace[], 3);
    expect(c).toBe(3); // 2 wilds + one literal 3
  });
  it("does not wild on face=1", () => {
    const c = __test.countFaceWithWilds([1, 1, 3, 4, 5] as DieFace[], 1);
    expect(c).toBe(2);
  });
});

describe("liars-dice-full reducer — human bids", () => {
  function withTurn(s: LiarsDiceFullState, turn: number): LiarsDiceFullState {
    return { ...s, turn };
  }

  it("rejects human bid when not their turn", () => {
    const s = initialState(1, defaultSettings); // turn = 1
    const after = reducer(s, { type: "bid", count: 1, face: 2 });
    expect(after).toBe(s);
  });

  it("accepts initial bid from human and advances turn", () => {
    const s = withTurn(initialState(5, defaultSettings), 0);
    const after = reducer(s, { type: "bid", count: 2, face: 3 });
    expect(after).not.toBe(s);
    expect(after.currentBid).toEqual({ count: 2, face: 3, by: 0 });
    expect(after.turn).toBe(1);
  });

  it("rejects non-strict raise", () => {
    const s0 = withTurn(initialState(5, defaultSettings), 0);
    const s: LiarsDiceFullState = {
      ...s0,
      currentBid: { count: 4, face: 3, by: 3 },
    };
    // same bid — invalid
    const a = reducer(s, { type: "bid", count: 4, face: 3 });
    expect(a).toBe(s);
    // lower face same count — invalid
    const b = reducer(s, { type: "bid", count: 4, face: 2 });
    expect(b).toBe(s);
    // lower count — invalid
    const c = reducer(s, { type: "bid", count: 3, face: 6 });
    expect(c).toBe(s);
  });

  it("accepts higher count or same count + higher face", () => {
    const s0 = withTurn(initialState(5, defaultSettings), 0);
    const s: LiarsDiceFullState = {
      ...s0,
      currentBid: { count: 4, face: 3, by: 3 },
    };
    expect(reducer(s, { type: "bid", count: 5, face: 3 })).not.toBe(s);
    expect(reducer(s, { type: "bid", count: 4, face: 4 })).not.toBe(s);
  });
});

describe("liars-dice-full reducer — calls", () => {
  it("rejects call with no bid", () => {
    const s = { ...initialState(11, defaultSettings), turn: 0 };
    const after = reducer(s, { type: "call" });
    expect(after).toBe(s);
  });

  it("caller wins (bidder loses die) on impossible bid", () => {
    const s0 = initialState(11, defaultSettings);
    const s: LiarsDiceFullState = {
      ...s0,
      turn: 0,
      currentBid: { count: 99, face: 6, by: 1 },
    };
    const after = reducer(s, { type: "call" });
    expect(after.lastReveal).not.toBeNull();
    expect(after.lastReveal!.loser).toBe(1);
    expect(after.diceBySeat[1]!.length).toBe(s.diceBySeat[1]!.length - 1);
  });

  it("bidder wins (caller loses die) when bid is honest", () => {
    const s0 = initialState(11, defaultSettings);
    // craft a definite-honest bid: 1 × 1s (ones in any hand satisfy it)
    const s: LiarsDiceFullState = {
      ...s0,
      turn: 0,
      diceBySeat: [
        [1, 2, 3, 4, 5],
        [6, 6, 6, 6, 6],
        [6, 6, 6, 6, 6],
        [6, 6, 6, 6, 6],
      ] as DieFace[][],
      currentBid: { count: 1, face: 1, by: 1 }, // there IS one 1 in seat 0
    };
    const after = reducer(s, { type: "call" });
    expect(after.lastReveal!.loser).toBe(0); // caller loses
    expect(after.diceBySeat[0]!.length).toBe(4);
  });

  it("eliminates a seat that drops to 0 dice", () => {
    const base = initialState(3, defaultSettings);
    const s: LiarsDiceFullState = {
      ...base,
      turn: 0,
      diceBySeat: [
        [4, 4, 4, 4, 4],
        [3], // seat 1 has 1 die
        [4, 4, 4, 4, 4],
        [4, 4, 4, 4, 4],
      ] as DieFace[][],
      currentBid: { count: 30, face: 6, by: 1 }, // impossible
    };
    const after = reducer(s, { type: "call" });
    expect(after.diceBySeat[1]!.length).toBe(0);
    expect(after.lastReveal!.eliminated).toBe(true);
  });

  it("declares winner when only one seat has dice", () => {
    const base = initialState(3, defaultSettings);
    const s: LiarsDiceFullState = {
      ...base,
      turn: 0,
      diceBySeat: [
        [4, 4],
        [3],
        [],
        [],
      ] as DieFace[][],
      currentBid: { count: 30, face: 6, by: 1 }, // impossible — seat 1 loses last die
    };
    const after = reducer(s, { type: "call" });
    expect(after.winner).toBe(0);
    const t = isTerminal(after);
    expect(t).not.toBeNull();
    // 200 + 2*60 = 320
    expect(t!.score).toBe(320);
  });
});

describe("liars-dice-full botTick", () => {
  it("makes a bot act on its turn", () => {
    const s = initialState(123, defaultSettings); // turn = 1
    const after = reducer(s, { type: "botTick" });
    // Either a bid was placed or a call happened (no current bid → must bid)
    expect(after).not.toBe(s);
    expect(after.currentBid !== null || after.lastReveal !== null).toBe(true);
  });

  it("ignores botTick when it's the human's turn", () => {
    const s = { ...initialState(1, defaultSettings), turn: 0 };
    const after = reducer(s, { type: "botTick" });
    expect(after).toBe(s);
  });

  it("ignores actions once a winner is set", () => {
    const s = { ...initialState(1, defaultSettings), winner: 2 };
    const after = reducer(s, { type: "bid", count: 1, face: 2 });
    expect(after).toBe(s);
    const after2 = reducer(s, { type: "botTick" });
    expect(after2).toBe(s);
  });
});

describe("liars-dice-full isTerminal", () => {
  it("null when ongoing", () => {
    const s = initialState(1, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });
  it("score on human win = 200 + 60*remaining", () => {
    const s = { ...initialState(1, defaultSettings), winner: 0 };
    const t = isTerminal(s);
    expect(t!.score).toBe(200 + 5 * 60);
  });
  it("score 0 when bot wins", () => {
    const s = { ...initialState(1, defaultSettings), winner: 2 };
    expect(isTerminal(s)!.score).toBe(0);
  });
});
