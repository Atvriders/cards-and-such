import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DicePredictionState, DicePredictionSettings } from "./state.js";
import type { DieFace } from "./state.js";
import { isTerminal } from "./state.js";
import "./DicePrediction.css";

const FACES: DieFace[] = [1, 2, 3, 4, 5, 6];
const DIE_EMOJI = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

export function DicePrediction({
  state,
  dispatch,
  onGameOver,
}: GameProps<DicePredictionState, DicePredictionSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const round = state.rounds[state.currentRound];
  const hasPrediction = round?.prediction !== null;
  const hasResult = round?.result !== null;
  const completedRounds = state.rounds.filter(r => r.result !== null);

  function dieClass(): string {
    if (!hasResult) return "pending";
    return round?.correct ? "correct" : "wrong";
  }

  return (
    <div className="dp-game">
      <div className="dp-title">Dice Prediction</div>
      <div className="dp-score">Score: {state.score}</div>
      <div className="dp-round-info">Round {state.currentRound + 1} / {state.totalRounds}</div>

      <div className={`dp-die ${dieClass()}`}>
        {round?.result ? DIE_EMOJI[round.result] : "?"}
      </div>

      {!state.gameOver && round && (
        <>
          {!hasPrediction && (
            <>
              <div className="dp-predict-label">Predict the die:</div>
              <div className="dp-face-buttons">
                {FACES.map(f => (
                  <button
                    key={f}
                    className="dp-face-btn"
                    onClick={() => dispatch({ type: "predict", face: f })}
                  >
                    {DIE_EMOJI[f]}
                  </button>
                ))}
              </div>
            </>
          )}

          {hasPrediction && !hasResult && (
            <>
              <div className="dp-predict-label">
                Predicted: {DIE_EMOJI[round.prediction!]}
              </div>
              <button className="dp-roll-btn" onClick={() => dispatch({ type: "roll" })}>
                Roll!
              </button>
            </>
          )}

          {hasResult && (
            <>
              <div className={`dp-result-label ${round.correct ? "correct" : "wrong"}`}>
                {round.correct ? "Correct! +100" : `Wrong! It was ${DIE_EMOJI[round.result!]}`}
              </div>
              <button className="dp-roll-btn" onClick={() => dispatch({ type: "roll" })}>
                Next
              </button>
            </>
          )}
        </>
      )}

      {completedRounds.length > 0 && (
        <div className="dp-history">
          {completedRounds.map((r, i) => (
            <div key={i} className={`dp-history-dot ${r.correct ? "correct" : "wrong"}`}>
              {DIE_EMOJI[r.result!]}
            </div>
          ))}
        </div>
      )}

      {state.gameOver && (
        <div className="dp-game-over">
          Done! Score: {state.score} / {state.totalRounds * 100}<br />
          <span style={{ fontSize: "0.85rem", opacity: 0.75 }}>
            {completedRounds.filter(r => r.correct).length}/{state.totalRounds} correct
          </span>
        </div>
      )}
    </div>
  );
}
