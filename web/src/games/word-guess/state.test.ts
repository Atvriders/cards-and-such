import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, computeMarks } from "./state.js";
import type { WordGuessState } from "./state.js";

const settings5 = { wordLength: "5" as const, maxAttempts: "6" as const };
const settings4 = { wordLength: "4" as const, maxAttempts: "6" as const };

// ---------------------------------------------------------------------------
// 1. Initial state
// ---------------------------------------------------------------------------
describe("initialState", () => {
  it("has correct target length, empty attempts, empty current, not won/lost", () => {
    const s = initialState(42, settings5);
    expect(s.target.length).toBe(5);
    expect(s.attempts).toHaveLength(0);
    expect(s.current).toBe("");
    expect(s.won).toBe(false);
    expect(s.lost).toBe(false);
    expect(s.error).toBeNull();
  });

  it("reflects settings in state", () => {
    const s = initialState(42, settings5);
    expect(s.wordLength).toBe(5);
    expect(s.maxAttempts).toBe(6);
  });
});

// ---------------------------------------------------------------------------
// 2. Determinism
// ---------------------------------------------------------------------------
describe("determinism", () => {
  it("produces same target for same seed", () => {
    const s1 = initialState(99, settings5);
    const s2 = initialState(99, settings5);
    expect(s1.target).toBe(s2.target);
  });

  it("produces different targets for different seeds (overwhelmingly likely)", () => {
    const targets = new Set(
      Array.from({ length: 20 }, (_, i) => initialState(i, settings5).target)
    );
    expect(targets.size).toBeGreaterThan(1);
  });
});

