import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { GoldRushIdleState, GoldRushIdleSettings } from "./state.js";
import { isTerminal, prospectorCost, claimCost } from "./state.js";
import "./GoldRushIdle.css";

export function GoldRushIdle({
  state,
  dispatch,
  onGameOver,
}: GameProps<GoldRushIdleState, GoldRushIdleSettings>): JSX.Element {
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

  const progress = Math.min(state.nuggets / state.goal, 1) * 100;
  const pCost = prospectorCost(state.prospectors);
  const cCost = claimCost(state.claims);

  return (
    <div className="gri-game">
      <div className="gri-title">Gold Rush Idle</div>
      <div className="gri-stats">
        <span className="gri-gold">✨ {Math.floor(state.nuggets)} nuggets</span>
        <span>Goal: {state.goal}</span>
      </div>
      <div className="gri-progress-bar">
        <div className="gri-progress-fill" style={{ width: `${progress}%` }} />
      </div>
      {!state.gameOver && (
        <>
          <button className="gri-pan-btn" onClick={() => dispatch({ type: "pan" })}>
            🪙
          </button>
          <div className="gri-info">
            <span>+{state.panPower * state.claims}/pan</span>
            <span>Prospectors: {state.prospectors}</span>
            <span>Claims: {state.claims}</span>
            <span>+{state.prospectors * state.claims}/sec</span>
          </div>
          <button
            className="gri-btn"
            onClick={() => dispatch({ type: "hireProspector" })}
            disabled={state.nuggets < pCost}
          >
            Hire Prospector (+1/sec) — {pCost} nuggets
          </button>
          <button
            className="gri-btn"
            onClick={() => dispatch({ type: "stakeClaim" })}
            disabled={state.nuggets < cCost}
          >
            Stake Claim (×yield) — {cCost} nuggets
          </button>
        </>
      )}
      {state.gameOver && (
        <div className="gri-game-over">
          Strike it rich! {state.goal} nuggets found!<br />
          <span style={{ fontSize: "0.85rem", opacity: 0.75 }}>
            Prospectors: {state.prospectors} | Claims: {state.claims}
          </span>
        </div>
      )}
    </div>
  );
}
