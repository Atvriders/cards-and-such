import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TTLState, TTLAction, TTLSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function TwoTruthsLie({ state, dispatch, onGameOver }: GameProps<TTLState, TTLSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  if (state.phase === "done") {
    return (
      <div className="ttl-wrap">
        <div className="ttl-done bounce-in">
          <h2>Game Over!</h2>
          <p>Correct: {state.correctCount} / {state.sets.length}</p>
          <p style={{ fontSize: "1.8rem", fontWeight: 900, color: "#27ae60" }}>{state.score} pts</p>
        </div>
      </div>
    );
  }

  const set = state.sets[state.currentIndex]!;
  const isResult = state.phase === "result";
  const isCorrect = state.selected === set.lieIndex;

  return (
    <div className="ttl-wrap fade-in">
      <div className="ttl-header">
        <span className="ttl-progress">Round {state.currentIndex + 1} / {state.sets.length}</span>
        <span className="ttl-score pulse">{state.score} pts</span>
      </div>

      <div className="ttl-instruction">Which one is the LIE?</div>

      <div className="ttl-statements">
        {set.statements.map((stmt, i) => {
          let cls = "ttl-statement";
          if (isResult) {
            cls += i === set.lieIndex ? " lie" : " truth";
          } else if (i === state.selected) {
            cls += " selected";
          }
          return (
            <button
              key={i}
              className={cls}
              disabled={isResult}
              onClick={() => dispatch({ type: "select", index: i } as TTLAction)}
            >
              <span className="ttl-num">{i + 1}.</span>
              {stmt}
            </button>
          );
        })}
      </div>

      {isResult && (
        <>
          <div className={`ttl-feedback ${isCorrect ? "correct" : "wrong"}`}>
            {isCorrect ? "Correct! +100 pts" : "Wrong!"}
          </div>
          <div className="ttl-explanation">{set.explanation}</div>
        </>
      )}

      <div>
        {!isResult && (
          <button
            className="ttl-btn submit"
            disabled={state.selected === null}
            onClick={() => dispatch({ type: "submit" } as TTLAction)}
          >
            That&apos;s the Lie!
          </button>
        )}
        {isResult && (
          <button
            className="ttl-btn next"
            onClick={() => dispatch({ type: "next" } as TTLAction)}
          >
            {state.currentIndex + 1 >= state.sets.length ? "Finish" : "Next"}
          </button>
        )}
      </div>
    </div>
  );
}
