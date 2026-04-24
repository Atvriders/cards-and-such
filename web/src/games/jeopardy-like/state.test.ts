import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const DEFAULT_SETTINGS = { finalRound: true };
const NO_FINAL_SETTINGS = { finalRound: false };

describe("jeopardy-like state", () => {
  it("starts on the board phase with score 0", () => {
    const s = initialState(1, DEFAULT_SETTINGS);
    expect(s.phase).toBe("board");
    expect(s.score).toBe(0);
    expect(s.categories.length).toBe(6);
    expect(s.picked.every(row => row.every(v => !v))).toBe(true);
  });

  it("transitions to reading then answering when a clue is picked", () => {
    let s = initialState(1, DEFAULT_SETTINGS);
    s = reducer(s, { type: "pick_clue", cat: 0, clue: 0 });
    expect(s.phase).toBe("reading");
    expect(s.activeCat).toBe(0);
    expect(s.activeClue).toBe(0);
    s = reducer(s, { type: "continue" });
    expect(s.phase).toBe("answering");
  });

  it("awards points for correct answer and deducts for wrong", () => {
    let s = initialState(1, DEFAULT_SETTINGS);
    s = reducer(s, { type: "pick_clue", cat: 0, clue: 0 });
    s = reducer(s, { type: "continue" }); // go to answering
    const clueValue = s.categories[s.activeCat]!.clues[s.activeClue]!.value;
    const correctAnswer = s.categories[s.activeCat]!.clues[s.activeClue]!.answer;
    s = reducer(s, { type: "set_answer", value: correctAnswer });
    s = reducer(s, { type: "submit_answer" });
    expect(s.lastCorrect).toBe(true);
    expect(s.score).toBe(clueValue);
    expect(s.phase).toBe("reveal");

    // Mark that clue picked, go back to board and pick another
    s = reducer(s, { type: "continue" });
    expect(s.phase).toBe("board");

    // Wrong answer
    s = reducer(s, { type: "pick_clue", cat: 0, clue: 1 });
    s = reducer(s, { type: "continue" });
    const clueValue2 = s.categories[s.activeCat]!.clues[s.activeClue]!.value;
    s = reducer(s, { type: "set_answer", value: "DEFINITELY_WRONG_xyz" });
    s = reducer(s, { type: "submit_answer" });
    expect(s.lastCorrect).toBe(false);
    expect(s.score).toBe(clueValue - clueValue2);
  });

  it("does not go to final round when finalRound=false", () => {
    let s = initialState(42, NO_FINAL_SETTINGS);
    // Pick all clues and answer correctly
    for (let cat = 0; cat < 6; cat++) {
      for (let clue = 0; clue < 5; clue++) {
        s = reducer(s, { type: "pick_clue", cat, clue });
        s = reducer(s, { type: "continue" });
        const ans = s.categories[s.activeCat]!.clues[s.activeClue]!.answer;
        s = reducer(s, { type: "set_answer", value: ans });
        s = reducer(s, { type: "submit_answer" });
        s = reducer(s, { type: "continue" });
      }
    }
    expect(s.phase).toBe("done");
    expect(isTerminal(s)).not.toBeNull();
  });

  it("isTerminal returns null while game is in progress", () => {
    const s = initialState(1, DEFAULT_SETTINGS);
    expect(isTerminal(s)).toBeNull();
  });

  it("final wager flow works correctly", () => {
    // Start a game with finalRound enabled and skip all main board clues
    let s = initialState(7, DEFAULT_SETTINGS);
    // Force phase to final_wager for unit test
    s = { ...s, phase: "final_wager", picked: s.picked.map(() => [true, true, true, true, true]) };
    // Actually set up the final wager scenario properly using reducer
    s = reducer(s, { type: "set_wager", value: "500" });
    expect(s.finalWager).toBe("500");
    s = reducer(s, { type: "submit_wager" });
    expect(s.phase).toBe("final_answer");
    const correct = s.finalClue.answer;
    s = reducer(s, { type: "set_final_answer", value: correct });
    s = reducer(s, { type: "submit_final" });
    expect(s.finalCorrect).toBe(true);
    expect(s.phase).toBe("final_reveal");
    s = reducer(s, { type: "continue" });
    expect(s.phase).toBe("done");
    expect(isTerminal(s)).not.toBeNull();
  });
});
