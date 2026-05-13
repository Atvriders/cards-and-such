import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PrestigeClickerState, PrestigeClickerSettings } from "./state.js";
import { isTerminal, autoClickerCost, prestigeMultiplier } from "./state.js";
import "./PrestigeClicker.css";

export function PrestigeClicker({
  state,
  dispatch,
  onGameOver,
}: GameProps<PrestigeClickerState, PrestigeClickerSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  useEffect(() => {
    if (state.gameOver) return;
    tickRef.current = setInterval(() => {
      dispatch({ type: "tick" });
    }, 1000);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [state.gameOver, dispatch]);

  const progress = Math.min(state.points / state.prestigeGoal, 1) * 100;
  const acCost = autoClickerCost(state.autoClickers);
  const mult = prestigeMultiplier(state.prestiges);
  const canPrestige = state.points >= state.prestigeGoal;

  return (
    <div className="pc-game fade-in">
      <div className="pc-title">Prestige Clicker</div>
      <div className="pc-stats">
        <span className="pc-pts">⭐ {Math.floor(state.points)} pts</span>
        <span>Prestige: {state.prestiges}/3</span>
        <span>×{mult} multiplier</span>
      </div>
      <div className="pc-progress-bar">
        <div className="pc-progress-fill" style={{ width: `${progress}%` }} />
      </div>
      {!state.gameOver && (
        <>
          <button className="pc-click-btn" onClick={() => dispatch({ type: "click" })} title="Earn points">
            ⭐
          </button>
          <div className="pc-info">
            <span>+{state.clickPower * mult}/click</span>
            <span>AutoClickers: {state.autoClickers}</span>
            <span>+{state.autoClickers * mult}/sec</span>
            <span>Total: {Math.floor(state.totalEarned)}</span>
          </div>
          <button
            className="pc-btn"
            onClick={() => dispatch({ type: "buyAutoClicker" })}
            disabled={state.points < acCost}
          >
            Buy AutoClicker — {acCost} pts
          </button>
          <button
            className="pc-btn pc-prestige-btn"
            onClick={() => dispatch({ type: "prestige" })}
            disabled={!canPrestige}
          >
            Prestige! (reset, ×2 forever) — needs {state.prestigeGoal} pts
          </button>
        </>
      )}
      {state.gameOver && (
        <div className="pc-game-over">
          Full prestige achieved after 3 resets!<br />
          <span style={{ fontSize: "0.85rem", opacity: 0.75 }}>
            Total earned: {Math.floor(state.totalEarned)}
          </span>
        </div>
      )}
    </div>
  );
}
