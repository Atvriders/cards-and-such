import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, ANIMAL_HOME } from "./state.js";
import type { Home } from "./state.js";

const s4 = { count: "4" as const };
const s6 = { count: "6" as const };

describe("Farmyard Match", () => {
  it("initializes with correct number of animals", () => {
    const s = initialState(42, s4);
    expect(s.animals.length).toBe(4);
    expect(s.homes.length).toBe(4);
    expect(s.userGuesses).toEqual([null, null, null, null]);
    expect(s.submitted).toBe(false);
  });

  it("6-animal mode has 6 animals", () => {
    const s = initialState(42, s6);
    expect(s.animals.length).toBe(6);
  });

  it("guessing an animal updates userGuesses", () => {
    const s = initialState(42, s4);
    const next = reducer(s, { type: "guess", animalIndex: 0, home: "barn" as Home });
    expect(next.userGuesses[0]).toBe("barn");
  });

  it("submit scores correct matches", () => {
    const s = initialState(42, s4);
    let cur = s;
    // Set correct answers for all animals
    s.animals.forEach((animal, i) => {
      cur = reducer(cur, { type: "guess", animalIndex: i, home: ANIMAL_HOME[animal] });
    });
    cur = reducer(cur, { type: "submit" });
    expect(cur.submitted).toBe(true);
    expect(cur.correctCount).toBe(4);
  });

  it("wrong guesses reduce correct count", () => {
    const s = initialState(42, s4);
    let cur = s;
    // Deliberately assign wrong homes
    s.animals.forEach((animal, i) => {
      const wrong = s.homes.find(h => h !== ANIMAL_HOME[animal]) ?? s.homes[0]!;
      cur = reducer(cur, { type: "guess", animalIndex: i, home: wrong });
    });
    cur = reducer(cur, { type: "submit" });
    expect(cur.submitted).toBe(true);
    expect(cur.correctCount).toBeLessThanOrEqual(4);
  });

  it("isTerminal returns null before submission", () => {
    const s = initialState(42, s4);
    expect(isTerminal(s)).toBeNull();
  });

  it("isTerminal returns 100 when all correct", () => {
    const s = initialState(42, s4);
    let cur = s;
    s.animals.forEach((animal, i) => {
      cur = reducer(cur, { type: "guess", animalIndex: i, home: ANIMAL_HOME[animal] });
    });
    cur = reducer(cur, { type: "submit" });
    expect(isTerminal(cur)).toEqual({ score: 100 });
  });

  it("actions after submit are ignored", () => {
    const s = initialState(42, s4);
    let cur = s;
    s.animals.forEach((animal, i) => {
      cur = reducer(cur, { type: "guess", animalIndex: i, home: ANIMAL_HOME[animal] });
    });
    cur = reducer(cur, { type: "submit" });
    const frozen = cur;
    const after = reducer(frozen, { type: "guess", animalIndex: 0, home: "pond" as Home });
    expect(after).toBe(frozen);
  });
});
