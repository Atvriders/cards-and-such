import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FarkleMiniState, FarkleMiniAction, FarkleMiniSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import { Die } from "../../engines/dice/Die.js";
import "./Game.css";

export function FarkleMiniGame({ state, dispatch, onGameOver }: GameProps<FarkleMiniState, FarkleMiniSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);

  if (state.phase === "done") {
    return (
      <div className="farkle-wrap">
        <div className="farkle-done">
          <h2>Game Over</h2>
          <div className="farkle-final">{state.totalScore}</div>
          <div className="farkle-final-label">total points</div>
        </div>
      </div>
    );
  }

  const remainingDice = state.dice.filter((d) => d.status !== "kept").length || 6;
  const canBank = state.phase === "decide" && (state.roundBank + state.pendingScore) > 0 &&
    (state.dice.filter((d) => d.status === "picked").length === 0 || state.pendingScore > 0);
  const canRoll = state.phase === "decide" && state.pendingScore > 0;

  return (
    <div className="farkle-wrap">
      <header className="farkle-header">
        <div className="farkle-round">Round {state.round} / {TOTAL_ROUNDS}</div>
        <div className="farkle-totals">
          <div className="farkle-stat">
            <span className="farkle-stat-label">Total</span>
            <span className="farkle-stat-value">{state.totalScore}</span>
          </div>
          <div className="farkle-stat farkle-stat-bank">
            <span className="farkle-stat-label">Round bank</span>
            <span className="farkle-stat-value">{state.roundBank}</span>
          </div>
          <div className="farkle-stat farkle-stat-pending">
            <span className="farkle-stat-label">Picked</span>
            <span className="farkle-stat-value">+{state.pendingScore}</span>
          </div>
        </div>
      </header>

      <div className="farkle-board">
        {state.phase === "rollReady" && (
          <div className="farkle-prompt">Roll all 6 dice to start round {state.round}.</div>
        )}
        {state.dice.length > 0 && (
          <div className="farkle-dice">
            {state.dice.map((d, i) => (
              <div
                key={i}
                className={`farkle-die-wrap ${d.status}`}
                onClick={() => state.phase === "decide" && d.status !== "kept"
                  ? dispatch({ type: "togglePick", idx: i } as FarkleMiniAction)
                  : undefined}
              >
                <Die value={d.value} kept={d.status === "picked"} />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="farkle-controls">
        {state.phase === "rollReady" && (
          <button className="farkle-btn farkle-btn-primary" onClick={() => dispatch({ type: "roll" } as FarkleMiniAction)}>
            Roll 6 Dice
          </button>
        )}
        {state.phase === "decide" && (
          <>
            <button
              className="farkle-btn farkle-btn-primary"
              disabled={!canRoll}
              onClick={() => dispatch({ type: "roll" } as FarkleMiniAction)}
            >
              Set aside &amp; roll {Math.max(1, remainingDice - state.dice.filter((d) => d.status === "picked").length)}
            </button>
            <button
              className="farkle-btn farkle-btn-bank"
              disabled={!canBank}
              onClick={() => dispatch({ type: "bank" } as FarkleMiniAction)}
            >
              Bank {state.roundBank + state.pendingScore}
            </button>
          </>
        )}
        {state.phase === "scored" && (
          <>
            <div className={`farkle-result ${state.lastFarkle ? "farkle-result-bust" : "farkle-result-win"}`}>
              {state.lastFarkle ? "FARKLE — round lost" : `Banked ${state.lastBanked}`}
            </div>
            <button className="farkle-btn farkle-btn-primary" onClick={() => dispatch({ type: "next" } as FarkleMiniAction)}>
              {state.round >= TOTAL_ROUNDS ? "Finish" : `Round ${state.round + 1}`}
            </button>
          </>
        )}
      </div>

      <footer className="farkle-help">
        <span><b>1</b>=100</span>
        <span><b>5</b>=50</span>
        <span>Triple = N×100 (1s = 1000)</span>
        <span>1-2-3-4-5-6 = 1500</span>
      </footer>
    </div>
  );
}
