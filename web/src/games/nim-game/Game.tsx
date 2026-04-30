import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { NimGameState, NimGameAction, NimGameSettings } from "./state.js";
import { isTerminal, START_STICKS } from "./state.js";
import "./Game.css";

export function NimGameGame({ state, dispatch, onGameOver }: GameProps<NimGameState, NimGameSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);

  if (state.phase === "done") {
    const won = state.result === "P";
    return (
      <div className="nimg-wrap">
        <div className={`nimg-banner ${won ? "win" : "lose"}`}>
          <h2 className="nimg-title">{won ? "You Win!" : "You Lose."}</h2>
          <div className="nimg-final">{state.score} pts</div>
          {state.lastTake && (
            <div className="nimg-sub">
              {state.lastTake.who === "P" ? "You" : "CPU"} took the final stick.
            </div>
          )}
          <button className="nimg-btn" onClick={() => dispatch({ type: "reset" } as NimGameAction)}>
            Play Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="nimg-wrap">
      <div className="nimg-info">Misère Nim — take 1, 2, or 3. Avoid the last stick.</div>
      <div className="nimg-stats">
        <div className="nimg-stat">
          <span className="nimg-label">Sticks</span>
          <span className="nimg-value">{state.sticks} / {START_STICKS}</span>
        </div>
        {state.lastTake && state.lastTake.who === "C" && (
          <div className="nimg-stat">
            <span className="nimg-label">CPU took</span>
            <span className="nimg-value">{state.lastTake.n}</span>
          </div>
        )}
      </div>
      <div className="nimg-pile">
        {Array.from({ length: state.sticks }).map((_, i) => (
          <span key={i} className="nimg-stick" style={{ animationDelay: `${i * 18}ms` }} />
        ))}
      </div>
      <div className="nimg-actions">
        {[1, 2, 3].map((n) => (
          <button
            key={n}
            className="nimg-btn"
            disabled={n > state.sticks}
            onClick={() => dispatch({ type: "take", n } as NimGameAction)}
          >
            Take {n}
          </button>
        ))}
      </div>
    </div>
  );
}
