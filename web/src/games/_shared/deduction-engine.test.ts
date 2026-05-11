import { describe, expect, it } from "vitest";
import {
  deductionInitial,
  deductionFeedback,
  deductionSetCurrent,
  deductionSubmit,
  deductionScore,
  deductionHintSelector,
  type DeductionConfig,
} from "./deduction-engine.js";

const cfg: DeductionConfig = {
  mode: "exact",
  answerLength: 4,
  poolSize: 6,
  allowRepeats: false,
  maxGuesses: 3,
  symbolLabels: ["A", "B", "C", "D", "E", "F"],
  scenarioLabel: "Test",
  scenarioEmoji: "?",
};

describe("deduction-engine", () => {
  it("computes exact/partial feedback correctly (Mastermind-style)", () => {
    // answer = [1,2,3,4], guess = [1,3,2,5] → 1 exact (pos 0), 2 partial (2,3 wrong-pos), 5 absent
    const fb = deductionFeedback([1, 2, 3, 4], [1, 3, 2, 5]);
    expect(fb.exact).toBe(1);
    expect(fb.partial).toBe(2);
    expect(fb.matches).toBe(3);
  });

  it("transitions to 'won' when the submitted guess equals the answer and scores positively", () => {
    const init = deductionInitial(42, cfg);
    // Build the working guess to exactly match the secret answer via setCurrent.
    let s = init;
    for (let i = 0; i < init.answer.length; i++) {
      s = deductionSetCurrent(s, i, init.answer[i]!);
    }
    const after = deductionSubmit(s, cfg);
    expect(after.phase).toBe("won");
    expect(after.guesses).toHaveLength(1);
    expect(after.guesses[0]!.fb.exact).toBe(cfg.answerLength);

    const score = deductionScore(after, cfg);
    expect(score).not.toBeNull();
    expect(score!.won).toBe(true);
    // remaining = 3 - 1 = 2, score = 100 + 40 = 140
    expect(score!.score).toBe(140);
  });

  it("transitions to 'lost' after maxGuesses wrong submissions and refuses further changes", () => {
    const init = deductionInitial(7, cfg);
    // Construct a guess guaranteed to differ from the answer: pick values
    // outside the answer set when possible, else shift.
    const wrong = init.answer.map(v => (v + 1) % cfg.poolSize);
    let s = init;
    for (let i = 0; i < wrong.length; i++) s = deductionSetCurrent(s, i, wrong[i]!);

    for (let g = 0; g < cfg.maxGuesses; g++) {
      s = deductionSubmit(s, cfg);
    }
    expect(s.phase).toBe("lost");
    expect(s.guesses).toHaveLength(cfg.maxGuesses);

    // Hint selector returns null once out of guess phase.
    expect(deductionHintSelector(s, cfg)).toBeNull();

    // setCurrent is a no-op once game is over.
    const frozen = deductionSetCurrent(s, 0, 5);
    expect(frozen).toBe(s);

    // submit is also a no-op once over.
    const stillFrozen = deductionSubmit(s, cfg);
    expect(stillFrozen).toBe(s);

    const score = deductionScore(s, cfg);
    expect(score).not.toBeNull();
    expect(score!.won).toBe(false);
    expect(score!.score).toBe(0);
  });
});
