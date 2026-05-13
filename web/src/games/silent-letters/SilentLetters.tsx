import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SilentLettersState, SilentLettersAction, SilentLettersSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./SilentLetters.css";

export function SilentLetters({
  state,
  dispatch,
  onGameOver,
}: GameProps<SilentLettersState, SilentLettersSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const entry = state.entries[state.current];

  return (
    <div className="sl-wrap fade-in">
      <div className="sl-progress">
        Question {state.current + 1} of {state.entries.length}
      </div>
      <div className="sl-score pulse">Score: {state.score}</div>

      {!state.done && entry ? (
        <>
          <div className="sl-word">{entry.word}</div>
          <div className="sl-prompt">Which letter is silent in this word?</div>
          <div className="sl-choices">
            {entry.choices.map((letter, i) => {
              let cls = "sl-choice";
              if (state.selected !== null) {
                if (letter === entry.silentLetter) cls += " correct";
                else if (state.selected === i) cls += " wrong";
              }
              return (
                <button
                  key={i}
                  className={cls}
                  disabled={state.selected !== null}
                  onClick={() => dispatch({ type: "select", index: i } as SilentLettersAction)}
                >
                  {letter}
                </button>
              );
            })}
          </div>
          {state.selected !== null && (
            <button
              className="sl-next"
              onClick={() => dispatch({ type: "next" } as SilentLettersAction)}
            >
              {state.current + 1 < state.entries.length ? "Next" : "Finish"}
            </button>
          )}
        </>
      ) : (
        <div className="sl-done bounce-in">
          <h2>Complete!</h2>
          <div className="sl-final">
            Score: {state.score} / {state.entries.length * 10}
          </div>
        </div>
      )}
    </div>
  );
}
