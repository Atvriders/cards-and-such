import { describe, expect, it } from "vitest";
import {
  rollDice,
  rerollUnkept,
  toggleKeep,
  faceCounts,
  scoreOfAKindUpper,
  scoreNOfAKind,
  scoreFullHouse,
  scoreSmallStraight,
  scoreLargeStraight,
  scoreYahtzee,
  scoreChance,
  scoreFarkleSelection,
  hasFarkleScoringOption,
} from "./index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

describe("dice", () => {
  it("rollDice is deterministic under seed", () => {
    const a = rollDice(5, mulberry32(1));
    const b = rollDice(5, mulberry32(1));
    expect(a.map((d) => d.value)).toEqual(b.map((d) => d.value));
  });

  it("rerollUnkept keeps kept dice", () => {
    const dice = [{ value: 1, kept: true }, { value: 2, kept: false }] as const;
    const after = rerollUnkept(dice, mulberry32(3));
    expect(after[0]).toEqual({ value: 1, kept: true });
  });

  it("toggleKeep flips at index", () => {
    const dice = [{ value: 1 as const, kept: false }, { value: 2 as const, kept: false }];
    const after = toggleKeep(dice, 0);
    expect(after[0]!.kept).toBe(true);
    expect(after[1]!.kept).toBe(false);
  });

  it("faceCounts", () => {
    const c = faceCounts([{value:3,kept:false},{value:3,kept:false},{value:5,kept:false}]);
    expect(c[3]).toBe(2);
    expect(c[5]).toBe(1);
  });

  it("upper scoring", () => {
    const dice = [1,1,3,5,5].map((v) => ({ value: v as any, kept: false }));
    expect(scoreOfAKindUpper(dice, 1 as any)).toBe(2);
    expect(scoreOfAKindUpper(dice, 5 as any)).toBe(10);
  });

  it("three of a kind", () => {
    const dice = [4,4,4,2,3].map((v) => ({ value: v as any, kept: false }));
    expect(scoreNOfAKind(dice, 3)).toBe(17);
    const none = [1,2,3,4,5].map((v) => ({ value: v as any, kept: false }));
    expect(scoreNOfAKind(none, 3)).toBe(0);
  });

  it("full house", () => {
    expect(scoreFullHouse([2,2,2,5,5].map((v) => ({value:v as any, kept:false})))).toBe(25);
    expect(scoreFullHouse([2,2,2,5,6].map((v) => ({value:v as any, kept:false})))).toBe(0);
  });

  it("straights", () => {
    expect(scoreSmallStraight([1,2,3,4,6].map((v) => ({value:v as any, kept:false})))).toBe(30);
    expect(scoreLargeStraight([1,2,3,4,5].map((v) => ({value:v as any, kept:false})))).toBe(40);
  });

  it("yahtzee", () => {
    expect(scoreYahtzee([5,5,5,5,5].map((v) => ({value:v as any, kept:false})))).toBe(50);
    expect(scoreYahtzee([5,5,5,5,1].map((v) => ({value:v as any, kept:false})))).toBe(0);
  });

  it("chance", () => {
    expect(scoreChance([1,2,3,4,5].map((v) => ({value:v as any, kept:false})))).toBe(15);
  });
});

describe("farkle scoring", () => {
  it("single 1 = 100, single 5 = 50, others = 0", () => {
    expect(scoreFarkleSelection([1])).toBe(100);
    expect(scoreFarkleSelection([5])).toBe(50);
    expect(scoreFarkleSelection([2])).toBe(0);
  });
  it("three 1s = 1000, three 2s = 200, three 6s = 600", () => {
    expect(scoreFarkleSelection([1,1,1])).toBe(1000);
    expect(scoreFarkleSelection([2,2,2])).toBe(200);
    expect(scoreFarkleSelection([6,6,6])).toBe(600);
  });
  it("four/five/six of a kind doubles", () => {
    expect(scoreFarkleSelection([2,2,2,2])).toBe(400);
    expect(scoreFarkleSelection([3,3,3,3,3])).toBe(1200);
    expect(scoreFarkleSelection([4,4,4,4,4,4])).toBe(3200);
  });
  it("straight 1-6 = 1500", () => {
    expect(scoreFarkleSelection([1,2,3,4,5,6])).toBe(1500);
  });
  it("mixed scoring + non-scoring returns 0", () => {
    expect(scoreFarkleSelection([1,2])).toBe(0);
    expect(scoreFarkleSelection([5,3])).toBe(0);
  });
  it("hasFarkleScoringOption", () => {
    expect(hasFarkleScoringOption([{value:2,kept:false},{value:3,kept:false},{value:4,kept:false}])).toBe(false);
    expect(hasFarkleScoringOption([{value:2,kept:false},{value:3,kept:false},{value:5,kept:false}])).toBe(true);
    expect(hasFarkleScoringOption([{value:3,kept:false},{value:3,kept:false},{value:3,kept:false}])).toBe(true);
  });
});
