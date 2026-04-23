import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PennyFlipState, PennyFlipSettings } from "./state.js";
import { isTerminal, TOTAL_FLIPS } from "./state.js";
import "./PennyFlip.css";

export function PennyFlip({
  state,
  dispatch,
  onGameOver,
}: GameProps<PennyFlipState, PennyFlipSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const lastEntry = state.history[state.history.length - 1];
  const remaining = TOTAL_FLIPS - state.flipsCompleted;

  return (
    <div className="pf-game">
      <div className="pf-title">Penny Flip</div>

      <div className="pf-stats">
        <span>Flip {state.flipsCompleted + (state.done ? 0 : 0)} / {TOTAL_FLIPS}</span>
        <span className="pf-correct">✓ {state.correct}</span>
        <span className="pf-wrong">✗ {state.flipsCompleted - state.correct}</span>
      </div>

      <div className={`pf-coin ${state.lastResult ?? "pending"}`}>
        {state.lastResult === "heads" ? "H" : state.lastResult === "tails" ? "T" : "?"}
      </div>

      {lastEntry && !state.done && (
        <div className={`pf-result-label ${lastEntry.correct ? "correct" : "wrong"}`}>
          {lastEntry.result.toUpperCase()} — {lastEntry.correct ? "Correct!" : "Wrong!"}
        </div>
      )}

      {!state.done && (
        <>
          {state.pendingPrediction === null ? (
            <div className="pf-predict-buttons">
              <button className="heads-btn" onClick={() => dispatch({ type: "predict", side: "heads" })}>
                Heads
              </button>
              <button className="tails-btn" onClick={() => dispatch({ type: "predict", side: "tails" })}>
                Tails
              </button>
            </div>
          ) : (
            <>
              <div className="pf-predicted">Predicted: {state.pendingPrediction.toUpperCase()}</div>
              <button className="pf-flip-button" onClick={() => dispatch({ type: "flip" })}>
                Flip!
              </button>
            </>
          )}
          <div className="pf-remaining">{remaining} flip{remaining !== 1 ? "s" : ""} remaining</div>
        </>
      )}

      <div className="pf-history">
        {state.history.map((entry, i) => (
          <div key={i} className={`pf-dot ${entry.correct ? "correct" : "wrong"}`}>
            {entry.result[0]!.toUpperCase()}
          </div>
        ))}
        {!state.done && Array.from({ length: remaining }, (_, i) => (
          <div key={`empty-${i}`} className="pf-dot empty" />
        ))}
      </div>

      {state.done && (
        <div className="pf-game-over">
          {state.correct} / {TOTAL_FLIPS} correct!<br />
          <span className="pf-score-label">Score: {terminal?.score}</span>
        </div>
      )}
    </div>
  );
}
