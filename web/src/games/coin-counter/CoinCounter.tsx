import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CoinCounterState, CoinCounterSettings } from "./state.js";
import { isTerminal, COIN_EMOJI, COIN_VALUE } from "./state.js";
import "./CoinCounter.css";

export function CoinCounter({
  state,
  dispatch,
  onGameOver,
}: GameProps<CoinCounterState, CoinCounterSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  // Tick timer
  useEffect(() => {
    if (state.phase === "done") return;
    const id = setInterval(() => dispatch({ type: "tick" }), 1000);
    return () => clearInterval(id);
  }, [state.phase, dispatch]);

  function handleSubmit() {
    dispatch({ type: "submit" });
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  const coinLegend = Object.entries(COIN_VALUE)
    .map(([k, v]) => `${COIN_EMOJI[k as keyof typeof COIN_EMOJI]}=${v}¢`)
    .join("  ");

  return (
    <div className="coin-counter">
      <div className="cc-header">
        <div>✓ {state.correct} | ✗ {state.wrong} | 🔥 {state.streak}</div>
        <div className={`cc-timer${state.timeLeft > 15 ? " ok" : ""}`}>
          {state.timeLeft}s
        </div>
      </div>

      <div className="cc-coins">
        {state.coins.map(({ coin, count }, i) => (
          <div className="cc-coin-group" key={i}>
            <div className="cc-coin-icons">
              {Array.from({ length: count }, (_, j) => (
                <span key={j} className="cc-coin-icon">{COIN_EMOJI[coin]}</span>
              ))}
            </div>
            <div className="cc-coin-label">{count} × {COIN_VALUE[coin]}¢</div>
          </div>
        ))}
      </div>

      <div className="cc-question">How much is this worth in cents?</div>

      {state.phase === "playing" ? (
        <>
          <div className="cc-input-row">
            <input
              ref={inputRef}
              className="cc-input"
              type="number"
              min={0}
              value={state.userInput}
              onChange={(e) => dispatch({ type: "input", value: e.target.value })}
              onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
              autoFocus
              disabled={state.phase !== "playing"}
            />
            <span className="cc-unit">¢</span>
            <button data-testid="hint-target-coin-counter-action" className="cc-btn" onClick={handleSubmit}>Check</button>
          </div>

          {state.lastResult && (
            <div className={`cc-result ${state.lastResult}`}>
              {state.lastResult === "correct" ? "Correct! 🎉" : `Wrong — answer was ${state.answer === 0 ? "–" : state.answer}¢`}
            </div>
          )}
        </>
      ) : (
        <div className="cc-done">
          Time's up! Score: {Math.max(0, state.correct * 10 - state.wrong * 3)}
        </div>
      )}

      <div className="cc-stats">
        <div className="cc-stat">
          <div className="cc-stat-val" style={{ color: "#22a855" }}>{state.correct}</div>
          <div className="cc-stat-lbl">Correct</div>
        </div>
        <div className="cc-stat">
          <div className="cc-stat-val" style={{ color: "#ef4444" }}>{state.wrong}</div>
          <div className="cc-stat-lbl">Wrong</div>
        </div>
        <div className="cc-stat">
          <div className="cc-stat-val">{state.streak}</div>
          <div className="cc-stat-lbl">Streak</div>
        </div>
      </div>

      <div className="cc-legend">{coinLegend}</div>
    </div>
  );
}
