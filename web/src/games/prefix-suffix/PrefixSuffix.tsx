import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PrefixSuffixState, PrefixSuffixAction, PrefixSuffixSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./PrefixSuffix.css";

export function PrefixSuffix({
  state,
  dispatch,
  onGameOver,
}: GameProps<PrefixSuffixState, PrefixSuffixSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const entry = state.entries[state.current];

  return (
    <div className="ps-wrap">
      <div className="ps-progress">
        Question {state.current + 1} of {state.entries.length}
      </div>
      <div className="ps-score">Score: {state.score}</div>

      {!state.done && entry ? (
        <>
          <div className="ps-badge">{entry.type === "prefix" ? "Prefix" : "Suffix"}</div>
          <div className="ps-affix">{entry.affix}</div>
          <div className="ps-prompt">What does this {entry.type} mean?</div>
          <div className="ps-choices">
            {entry.choices.map((choice, i) => {
              let cls = "ps-choice";
              if (state.selected !== null) {
                if (choice === entry.meaning) cls += " correct";
                else if (state.selected === i) cls += " wrong";
              }
              return (
                <button
                  key={i}
                  className={cls}
                  disabled={state.selected !== null}
                  onClick={() => dispatch({ type: "select", index: i } as PrefixSuffixAction)}
                >
                  {choice}
                </button>
              );
            })}
          </div>
          {state.selected !== null && (
            <button
              className="ps-next"
              onClick={() => dispatch({ type: "next" } as PrefixSuffixAction)}
            >
              {state.current + 1 < state.entries.length ? "Next" : "Finish"}
            </button>
          )}
        </>
      ) : (
        <div className="ps-done">
          <h2>Complete!</h2>
          <div className="ps-final">
            Score: {state.score} / {state.entries.length * 10}
          </div>
        </div>
      )}
    </div>
  );
}
