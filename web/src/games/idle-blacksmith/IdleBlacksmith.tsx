import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { IdleBlacksmithState, IdleBlacksmithSettings } from "./state.js";
import { isTerminal, helperCost, anvilCost } from "./state.js";
import "./IdleBlacksmith.css";

export function IdleBlacksmith({
  state,
  dispatch,
  onGameOver,
}: GameProps<IdleBlacksmithState, IdleBlacksmithSettings>): JSX.Element {
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

  const progress = Math.min(state.iron / state.goal, 1) * 100;
  const hCost = helperCost(state.helpers);
  const aCost = anvilCost(state.anvils);
  const passive = state.helpers + state.anvils * 2;

  return (
    <div className="ibs-game">
      <div className="ibs-title">Idle Blacksmith</div>
      <div className="ibs-stats">
        <span className="ibs-iron">⚒ {Math.floor(state.iron)} iron</span>
        <span>Goal: {state.goal}</span>
      </div>
      <div className="ibs-progress-bar">
        <div className="ibs-progress-fill" style={{ width: `${progress}%` }} />
      </div>
      {!state.gameOver && (
        <>
          <button className="ibs-forge-btn" title="Forge" onClick={() => dispatch({ type: "forge" })}>
            🔨
          </button>
          <div className="ibs-info">
            <span>+{state.forgePower}/forge</span>
            <span>Helpers: {state.helpers}</span>
            <span>Anvils: {state.anvils}</span>
            <span>+{passive}/sec</span>
          </div>
          <button
            className="ibs-btn"
            onClick={() => dispatch({ type: "hireHelper" })}
            disabled={state.iron < hCost}
          >
            Hire Helper (+2 power) — {hCost} iron
          </button>
          <button
            className="ibs-btn"
            onClick={() => dispatch({ type: "buyAnvil" })}
            disabled={state.iron < aCost}
          >
            Buy Anvil (+2/sec) — {aCost} iron
          </button>
        </>
      )}
      {state.gameOver && (
        <div className="ibs-game-over">
          Master smith! {state.goal} iron forged!<br />
          <span style={{ fontSize: "0.85rem", opacity: 0.75 }}>
            Helpers: {state.helpers} | Anvils: {state.anvils}
          </span>
        </div>
      )}
    </div>
  );
}
