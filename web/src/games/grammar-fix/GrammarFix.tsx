import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { GrammarFixState, GrammarFixAction, GrammarFixSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./GrammarFix.css";

export function GrammarFix({
  state,
  dispatch,
  onGameOver,
}: GameProps<GrammarFixState, GrammarFixSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const entry = state.entries[state.current];

  return (
    <div className="gf-wrap fade-in">
      <div className="gf-progress">
        Question {state.current + 1} of {state.entries.length}
      </div>
      <div className="gf-score pulse">Score: {state.score}</div>

      {!state.done && entry ? (
        <>
          <div className="gf-label">Incorrect sentence</div>
          <div className="gf-sentence">"{entry.sentence}"</div>
          <div className="gf-prompt">Choose the grammatically correct version:</div>
          <div className="gf-choices">
            {entry.choices.map((choice, i) => {
              let cls = "gf-choice";
              if (state.selected !== null) {
                if (choice === entry.answer) cls += " correct";
                else if (state.selected === i) cls += " wrong";
              }
              return (
                <button
                  key={i}
                  className={cls}
                  disabled={state.selected !== null}
                  onClick={() => dispatch({ type: "select", index: i } as GrammarFixAction)}
                >
                  {choice}
                </button>
              );
            })}
          </div>
          {state.selected !== null && (
            <>
              <div className="gf-explanation">{entry.explanation}</div>
              <button
                className="gf-next"
                onClick={() => dispatch({ type: "next" } as GrammarFixAction)}
              >
                {state.current + 1 < state.entries.length ? "Next" : "Finish"}
              </button>
            </>
          )}
        </>
      ) : (
        <div className="gf-done bounce-in">
          <h2>Quiz Complete!</h2>
          <div className="gf-final">
            Score: {state.score} / {state.entries.length * 10}
          </div>
        </div>
      )}
    </div>
  );
}
