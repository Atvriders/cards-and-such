import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, CROPS, TOTAL_TURNS } from "./state.js";

describe("Farm Tycoon", () => {
  it("initializes with correct defaults", () => {
    const s = initialState(42);
    expect(s.turn).toBe(1);
    expect(s.cash).toBe(100);
    expect(s.phase).toBe("plant");
    expect(s.fields.length).toBe(6);
    expect(s.fields.every(f => f === null)).toBe(true);
  });

  it("plantField deducts crop cost from cash", () => {
    const s = initialState(42);
    const s2 = reducer(s, { type: "plantField", fieldIndex: 0, crop: "wheat" });
    expect(s2.cash).toBe(s.cash - CROPS.wheat.cost);
    expect(s2.fields[0]).not.toBeNull();
    expect(s2.fields[0]?.type).toBe("wheat");
  });

  it("plantField does nothing if not enough cash", () => {
    const s = { ...initialState(42), cash: 1 };
    const s2 = reducer(s, { type: "plantField", fieldIndex: 0, crop: "tomato" });
    expect(s2.cash).toBe(1);
    expect(s2.fields[0]).toBeNull();
  });

  it("harvest advances crops and collects ready ones", () => {
    const s = initialState(42);
    const s2 = reducer(s, { type: "plantField", fieldIndex: 0, crop: "wheat" }); // wheat grows in 2
    const s3 = reducer(s2, { type: "harvest" }); // turn 1 harvest - wheat has 1 turn progress
    expect(s3.phase).toBe("results");
    // After 1 harvest wheat needs 1 more turn - field should still be occupied
    expect(s3.fields[0]).not.toBeNull();
    expect(s3.fields[0]?.turnsPlanted).toBe(1);
  });

  it("wheat is ready after 2 harvest advances", () => {
    let s = initialState(42);
    s = reducer(s, { type: "plantField", fieldIndex: 0, crop: "wheat" });
    s = reducer(s, { type: "harvest" }); // advance 1
    s = reducer(s, { type: "nextTurn" });
    const cashBefore = s.cash;
    s = reducer(s, { type: "harvest" }); // advance 2, wheat ready
    s = reducer(s, { type: "nextTurn" });
    // After 2nd harvest wheat field should be null (harvested)
    expect(s.fields[0]).toBeNull();
    expect(s.cash).toBeGreaterThan(cashBefore);
  });

  it("nextTurn advances turn and stays at plant phase", () => {
    const s = initialState(42);
    const s2 = reducer(s, { type: "harvest" });
    expect(s2.phase).toBe("results");
    const s3 = reducer(s2, { type: "nextTurn" });
    expect(s3.turn).toBe(2);
    expect(s3.phase).toBe("plant");
  });

  it("done phase after turn 50", () => {
    let s = initialState(42);
    for (let i = 0; i < TOTAL_TURNS; i++) {
      s = reducer(s, { type: "harvest" });
      s = reducer(s, { type: "nextTurn" });
    }
    expect(s.phase).toBe("done");
    expect(isTerminal(s)).not.toBeNull();
  });

  it("isTerminal returns null when not done", () => {
    const s = initialState(42);
    expect(isTerminal(s)).toBeNull();
  });

  it("score is proportional to cash", () => {
    const s = { ...initialState(42), phase: "done" as const, cash: 2000 };
    expect(isTerminal(s)?.score).toBe(100);
    const s2 = { ...initialState(42), phase: "done" as const, cash: 1000 };
    expect(isTerminal(s2)?.score).toBe(50);
  });
});
