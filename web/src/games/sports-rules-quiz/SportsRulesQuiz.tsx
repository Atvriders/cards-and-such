import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SportsRulesQuizState, SportsRulesQuizSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./SportsRulesQuiz.css";
export function SportsRulesQuiz({ state, dispatch, onGameOver }: GameProps<SportsRulesQuizState, SportsRulesQuizSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const entry = state.entries[state.current];
  return (
    <div className="sq-wrap fade-in">
      <div className="sq-progress">Question {state.current + 1} of {state.entries.length}</div>
      <div className="sq-score pulse">Score: {state.score}</div>
      {!state.done && entry ? (<>
          <div className="sq-question">{entry.question}</div>
          <div className="sq-choices">
            {entry.choices.map((c, i) => {
              let cls = "sq-choice";
              if (state.selected !== null) { if (c === entry.answer) cls += " correct"; else if (state.selected === i) cls += " wrong"; }
              return <button key={i} className={cls} data-testid={`hint-target-quiz-answer-${i}`} disabled={state.selected !== null} onClick={() => dispatch({ type: "select", index: i })}>{c}</button>;
            })}
          </div>
          {state.selected !== null && <button className="sq-next" onClick={() => dispatch({ type: "next" })}>{state.current + 1 < state.entries.length ? "Next" : "Finish"}</button>}
        </>) : (<div className="sq-done bounce-in"><h2>Quiz Complete!</h2><div className="sq-final">Score: {state.score} / {state.entries.length * 10}</div></div>)}
    </div>
  );
}
