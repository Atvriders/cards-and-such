import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TripleDiceState, TripleDiceSettings } from "./state.js";
import { reducer, isTerminal } from "./state.js";
import "./TripleDice.css";

const FACES = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

export function TripleDice({ state, dispatch, onGameOver }: GameProps<TripleDiceState, TripleDiceSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  return (
    <div className="triple-dice">
      <div className="triple-dice-info">
        <span>Round: {state.round}/{state.totalRounds}</span>
        <span>Rolls left: {state.rollsLeft}</span>
        <span>Total: {state.totalScore}</span>
      </div>

      <div className="triple-dice-dice-row">
        {state.dice.map((d, i) => (
          <div
            key={i}
            className={`triple-dice-die ${state.kept[i] ? "kept" : ""}`}
            title={state.kept[i] ? "Kept (click to release)" : "Click to keep"}
            onClick={() => dispatch({ type: "toggleKeep", index: i as 0 | 1 | 2 })}
          >
            {FACES[d]}
          </div>
        ))}
      </div>

      <div className="triple-dice-hint">Click dice to keep them between rolls</div>

      {state.roundOver && (
        <div className="triple-dice-round-result">
          Round score: {state.roundScore}
        </div>
      )}

      <div className="triple-dice-buttons">
        {!state.roundOver && (
          <button data-testid="hint-target-triple-dice-roll"
            disabled={state.rollsLeft <= 0}
            onClick={() => dispatch({ type: "roll" })}
          >
            Roll ({state.rollsLeft} left)
          </button>
        )}
        {state.roundOver && !state.gameOver && (
          <button data-testid="hint-target-triple-dice-score" onClick={() => dispatch({ type: "score" })}>Next Round</button>
        )}
        {state.gameOver && (
          <button onClick={() => dispatch({ type: "restart" })}>Play Again</button>
        )}
      </div>

      {state.gameOver && (
        <div className="triple-dice-final">
          Final Score: {state.totalScore} (Rating: {terminal?.score}/100)
        </div>
      )}
    </div>
  );
}