// ---------------------------------------------------------------------------
// 3. letter action
// ---------------------------------------------------------------------------
describe("letter action", () => {
  it("appends an uppercase char to current", () => {
    const s = initialState(42, settings5);
    const s2 = reducer(s, { type: "letter", char: "A" });
    expect(s2.current).toBe("A");
  });

  it("ignores non-uppercase chars", () => {
    const s = initialState(42, settings5);
    const s2 = reducer(s, { type: "letter", char: "a" });
    expect(s2.current).toBe("");
  });

  it("clears error on letter input", () => {
    const s: WordGuessState = { ...initialState(42, settings5), error: "too short" };
    const s2 = reducer(s, { type: "letter", char: "A" });
    expect(s2.error).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// 4. letter ignored when current.length === wordLength
// ---------------------------------------------------------------------------
describe("letter overflow", () => {
  it("does not append past wordLength", () => {
    let s = initialState(42, settings5);
    for (const ch of ["A", "B", "C", "D", "E"]) {
      s = reducer(s, { type: "letter", char: ch });
    }
    expect(s.current.length).toBe(5);
    const s2 = reducer(s, { type: "letter", char: "F" });
    expect(s2.current.length).toBe(5);
    expect(s2.current).toBe("ABCDE");
  });
});

// ---------------------------------------------------------------------------
// 5. backspace
// ---------------------------------------------------------------------------
describe("backspace action", () => {
  it("removes the last char", () => {
    let s = initialState(42, settings5);
    s = reducer(s, { type: "letter", char: "H" });
    s = reducer(s, { type: "letter", char: "I" });
    s = reducer(s, { type: "backspace" });
    expect(s.current).toBe("H");
  });

  it("is a no-op on empty current", () => {
    const s = initialState(42, settings5);
    const s2 = reducer(s, { type: "backspace" });
    expect(s2.current).toBe("");
  });
});

// ---------------------------------------------------------------------------
// 6. submit with too-short current
// ---------------------------------------------------------------------------
describe("submit validation - too short", () => {
  it("sets error 'too short' if current length < wordLength", () => {
    let s = initialState(42, settings5);
    s = reducer(s, { type: "letter", char: "A" });
    s = reducer(s, { type: "letter", char: "B" });
    const s2 = reducer(s, { type: "submit" });
    expect(s2.error).toBe("too short");
    expect(s2.attempts).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// 7. submit with non-dictionary word
// ---------------------------------------------------------------------------
describe("submit validation - not a word", () => {
  it("sets error 'not a word' for a nonsense string", () => {
    let s = initialState(42, settings5);
    for (const ch of ["Z", "Z", "Z", "Z", "Z"]) {
      s = reducer(s, { type: "letter", char: ch });
    }
    const s2 = reducer(s, { type: "submit" });
    expect(s2.error).toBe("not a word");
    expect(s2.attempts).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// 8. submit with valid non-winning guess
// ---------------------------------------------------------------------------
describe("submit valid guess", () => {
  it("appends an attempt, resets current, no error", () => {
    // Build state with a known target and submit a valid guess that is not the target
    // Use seed 0 and inspect the target
    const s = initialState(0, settings5);
    const target = s.target;

    // Find a word from the allowed list that is not the target
    // We'll use "ABOUT" which is in our TARGETS_5 list
    const guess = target === "ABOUT" ? "ABOVE" : "ABOUT";

    let s2 = initialState(0, settings5);
    for (const ch of guess) {
      s2 = reducer(s2, { type: "letter", char: ch });
    }
    const s3 = reducer(s2, { type: "submit" });

    expect(s3.attempts).toHaveLength(1);
    expect(s3.attempts[0]!.guess).toBe(guess);
    expect(s3.attempts[0]!.marks).toHaveLength(5);
    expect(s3.current).toBe("");
    expect(s3.error).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// 9. Mark logic — APPLE / PAPPY
// ---------------------------------------------------------------------------
describe("computeMarks - APPLE / PAPPY", () => {
  it("produces correct marks for PAPPY vs APPLE", () => {
    // target = APPLE: A(0) P(1) P(2) L(3) E(4)
    // guess  = PAPPY: P(0) A(1) P(2) P(3) Y(4)
    //
    // Pass 1 (green):
    //   pos 2: guess[2]=P == target[2]=P → green, consume target[2], guess[2]
    //
    // Pass 2 (yellow/gray) for remaining:
    //   pos 0: guess[0]=P → search unconsumed target for P: target[1]=P (unconsumed) → yellow, consume target[1]
    //   pos 1: guess[1]=A → search unconsumed target for A: target[0]=A (unconsumed) → yellow, consume target[0]
    //   pos 3: guess[3]=P → search unconsumed target for P: target[1] consumed, target[2] consumed → none → gray
    //   pos 4: guess[4]=Y → not in target → gray
    //
    // Expected: [yellow, yellow, green, gray, gray]
    const marks = computeMarks("PAPPY", "APPLE");
    expect(marks).toEqual(["yellow", "yellow", "green", "gray", "gray"]);
  });
});

// ---------------------------------------------------------------------------
// 10. All greens win
// ---------------------------------------------------------------------------
describe("computeMarks - all greens", () => {
  it("marks all green for HELLO vs HELLO", () => {
    const marks = computeMarks("HELLO", "HELLO");
    expect(marks).toEqual(["green", "green", "green", "green", "green"]);
  });

  it("won becomes true when guess equals target", () => {
    const s = initialState(0, settings5);
    const target = s.target;

    let s2 = initialState(0, settings5);
    for (const ch of target) {
      s2 = reducer(s2, { type: "letter", char: ch });
    }
    const s3 = reducer(s2, { type: "submit" });
    expect(s3.won).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 11. Ghost doubles — careful case
// ---------------------------------------------------------------------------
describe("computeMarks - ghost doubles", () => {
  it("does not double-count letters beyond their occurrences in target", () => {
    // target = "SPEED", guess = "SEEDY"
    // target: S(0) P(1) E(2) E(3) D(4)
    // guess:  S(0) E(1) E(2) D(3) Y(4)
    //
    // Pass 1 (green):
    //   pos 0: S==S → green, consume target[0], guess[0]
    //   pos 2: E==E → green, consume target[2], guess[2]
    //
    // Pass 2:
    //   pos 1: guess[1]=E → search unconsumed target for E: target[3]=E (unconsumed) → yellow, consume target[3]
    //   pos 3: guess[3]=D → search unconsumed target for D: target[4]=D (unconsumed) → yellow, consume target[4]
    //   pos 4: guess[4]=Y → not in target → gray
    //
    // Expected: [green, yellow, green, yellow, gray]
    const marks = computeMarks("SEEDY", "SPEED");
    expect(marks).toEqual(["green", "yellow", "green", "yellow", "gray"]);
  });

  it("extra letters beyond target count go gray", () => {
    // target = "CACAO" → C(0) A(1) C(2) A(3) O(4)
    // guess  = "ACCCA" → A(0) C(1) C(2) C(3) A(4)
    //
    // Pass 1 (green):
    //   pos 2: C==C → green, consume target[2], guess[2]
    //
    // Pass 2:
    //   pos 0: A → unconsumed target: A at pos 1 → yellow, consume target[1]
    //   pos 1: C → unconsumed target: C at pos 0 → yellow, consume target[0]
    //   pos 3: C → no unconsumed C left → gray
    //   pos 4: A → unconsumed target: A at pos 3 → yellow, consume target[3]
    //
    // Expected: [yellow, yellow, green, gray, yellow]
    const marks = computeMarks("ACCCA", "CACAO");
    expect(marks).toEqual(["yellow", "yellow", "green", "gray", "yellow"]);
  });
});

// ---------------------------------------------------------------------------
// 12. isTerminal on win
// ---------------------------------------------------------------------------
describe("isTerminal - win", () => {
  it("returns score correlated with attempts used (earlier win = higher score)", () => {
    const base = initialState(0, settings5);
    const target = base.target;

    // Win on attempt 1
    const win1State: WordGuessState = {
      ...base,
      won: true,
      attempts: [{ guess: target, marks: Array(5).fill("green") }],
    };
    const result1 = isTerminal(win1State);
    expect(result1).not.toBeNull();
    // score = (maxAttempts - 1 + 1) * 100 = maxAttempts * 100 = 600
    expect(result1!.score).toBe(600);

    // Win on last attempt (6)
    const winLateState: WordGuessState = {
      ...base,
      won: true,
      attempts: Array(6).fill({ guess: target, marks: Array(5).fill("green") }),
    };
    const resultLate = isTerminal(winLateState);
    expect(resultLate).not.toBeNull();
    // score = (6 - 6 + 1) * 100 = 100
    expect(resultLate!.score).toBe(100);

    // Earlier win has higher score
    expect(result1!.score).toBeGreaterThan(resultLate!.score);
  });
});

// ---------------------------------------------------------------------------
// 13. isTerminal on loss
// ---------------------------------------------------------------------------
describe("isTerminal - loss", () => {
  it("returns score 0 when lost", () => {
    const s: WordGuessState = { ...initialState(0, settings5), lost: true };
    const result = isTerminal(s);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(0);
  });

  it("returns null when neither won nor lost", () => {
    const s = initialState(0, settings5);
    expect(isTerminal(s)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// 14. 4-letter word path works
// ---------------------------------------------------------------------------
describe("4-letter word variant", () => {
  it("target has length 4 with settings4", () => {
    const s = initialState(7, settings4);
    expect(s.target.length).toBe(4);
    expect(s.wordLength).toBe(4);
  });
});

// ---------------------------------------------------------------------------
// 15. No further actions taken after win/loss
// ---------------------------------------------------------------------------
describe("terminal state is immutable to actions", () => {
  it("does not change state when already won", () => {
    const s: WordGuessState = { ...initialState(0, settings5), won: true };
    const s2 = reducer(s, { type: "letter", char: "A" });
    expect(s2).toBe(s);
  });

  it("does not change state when already lost", () => {
    const s: WordGuessState = { ...initialState(0, settings5), lost: true };
    const s2 = reducer(s, { type: "submit" });
    expect(s2).toBe(s);
  });
});
