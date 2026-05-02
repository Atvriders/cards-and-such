import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BountyHunterState, BountyHunterAction } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function BountyHunterGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<BountyHunterState, Record<string, never>>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const d = (a: BountyHunterAction) => dispatch(a);
  const healthPct = state.health;

  return (
    <div className="bh-wrap">
      <div className="bh-header">
        <span className="bh-title">🎯 Bounty Hunter</span>
        <span>Round {Math.min(state.round, TOTAL_ROUNDS)}/{TOTAL_ROUNDS}</span>
        <span>❤️ {state.health}/100</span>
        <span className="bh-credits">${state.credits}</span>
      </div>

      <div className="bh-health-bar">
        <div className="bh-health-fill" style={{ width: `${healthPct}%` }} />
      </div>

      {state.phase === "hunt" && (
        <div>
          <div className="bh-target">
            <div className="bh-target-name">🦹 {state.target.name}</div>
            <div className="bh-bounty">Bounty: ${state.target.bounty}</div>
            <div className="bh-ratings">
              <span className="bh-rating">Evasion: {Math.round(state.target.evasion * 100)}%</span>
              <span className="bh-rating">Danger: {Math.round(state.target.danger * 100)}%</span>
            </div>
          </div>
          <div className="bh-actions">
            <button data-testid="hint-target-bounty-hunter-action" className="bh-btn bh-pursue" onClick={() => d({ type: "pursue" })}>
              Pursue
            </button>
            <button className="bh-btn bh-skip" onClick={() => d({ type: "skip" })}>
              Skip
            </button>
          </div>
        </div>
      )}

      {state.phase === "result" && (
        <div>
          <div className="bh-result">
            <div className="bh-result-text">{state.lastResult}</div>
          </div>
          <button className="bh-next-btn" onClick={() => d({ type: "nextRound" })}>
            Next Target →
          </button>
        </div>
      )}

      {state.phase === "done" && (
        <div className="bh-done">
          <div className="bh-final">Credits: ${state.credits}</div>
          {state.health <= 0 && <div style={{ color: "#f44336" }}>KO'd in the field!</div>}
          <div>{state.credits >= 600 ? "🏆 Elite Hunter!" : state.credits >= 300 ? "👍 Solid haul!" : "🎯 Keep training!"}</div>
        </div>
      )}

      {state.log.length > 0 && (
        <div className="bh-log">
          {[...state.log].reverse().map((l, i) => <div key={i} className="bh-log-line">{l}</div>)}
        </div>
      )}
    </div>
  );
}
