import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { IndustrialRevolutionQuizState, IndustrialRevolutionQuizAction, IndustrialRevolutionQuizSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function IndustrialRevolutionQuizGame({ state, dispatch, onGameOver }: GameProps<IndustrialRevolutionQuizState, IndustrialRevolutionQuizSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const entry = state.entries[state.current];
  return (
    <div className="hq-wrap">
      <div className="hq-progress">Question {state.current + 1} of {state.entries.length}</div>
      <div className="hq-score">Score: {state.score}</div>
      {!state.done && entry ? (<>
        <div className="hq-question">{entry.question}</div>
        <div className="hq-choices">
          {entry.choices.map((choice, i) => {
            let cls = "hq-choice";
            if (state.selected !== null) { if (choice === entry.answer) cls += " correct"; else if (state.selected === i) cls += " wrong"; }
            return <button key={i} className={cls} disabled={state.selected !== null} data-testid={`hint-target-quiz-answer-${i}`} onClick={() => dispatch({ type:"select", index:i } as IndustrialRevolutionQuizAction)}>{choice}</button>;
          })}
        </div>
        {state.selected !== null && <button className="hq-next" onClick={() => dispatch({ type:"next" } as IndustrialRevolutionQuizAction)}>{state.current + 1 < state.entries.length ? "Next" : "Finish"}</button>}
      </>) : <div className="hq-done"><h2>Quiz Complete!</h2><div className="hq-final">Score: {state.score} / {state.entries.length * 10}</div></div>}
    </div>
  );
}
