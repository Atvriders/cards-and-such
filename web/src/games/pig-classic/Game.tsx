import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PigClassicState, PigClassicAction, PigClassicSettings } from "./state.js";
import { isTerminal, TARGET, MAX_TURNS } from "./state.js";
import { Die } from "../../engines/dice/Die.js";
import "./Game.css";

export function PigClassicGame({ state, dispatch, onGameOver }: GameProps<PigClassicState, PigClassicSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (state.phase !== "playing") return;
      if (e.key === "r" || e.key === "R" || e.key === " ") {
        e.preventDefault();
        dispatch({ type: "roll" } as PigClassicAction);
      } else if ((e.key === "b" || e.key === "B") && state.turnTotal > 0) {
        e.preventDefault();
        dispatch({ type: "bank" } as PigClassicAction);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [dispatch, state.phase, state.turnTotal]);

  if (state.phase === "done") {
    const reachedTarget = state.totalScore >= TARGET;
    return (
      <div className="pig-wrap pig-theme">
        <div className={`pig-done ${reachedTarget ? "win" : "lose"}`}>
          <h2>{reachedTarget ? "You Hit 100!" : "Out of Turns"}</h2>
          <div className="pig-final">{state.totalScore}</div>
          <div className="pig-final-label">final score</div>
          <div className="pig-meta">Best turn: {state.bestTurn} pts in turn {state.turn - 1}</div>
        </div>
      </div>
    );
  }

  const pct = Math.min(100, (state.totalScore / TARGET) * 100);
  const dieValue = (state.lastRoll || 1) as 1 | 2 | 3 | 4 | 5 | 6;

  return (
    <div className="pig-wrap pig-theme">
      <header className="pig-header">
        <div className="pig-stat">
          <div className="pig-stat-label">Banked</div>
          <div className="pig-stat-value">{state.totalScore}<span className="pig-stat-target">/{TARGET}</span></div>
        </div>
        <div className="pig-stat">
          <div className="pig-stat-label">Turn</div>
          <div className="pig-stat-value">{state.turn}<span className="pig-stat-target">/{MAX_TURNS}</span></div>
        </div>
        <div className="pig-stat pig-stat-turn">
          <div className="pig-stat-label">This turn</div>
          <div className="pig-stat-value">{state.turnTotal}</div>
        </div>
      </header>

      <div className="pig-progress">
        <div className="pig-progress-fill" style={{ width: `${pct}%` }} />
      </div>

      <div className="pig-arena">
        <div className={`pig-die-stage ${state.lastWasOne ? "danger" : ""}`}>
          {state.lastRoll === 0 ? (
            <div className="pig-die-placeholder">Roll to begin</div>
          ) : (
            <Die value={dieValue} />
          )}
        </div>
        {state.rollHistory.length > 0 && (
          <div className="pig-history">
            {state.rollHistory.map((r, i) => (
              <span key={i} className="pig-chip">{r}</span>
            ))}
            <span className="pig-history-sum">= {state.turnTotal}</span>
          </div>
        )}
        {state.lastWasOne && (
          <div className="pig-bust">Pigged! Rolled a 1, turn lost.</div>
        )}
      </div>

      <div className="pig-controls">
        <button className="pig-btn pig-btn-roll" aria-label="Roll die (R)" onClick={() => dispatch({ type: "roll" } as PigClassicAction)}>
          Roll Die
        </button>
        <button
          className="pig-btn pig-btn-bank"
          aria-label={`Bank ${state.turnTotal} points (B)`}
          disabled={state.turnTotal === 0}
          onClick={() => dispatch({ type: "bank" } as PigClassicAction)}
        >
          Bank {state.turnTotal}
        </button>
      </div>

      <footer className="pig-help">
        <span>2-6 adds to turn-total</span>
        <span>Roll a 1: lose turn-total</span>
        <span>Bank: lock it in</span>
      </footer>
    </div>
  );
}
