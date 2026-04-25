import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CookieClickerState, CookieClickerSettings } from "./state.js";
import { isTerminal, upgradeNextCost } from "./state.js";
import "./CookieClickerMini.css";

export function CookieClickerMini({
  state,
  dispatch,
  onGameOver,
}: GameProps<CookieClickerState, CookieClickerSettings>): JSX.Element {
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

  const progress = Math.min(state.cookies / state.goal, 1) * 100;
  const cost = upgradeNextCost(state);
  const canUpgrade = state.cookies >= cost;

  return (
    <div className="ccm-game">
      <div className="ccm-title">Cookie Clicker Mini</div>

      <div className="ccm-cookie-count">{Math.floor(state.cookies)} 🍪</div>
      <div className="ccm-goal">Goal: {state.goal} cookies</div>

      <div className="ccm-progress-bar">
        <div className="ccm-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {!state.gameOver && (
        <>
          <button className="ccm-cookie-btn" onClick={() => dispatch({ type: "click" })}>
            🍪
          </button>

          <div className="ccm-stats">
            <span>+{state.cps}/click</span>
            <span>+{state.autoPerTick}/sec</span>
            <span>Upgrades: {state.upgrades}</span>
          </div>

          <button
            className="ccm-upgrade-btn"
            onClick={() => dispatch({ type: "upgrade" })}
            disabled={!canUpgrade}
          >
            Upgrade (+2/click, +1/sec) — {cost} 🍪
          </button>
        </>
      )}

      {state.gameOver && (
        <div className="ccm-game-over">
          You baked {state.goal} cookies!<br />
          <span style={{ fontSize: "0.85rem", opacity: 0.75 }}>
            Clicks: {state.clicks} | Upgrades: {state.upgrades}
          </span>
        </div>
      )}
    </div>
  );
}
