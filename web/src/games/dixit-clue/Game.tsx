import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DixitClueState, DixitClueAction, DixitClueSettings } from "./state.js";
import { isTerminal, TOTAL_QUESTIONS } from "./state.js";
import "./Game.css";

const P = "dxc";

export function DixitClueGame({ state, dispatch, onGameOver }: GameProps<DixitClueState, DixitClueSettings>): JSX.Element {
  const [start, setStart] = useState<number>(() => Date.now());
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  useEffect(() => { if (state.phase === "ask") setStart(Date.now()); }, [state.current, state.phase]);
  if (state.phase === "done") {
    return (
      <div className={`${P}-wrap fade-in`}>
        <div className={`${P}-final bounce-in`}>
          <h2 className={`${P}-final-title`}>Dixit Clue — Complete</h2>
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
            <button data-testid="hint-target-dixit-clue-primary" key={i} className={cls} disabled={state.phase !== "ask"}
              type="button"
              onClick={() => dispatch({ type: "answer", choice: i, elapsedMs: Date.now() - start } as DixitClueAction)}
            >{c}</button>
          );
        })}
      </div>
      {state.phase === "feedback" && (
        <>
          <div className={`${P}-feedback ${state.lastCorrect ? P + "-good" : P + "-bad"}`}>
            {state.lastCorrect ? "Correct!" : `Answer: ${q.choices[q.answer]}`}
          </div>
          <button data-testid="hint-target-dixit-clue-next" className={`${P}-next`} type="button" onClick={() => dispatch({ type: "next" } as DixitClueAction)}>
            {state.current + 1 >= TOTAL_QUESTIONS ? "See Results" : "Next"}
          </button>
        </>
      )}
    </div>
  );
}
