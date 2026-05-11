import { describe, it, expect } from "vitest";
import {
  quizInitial,
  quizAnswer,
  quizNext,
  quizScore,
  type QuizConfig,
  type QuizQuestion,
} from "./quiz-engine.js";

const pool: readonly QuizQuestion[] = [
  { q: "Q0", choices: ["a", "b", "c", "d"], answer: 0 },
  { q: "Q1", choices: ["a", "b", "c", "d"], answer: 1 },
  { q: "Q2", choices: ["a", "b", "c", "d"], answer: 2 },
  { q: "Q3", choices: ["a", "b", "c", "d"], answer: 3 },
  { q: "Q4", choices: ["a", "b", "c", "d"], answer: 0 },
];

describe("quiz-engine", () => {
  it("runs a full deterministic 2-question session: correct then wrong, score & phase transitions", () => {
    const cfg: QuizConfig = { totalQuestions: 2, pool };
    const s0 = quizInitial(42, cfg);

    expect(s0.phase).toBe("ask");
    expect(s0.current).toBe(0);
    expect(s0.score).toBe(0);
    expect(s0.streak).toBe(0);
    expect(s0.questions).toHaveLength(2);

    // Same seed -> same picked questions (determinism).
    const s0b = quizInitial(42, cfg);
    expect(s0b.questions.map((q) => q.q)).toEqual(s0.questions.map((q) => q.q));

    const q0 = s0.questions[0]!;
    // Answer correctly at 0ms -> 10 base + 5 time bonus + 0 streak = 15
    const s1 = quizAnswer(s0, q0.answer, 0);
    expect(s1.phase).toBe("feedback");
    expect(s1.lastCorrect).toBe(true);
    expect(s1.score).toBe(15);
    expect(s1.streak).toBe(1);
    expect(s1.lastAnswerIdx).toBe(q0.answer);

    // Answering again while in feedback is a no-op.
    expect(quizAnswer(s1, q0.answer, 0)).toBe(s1);

    const s2 = quizNext(s1, cfg);
    expect(s2.phase).toBe("ask");
    expect(s2.current).toBe(1);
    expect(s2.lastCorrect).toBeNull();

    // Wrong answer on Q1 -> 0 points, streak resets.
    const q1 = s2.questions[1]!;
    const wrong = (q1.answer + 1) % q1.choices.length;
    const s3 = quizAnswer(s2, wrong, 1000);
    expect(s3.lastCorrect).toBe(false);
    expect(s3.score).toBe(15);
    expect(s3.streak).toBe(0);

    // quizScore is null until phase === "done".
    expect(quizScore(s3)).toBeNull();

    const s4 = quizNext(s3, cfg);
    expect(s4.phase).toBe("done");
    expect(s4.current).toBe(2);
    expect(quizScore(s4)).toEqual({ score: 15 });
  });

  it("caps time bonus at 0 for slow correct answers and caps streak bonus at 5", () => {
    const cfg: QuizConfig = { totalQuestions: 1, pool };
    const s0 = quizInitial(7, cfg);
    const q0 = s0.questions[0]!;

    // 10s elapsed -> time bonus floored to 0; streak starts at 0 -> 10 + 0 + 0.
    const slow = quizAnswer(s0, q0.answer, 10_000);
    expect(slow.score).toBe(10);

    // Force a large pre-existing streak; streak bonus must cap at 5.
    // Answer at 0ms with streak=42 -> 10 + 5 + 5 = 20.
    const hyped = quizAnswer({ ...s0, streak: 42 }, q0.answer, 0);
    expect(hyped.score).toBe(20);
    expect(hyped.streak).toBe(43);
  });
});
