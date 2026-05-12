import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { IdleFarmerState, IdleFarmerSettings } from "./state.js";
import { isTerminal, farmerCost, fieldCost } from "./state.js";
import "./IdleFarmer.css";

export function IdleFarmer({
  state,
  dispatch,
  onGameOver,
}: GameProps<IdleFarmerState, IdleFarmerSettings>): JSX.Element {
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

  const progress = Math.min(state.crops / state.goal, 1) * 100;
  const fCost = farmerCost(state.autoFarmers);
  const fldCost = fieldCost(state.fields);

  return (
    <div className="if-game">
      <div className="if-title">Idle Farmer</div>
      <div className="if-stats">
        <span className="if-crops">🌾 {Math.floor(state.crops)} crops</span>
        <span>Goal: {state.goal}</span>
      </div>
      <div className="if-progress-bar">
        <div className="if-progress-fill" style={{ width: `${progress}%` }} />
      </div>
      {!state.gameOver && (
        <>
          <button className="if-harvest-btn" title="Harvest crops" onClick={() => dispatch({ type: "harvest" })}>
            🌾
          </button>
          <div className="if-info">
            <span>+{state.harvestPower * state.fields}/harvest</span>
            <span>Farmers: {state.autoFarmers}</span>
            <span>Fields: {state.fields}</span>
            <span>+{state.autoFarmers * state.fields}/sec</span>
          </div>
          <button
            className="if-btn"
            onClick={() => dispatch({ type: "buyFarmer" })}
            disabled={state.crops < fCost}
          >
            Hire Farmer (+1/sec) — {fCost} 🌾
          </button>
          <button
            className="if-btn"
            onClick={() => dispatch({ type: "buyField" })}
            disabled={state.crops < fldCost}
          >
            Buy Field (×harvest) — {fldCost} 🌾
          </button>
        </>
      )}
      {state.gameOver && (
        <div className="if-game-over">
          Harvest complete! {state.goal} crops gathered!<br />
          <span style={{ fontSize: "0.85rem", opacity: 0.75 }}>
            Farmers: {state.autoFarmers} | Fields: {state.fields}
          </span>
        </div>
      )}
    </div>
  );
}
