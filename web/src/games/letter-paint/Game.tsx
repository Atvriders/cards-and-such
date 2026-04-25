import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { LetterPaintState, LetterPaintSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function LetterPaintGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<LetterPaintState, LetterPaintSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const targetCount = state.grid.filter(c => c === state.targetLetter).length;

  return (
    <div className="lp-game">
      <div className="lp-title">Letter Paint</div>
      <div className="lp-hud">
        <span>Round {state.currentRound}/{state.totalRounds}</span>
        <span>Score: {state.score}</span>
      </div>

      <div className="lp-target">
        Paint all <span className="lp-target-letter">{state.targetLetter}</span>s ({targetCount} cells)
      </div>

      <div className="lp-grid">
        {state.grid.map((letter, i) => (
          <button
            key={i}
            className={`lp-cell${state.painted[i] ? " painted" : ""}${state.phase === "result" && letter === state.targetLetter ? " correct-cell" : ""}${state.phase === "result" && letter !== state.targetLetter && state.painted[i] ? " wrong-cell" : ""}`}
            onClick={() => dispatch({ type: "paint", index: i })}
            disabled={state.phase !== "playing"}
          >
            {letter}
          </button>
        ))}
      </div>

      {state.phase === "playing" && (
        <button className="lp-submit-btn" onClick={() => dispatch({ type: "submit" })}>
          Submit
        </button>
      )}

      {state.phase === "result" && (
        <div className="lp-result">
          Round score: +{state.roundScore}
          <button className="lp-next-btn" onClick={() => dispatch({ type: "next-round" })}>
            {state.currentRound >= state.totalRounds ? "Finish" : "Next Round"}
          </button>
        </div>
      )}

      {state.gameOver && (
        <div className="lp-gameover">
          Final Score: {state.score}
        </div>
      )}
    </div>
  );
}
