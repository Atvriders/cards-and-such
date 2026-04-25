import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, PUZZLES } from "./state.js";

describe("SeatingPuzzle", () => {
  it("initialState creates empty assignment", () => {
    const s = initialState(1, {});
    expect(s.assignment.every((a) => a === null)).toBe(true);
    expect(s.won).toBe(false);
  });

  it("selectPerson sets selected", () => {
    const s = initialState(2, {});
    const s2 = reducer(s, { type: "selectPerson", person: s.puzzle.people[0]! });
    expect(s2.selected).toBe(s.puzzle.people[0]);
  });

  it("placePerson puts person in a seat", () => {
    let s = initialState(3, {});
    const person = s.puzzle.people[0]!;
    s = reducer(s, { type: "selectPerson", person });
    s = reducer(s, { type: "placePerson", seat: 0 });
    expect(s.assignment[0]).toBe(person);
    expect(s.selected).toBeNull();
  });

  it("removePerson clears a seat", () => {
    let s = initialState(4, {});
    const person = s.puzzle.people[1]!;
    s = reducer(s, { type: "selectPerson", person });
    s = reducer(s, { type: "placePerson", seat: 2 });
    s = reducer(s, { type: "removePerson", seat: 2 });
    expect(s.assignment[2]).toBeNull();
  });

  it("placing the correct solution triggers win", () => {
    let s = initialState(0, {});
    const puzzle = PUZZLES[0]!;
    s = { ...s, puzzle, assignment: new Array<null>(puzzle.seats).fill(null) };
    for (let i = 0; i < puzzle.seats; i++) {
      s = reducer(s, { type: "selectPerson", person: puzzle.solution[i]! });
      s = reducer(s, { type: "placePerson", seat: i });
    }
    expect(s.won).toBe(true);
    expect(isTerminal(s)).not.toBeNull();
  });

  it("wrong solution does not trigger win", () => {
    let s = initialState(0, {});
    const puzzle = PUZZLES[0]!;
    s = { ...s, puzzle, assignment: new Array<null>(puzzle.seats).fill(null) };
    // place in wrong order
    const reversed = [...puzzle.solution].reverse();
    for (let i = 0; i < puzzle.seats; i++) {
      s = reducer(s, { type: "selectPerson", person: reversed[i]! });
      s = reducer(s, { type: "placePerson", seat: i });
    }
    // may or may not be correct depending on puzzle, but we've placed reversed
    // check it's not a win if solution !== reversed (which it isn't for puzzle 0)
    const matches = reversed.every((p, i) => p === puzzle.solution[i]);
    expect(s.won).toBe(matches);
  });

  it("reset clears assignment and moves", () => {
    let s = initialState(5, {});
    s = reducer(s, { type: "selectPerson", person: s.puzzle.people[0]! });
    s = reducer(s, { type: "placePerson", seat: 0 });
    s = reducer(s, { type: "reset" });
    expect(s.assignment.every((a) => a === null)).toBe(true);
    expect(s.moves).toBe(0);
  });

  it("all puzzles have valid solutions", () => {
    for (const p of PUZZLES) {
      expect(p.solution).toHaveLength(p.seats);
      const solutionSet = new Set(p.solution);
      expect(solutionSet.size).toBe(p.people.length);
    }
  });
});
