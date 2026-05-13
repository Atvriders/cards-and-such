import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { Fibbage3QuizState, Fibbage3QuizAction, Fibbage3QuizSettings } from "./state.js";
import { isTerminal, TOTAL_QUESTIONS } from "./state.js";
import "./Game.css";

const P = "fb3q";

export function Fibbage3QuizGame({ state, dispatch, onGameOver }: GameProps<Fibbage3QuizState, Fibbage3QuizSettings>): JSX.Element {
  const [start, setStart] = useState<number>(() => Date.now());
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  useEffect(() => { if (state.phase === "ask") setStart(Date.now()); }, [state.current, state.phase]);
  if (state.phase === "done") {
    return (
      <div className={`${P}-wrap fade-in`}>
        <div className={`${P}-final bounce-in`}>
          <h2 className={`${P}-final-title`}>Fibbage 3 Quiz — Complete</h2>
          <div className={`${P}-final-score`}>{state.score} pts</div>
          <div className={`${P}-streak`}>{state.questions.length} questions answered</div>
        </div>
      </div>
    );
  }
  const q = state.questions[state.current];
  if (!q) return <div className={`${P}-wrap fade-in`}>Loading…</div>;
  return (
    <div className={`${P}-wrap fade-in`}>
      <div className={`${P}-header`}>
        <span className={`${P}-progress`}>Q{state.current + 1} / {TOTAL_QUESTIONS}</span>
        <span className={`${P}-score`}>Score {state.score} · 🔥 {state.streak}</span>
      </div>
      <div className={`${P}-q`}>{q.q}</div>
      <div className={`${P}-choices`}>
        {q.choices.map((c, i) => {
          const isSel = state.lastAnswerIdx === i;
          const cls = state.phase === "feedback"
            ? i === q.answer ? `${P}-choice ${P}-correct` : isSel ? `${P}-choice ${P}-wrong` : `${P}-choice`
            : `${P}-choice`;
          return (
            <button
              key={i}
              className={cls}
              disabled={state.phase !== "ask"}
              type="button"
              data-testid={`hint-target-quiz-answer-${i}`}
              onClick={() => dispatch({ type: "answer", choice: i, elapsedMs: Date.now() - start } as Fibbage3QuizAction)}
            >{c}</button>
          );
        })}
      </div>
      {state.phase === "feedback" && (
        <>
          <div className={`${P}-feedback ${state.lastCorrect ? P + "-good" : P + "-bad"}`}>
            {state.lastCorrect ? "Correct!" : `Answer: ${q.choices[q.answer]}`}
          </div>
          <button className={`${P}-next`} type="button" onClick={() => dispatch({ type: "next" } as Fibbage3QuizAction)}>
            {state.current + 1 >= TOTAL_QUESTIONS ? "See Results" : "Next"}
          </button>
        </>
      )}
    </div>
  );
}
