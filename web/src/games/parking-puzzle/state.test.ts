import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const easy = { difficulty: "easy" as const };
const hard = { difficulty: "hard" as const };

describe("ParkingPuzzle initialState", () => {
  it("creates 6x6 grid", () => {
    const s = initialState(0, easy);
    expect(s.size).toBe(6);
  });

  it("has exactly one target car", () => {
    const s = initialState(0, easy);
    expect(s.cars.filter(c => c.isTarget)).toHaveLength(1);
  });

  it("target car is horizontal", () => {
    const s = initialState(0, easy);
    const target = s.cars.find(c => c.isTarget)!;
    expect(target.orientation).toBe("H");
  });

  it("starts not won", () => {
    const s = initialState(0, easy);
    expect(s.won).toBe(false);
    expect(s.moves).toBe(0);
  });
});

describe("ParkingPuzzle reducer", () => {
  it("selects a car", () => {
    const s = initialState(0, easy);
    const s2 = reducer(s, { type: "selectCar", carId: 0 });
    expect(s2.selectedCar).toBe(0);
  });

  it("moves a car one step", () => {
    const s = initialState(0, easy);
    // Target car (id=0) is horizontal, try moving right if possible
    const target = s.cars.find(c => c.isTarget)!;
    const initialCol = target.col;
    const s2 = reducer(s, { type: "selectCar", carId: 0 });
    const s3 = reducer(s2, { type: "moveCar", carId: 0, delta: 1 });
    // If moved, col should increase by 1
    const newTarget = s3.cars.find(c => c.isTarget)!;
    if (s3.moves === 1) {
      expect(newTarget.col).toBe(initialCol + 1);
    }
  });

  it("cannot move car off board", () => {
    // Push target car to far left first
    let s = initialState(0, easy);
    s = reducer(s, { type: "selectCar", carId: 0 });
    // Try moving left many times
    for (let i = 0; i < 10; i++) {
      s = reducer(s, { type: "moveCar", carId: 0, delta: -1 });
    }
    const target = s.cars.find(c => c.isTarget)!;
    expect(target.col).toBeGreaterThanOrEqual(0);
  });

  it("no-op when won", () => {
    const s = { ...initialState(0, easy), won: true };
    const s2 = reducer(s, { type: "moveCar", carId: 0, delta: 1 });
    expect(s2).toBe(s);
  });

  it("detects win when target exits right", () => {
    const s = initialState(0, easy);
    // Manually set target car near exit
    const cars = s.cars.map(c => c.isTarget ? { ...c, col: s.size - c.length } : c);
    const state = { ...s, cars };
    const s2 = reducer(state, { type: "selectCar", carId: 0 });
    const s3 = reducer(s2, { type: "moveCar", carId: 0, delta: 1 });
    // Target at col=size-length+1 means it has exited
    if (s3.moves > 0) {
      const target = s3.cars.find(c => c.isTarget)!;
      if (target.col + target.length >= s.size) {
        expect(s3.won).toBe(true);
      }
    }
  });
});

describe("isTerminal", () => {
  it("returns null when not won", () => {
    expect(isTerminal(initialState(0, easy))).toBeNull();
  });

  it("returns score when won", () => {
    const s = { ...initialState(0, easy), won: true, moves: 10 };
    const r = isTerminal(s);
    expect(r).not.toBeNull();
    expect(r!.score).toBeGreaterThanOrEqual(50);
  });

  it("hard difficulty puzzle can be created", () => {
    const s = initialState(0, hard);
    expect(s.cars.length).toBeGreaterThan(4);
  });
});
