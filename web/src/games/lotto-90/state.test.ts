import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, getLineIndices, isLineBingo, isFullHouse } from "./state.js";

const settings = { speed: "normal" as const };

describe("Lotto90 initialState", () => {
  it("card has 25 unique numbers from 1-90", () => {
    const s = initialState(1, settings);
    expect(s.card.length).toBe(25);
    const uniq = new Set(s.card);
    expect(uniq.size).toBe(25);
    for (const n of s.card) {
      expect(n).toBeGreaterThanOrEqual(1);
      expect(n).toBeLessThanOrEqual(90);
    }
  });

  it("bag has 90 numbers", () => {
    const s = initialState(1, settings);
    expect(s.bag.length).toBe(90);
  });

  it("starts not marked", () => {
    const s = initialState(1, settings);
    expect(s.marked.every((m) => !m)).toBe(true);
  });

  it("phase starts as playing", () => {
    const s = initialState(1, settings);
    expect(s.phase).toBe("playing");
  });
});

describe("Lotto90 getLineIndices", () => {
  it("row 0 is indices 0-4", () => {
    expect(getLineIndices(0)).toEqual([0,1,2,3,4]);
  });

  it("col 0 is indices 0,5,10,15,20", () => {
    expect(getLineIndices(5)).toEqual([0,5,10,15,20]);
  });

  it("diagonal top-left to bottom-right is 0,6,12,18,24", () => {
    expect(getLineIndices(10)).toEqual([0,6,12,18,24]);
  });

  it("returns 5 indices for each line", () => {
    for (let i = 0; i < 12; i++) {
      expect(getLineIndices(i).length).toBe(5);
    }
  });
});

describe("Lotto90 reducer", () => {
  it("draw removes a number from the bag", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "draw" });
    expect(s2.bag.length).toBe(89);
    expect(s2.drawn.length).toBe(1);
  });

  it("draw marks the number if it is on the card", () => {
    const s = initialState(1, settings);
    // Force a draw of a number that IS on the card
    const cardNum = s.card[0]!;
    // Rearrange bag to put cardNum first
    const newBag = [cardNum, ...s.bag.filter((n) => n !== cardNum)];
    const s2 = reducer({ ...s, bag: newBag }, { type: "draw" });
    expect(s2.lastDrawn).toBe(cardNum);
    expect(s2.marked[0]).toBe(true);
  });

  it("claim_line awards 50 points when line is complete", () => {
    const s = initialState(1, settings);
    const marked = new Array(25).fill(false) as boolean[];
    getLineIndices(0).forEach((i) => { marked[i] = true; });
    const s2 = { ...s, marked };
    const s3 = reducer(s2, { type: "claim_line", lineIndex: 0 });
    expect(s3.score).toBe(50);
    expect(s3.claimedLines[0]).toBe(true);
  });

  it("cannot claim line twice", () => {
    const s = initialState(1, settings);
    const marked = new Array(25).fill(false) as boolean[];
    getLineIndices(0).forEach((i) => { marked[i] = true; });
    const claimedLines = new Array(12).fill(false) as boolean[];
    claimedLines[0] = true;
    const s2 = { ...s, marked, claimedLines, score: 50 };
    const s3 = reducer(s2, { type: "claim_line", lineIndex: 0 });
    expect(s3.score).toBe(50); // unchanged
  });
});

describe("Lotto90 isTerminal", () => {
  it("returns null while playing", () => {
    const s = initialState(1, settings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score when done", () => {
    const s = initialState(1, settings);
    const done = { ...s, phase: "done" as const, score: 150 };
    expect(isTerminal(done)).toEqual({ score: 150 });
  });

  it("full house adds 200 to score", () => {
    const s = initialState(1, settings);
    const done = { ...s, phase: "done" as const, score: 100, fullHouse: true };
    expect(isTerminal(done)).toEqual({ score: 300 });
  });

  it("isFullHouse returns true only when all marked", () => {
    expect(isFullHouse(new Array(25).fill(true))).toBe(true);
    expect(isFullHouse(new Array(25).fill(false))).toBe(false);
  });
});
