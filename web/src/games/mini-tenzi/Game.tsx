import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MiniTenziState, MiniTenziAction, MiniTenziSettings } from "./state.js";
import { isTerminal, MAX_ROLLS, elapsedMs } from "./state.js";
import { Die } from "../../engines/dice/Die.js";
import "./Game.css";

export function MiniTenziGame({ state, dispatch, onGameOver }: GameProps<MiniTenziState, MiniTenziSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);

  // ticker for live elapsed display while playing
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (state.phase !== "play") return;
    if (state.startTimeMs === 0) {
      // kick start the timer
      dispatch({ type: "tick", nowMs: Date.now() } as MiniTenziAction);
    }
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [state.phase, state.startTimeMs, dispatch]);

  if (state.phase !== "play") {
    const elapsed = elapsedMs(state, now);
    const won = state.phase === "won";
    return (
      <div className="tenzi-wrap tenzi-theme">
        <div className={`tenzi-done ${won ? "win" : "lose"}`}>
          <h2>{won ? "TENZI!" : "Out of Rolls"}</h2>
          <div className="tenzi-final">{t?.score ?? 0}</div>
          <div className="tenzi-final-label">points</div>
          <div className="tenzi-meta">
            <span>{state.rolls} rolls</span>
            <span>{(elapsed / 1000).toFixed(1)}s</span>
          </div>
        </div>
      </div>
    );
  }

  const elapsed = elapsedMs(state, now);
  const matched = state.dice.filter((d) => d === state.target).length;

  return (
    <div className="tenzi-wrap tenzi-theme">
      <header className="tenzi-header">
        <div className="tenzi-stat">
          <span className="tenzi-stat-label">Target</span>
          <span className="tenzi-stat-value tenzi-target-pip">
            <Die value={state.target} />
          </span>
        </div>
        <div className="tenzi-stat">
          <span className="tenzi-stat-label">Matched</span>
          <span className="tenzi-stat-value">{matched}/10</span>
        </div>
        <div className="tenzi-stat">
          <span className="tenzi-stat-label">Rolls</span>
          <span className="tenzi-stat-value">{state.rolls}/{MAX_ROLLS}</span>
        </div>
        <div className="tenzi-stat">
          <span className="tenzi-stat-label">Time</span>
          <span className="tenzi-stat-value">{(elapsed / 1000).toFixed(1)}s</span>
        </div>
      </header>

      <div className="tenzi-board">
        <div className="tenzi-dice">
          {state.dice.map((d, i) => (
            <button
              key={i}
              className={`tenzi-die ${state.held[i] ? "held" : ""} ${d === state.target ? "match" : ""}`}
              onClick={() => dispatch({ type: "toggle", idx: i } as MiniTenziAction)}
              aria-label={`die ${i + 1} showing ${d}`}
            >
              <Die value={d} kept={!!state.held[i]} />
            </button>
          ))}
        </div>
      </div>

      <div className="tenzi-controls">
        <button data-testid="hint-target-mini-tenzi-roll" className="tenzi-btn" onClick={() => dispatch({ type: "roll", nowMs: Date.now() } as MiniTenziAction)}>
          Roll Unheld
        </button>
      </div>

      <footer className="tenzi-help">
        <span>Tap a die to hold/unhold</span>
        <span>Rolls auto-hold matches</span>
        <span>All 10 = TENZI</span>
      </footer>
    </div>
  );
}
