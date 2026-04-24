import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const S10 = { questions: "10" as const };

describe("family-feud state", () => {
  it("initializes with correct number of questions and zeroed score", () => {
    const s = initialState(1, S10);
    expect(s.questions.length).toBe(10);
    expect(s.score).toBe(0);
    expect(s.strikes).toBe(0);
    expect(s.phase).toBe("guessing");
    expect(s.questionIndex).toBe(0);
  });

  it("reveals a slot and awards points on a correct guess", () => {
    let s = initialState(1, S10);
    const firstAnswer = s.questions[0]!.slots[0]!.answer;
    const firstPoints = s.questions[0]!.slots[0]!.points;
    s = reducer(s, { type: "set_input", value: firstAnswer });
    s = reducer(s, { type: "submit_guess" });
    expect(s.lastGuessResult).toBe("correct");
    expect(s.score).toBe(firstPoints);
    expect(s.questions[0]!.slots[0]!.revealed).toBe(true);
  });

  it("increments strikes on wrong guess and ends round at 3 strikes", () => {
    let s = initialState(1, S10);
    s = reducer(s, { type: "set_input", value: "xyzzy_not_an_answer_1" });
    s = reducer(s, { type: "submit_guess" });
    expect(s.strikes).toBe(1);
    expect(s.lastGuessResult).toBe("wrong");
    s = reducer(s, { type: "set_input", value: "xyzzy_not_an_answer_2" });
    s = reducer(s, { type: "submit_guess" });
    expect(s.strikes).toBe(2);
    s = reducer(s, { type: "set_input", value: "xyzzy_not_an_answer_3" });
    s = reducer(s, { type: "submit_guess" });
    expect(s.strikes).toBe(3);
    expect(s.phase).toBe("round_end");
  });

  it("advances to next question after round_end", () => {
    let s = initialState(1, S10);
    // Strike out 3 times
    for (let i = 0; i < 3; i++) {
      s = reducer(s, { type: "set_input", value: `zzz_wrong_${i}` });
      s = reducer(s, { type: "submit_guess" });
    }
    expect(s.phase).toBe("round_end");
    s = reducer(s, { type: "next_question" });
    expect(s.questionIndex).toBe(1);
    expect(s.strikes).toBe(0);
    expect(s.phase).toBe("guessing");
  });

  it("isTerminal returns null mid-game and score after last question", () => {
    let s = initialState(1, S10);
    expect(isTerminal(s)).toBeNull();
    // Strike out through all questions
    for (let q = 0; q < 10; q++) {
      for (let i = 0; i < 3; i++) {
        s = reducer(s, { type: "set_input", value: `wrong_${q}_${i}` });
        s = reducer(s, { type: "submit_guess" });
      }
      if (q < 9) {
        s = reducer(s, { type: "next_question" });
        expect(isTerminal(s)).toBeNull();
      }
    }
    s = reducer(s, { type: "next_question" });
    expect(s.phase).toBe("done");
    expect(isTerminal(s)).not.toBeNull();
  });
});
