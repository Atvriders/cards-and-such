import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CoinFlipState, CoinFlipAction, CoinFlipSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./CoinFlipStreak.css";

export function CoinFlipStreak({
  state,
  dispatch,
  onGameOver,
}: GameProps<CoinFlipState, CoinFlipSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const gameOver = state.gameOver;
  const lastEntry = state.history[state.history.length - 1];

  function coinClass(): string {
    if (!state.lastResult) return "pending";
    return state.lastResult;
  }

  return (
    <div className="cfs-game">
      <div className="cfs-title">Coin Flip Streak</div>

      <div className="cfs-streak">
        <span className="current">Streak: {state.streak}</span>
        <span className="best">Best: {state.bestStreak}</span>
      </div>
      <div className="cfs-max">Goal: {state.maxFlips} correct in a row</div>

      {/* Coin */}
      <div className={`cfs-coin ${coinClass()}`}>
        {state.lastResult === "heads" ? "H" : state.lastResult === "tails" ? "T" : "?"}
      </div>

      {lastEntry && (
        <div className={`cfs-result-label ${lastEntry.correct ? "correct" : "wrong"}`}>
          {lastEntry.result.toUpperCase()} — {lastEntry.correct ? "Correct!" : "Wrong!"}
        </div>
      )}

      {!gameOver && (
        <>
          {state.pendingPrediction === null ? (
            <div className="cfs-predict-buttons">
              <button className="heads-btn" onClick={() => dispatch({ type: "predict", side: "heads" })}>
                Heads
              </button>
              <button className="tails-btn" onClick={() => dispatch({ type: "predict", side: "tails" })}>
                Tails
              </button>
            </div>
          ) : (
            <>
              <div className="cfs-predicted">
                You predicted: {state.pendingPrediction.toUpperCase()}
              </div>
              <button className="cfs-flip-button" onClick={() => dispatch({ type: "flip" })}>
                Flip!
              </button>
            </>
          )}
        </>
      )}

      {/* History dots */}
      {state.history.length > 0 && (
        <div className="cfs-history">
          {state.history.map((entry, i) => (
            <div key={i} className={`cfs-history-dot ${entry.correct ? "correct" : "wrong"}`}>
              {entry.result[0]!.toUpperCase()}
            </div>
          ))}
        </div>
      )}

      {gameOver && (
        <div className="cfs-game-over">
          {state.won ? (
            <>
              You won! {state.maxFlips} in a row!
              <br />
              <span style={{ fontSize: "0.9rem", opacity: 0.75 }}>Score: {terminal?.score}</span>
            </>
          ) : (
            <>
              Streak broken at {state.history.length}!
              <br />
              <span style={{ fontSize: "0.9rem", opacity: 0.75 }}>
                Best streak: {state.bestStreak} — Score: {terminal?.score}
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
