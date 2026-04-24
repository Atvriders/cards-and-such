import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PriceGuessState, PriceGuessAction, PriceGuessSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function PriceGuess({ state, dispatch, onGameOver }: GameProps<PriceGuessState, PriceGuessSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  if (state.phase === "done") {
    return (
      <div className="pg-wrap">
        <div className="pg-done">
          <h2>Game Over!</h2>
          <p>Items won (within 10%): {state.won} / {state.items.length}</p>
          <div className="pg-done-score">{state.totalScore} pts</div>
        </div>
      </div>
    );
  }

  const item = state.items[state.currentIndex]!;
  const progress = (state.currentIndex / state.items.length) * 100;

  const getResultClass = () => {
    if (state.lastGuess === null) return "miss";
    const pct = Math.abs(state.lastGuess - item.target) / item.target;
    if (pct <= 0.10) return "win";
    if (pct <= 0.25) return "close";
    return "miss";
  };

  return (
    <div className="pg-wrap">
      <div className="pg-header">
        <span>Item {state.currentIndex + 1} / {state.items.length}</span>
        <span className="pg-score">{state.totalScore} pts | Won: {state.won}</span>
      </div>

      <div className="pg-progress-bar">
        <div className="pg-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="pg-item-card">
        <div className="pg-item-name">{item.name}</div>
        <div className="pg-item-sub">What is the price of this item?</div>
      </div>

      {state.phase === "guessing" && (
        <>
          <div className="pg-input-row">
            <span className="pg-dollar">$</span>
            <input
              className="pg-input"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="Enter price…"
              value={state.guessInput}
              onChange={e => dispatch({ type: "set_input", value: e.target.value } as PriceGuessAction)}
              onKeyDown={e => {
                if (e.key === "Enter") dispatch({ type: "submit" } as PriceGuessAction);
              }}
            />
            <button
              className="pg-btn submit"
              disabled={!state.guessInput || parseFloat(state.guessInput) <= 0}
              onClick={() => dispatch({ type: "submit" } as PriceGuessAction)}
            >
              Guess
            </button>
          </div>
        </>
      )}

      {state.phase === "result" && (
        <>
          <div className={`pg-result ${getResultClass()}`}>
            <div>{getResultClass() === "win" ? "Correct! Within 10%!" : getResultClass() === "close" ? "Close — within 25%!" : "Too far off!"}</div>
            <div className="pg-result-price">Actual price: ${item.target.toFixed(2)} | Your guess: ${state.lastGuess!.toFixed(2)}</div>
            <div className="pg-result-points">+{state.roundScore} points</div>
          </div>
          <button
            className="pg-btn next"
            onClick={() => dispatch({ type: "next" } as PriceGuessAction)}
          >
            {state.currentIndex + 1 >= state.items.length ? "See Results" : "Next Item"}
          </button>
        </>
      )}
    </div>
  );
}
