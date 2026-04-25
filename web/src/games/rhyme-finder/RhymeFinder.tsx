import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { RhymeFinderState, RhymeFinderAction, RhymeFinderSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./RhymeFinder.css";

export function RhymeFinder({
  state,
  dispatch,
  onGameOver,
}: GameProps<RhymeFinderState, RhymeFinderSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const entry = state.entries[state.current];

  return (
    <div className="rf-wrap">
      <div className="rf-progress">
        Question {state.current + 1} of {state.entries.length}
      </div>
      <div className="rf-score">Score: {state.score}</div>

      {!state.done && entry ? (
        <>
          <div className="rf-prompt-label">Find the rhyme for:</div>
          <div className="rf-prompt-word">{entry.prompt}</div>
          <div className="rf-question">Which word rhymes with <strong>{entry.prompt}</strong>?</div>
          <div className="rf-choices">
            {entry.choices.map((choice, i) => {
              let cls = "rf-choice";
              if (state.selected !== null) {
                if (choice === entry.answer) cls += " correct";
                else if (state.selected === i) cls += " wrong";
              }
              return (
                <button
                  key={i}
                  className={cls}
                  disabled={state.selected !== null}
                  onClick={() => dispatch({ type: "select", index: i } as RhymeFinderAction)}
                >
                  {choice}
                </button>
              );
            })}
          </div>
          {state.selected !== null && (
            <button
              className="rf-next"
              onClick={() => dispatch({ type: "next" } as RhymeFinderAction)}
            >
              {state.current + 1 < state.entries.length ? "Next" : "Finish"}
            </button>
          )}
        </>
      ) : (
        <div className="rf-done">
          <h2>Complete!</h2>
          <div className="rf-final">
            Score: {state.score} / {state.entries.length * 10}
          </div>
        </div>
      )}
    </div>
  );
}
