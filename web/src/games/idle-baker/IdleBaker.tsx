import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { IdleBakerState, IdleBakerSettings } from "./state.js";
import { isTerminal, ovenCost, assistantCost } from "./state.js";
import "./IdleBaker.css";

export function IdleBaker({
  state,
  dispatch,
  onGameOver,
}: GameProps<IdleBakerState, IdleBakerSettings>): JSX.Element {
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

  const progress = Math.min(state.pastries / state.goal, 1) * 100;
  const oCost = ovenCost(state.ovens);
  const aCost = assistantCost(state.assistants);
  const passive = state.assistants * state.ovens;

  return (
    <div className="ibk-game">
      <div className="ibk-title">Idle Baker</div>
      <div className="ibk-stats">
        <span className="ibk-pastries">🥐 {Math.floor(state.pastries)} pastries</span>
        <span>Goal: {state.goal}</span>
      </div>
      <div className="ibk-progress-bar">
        <div className="ibk-progress-fill" style={{ width: `${progress}%` }} />
      </div>
      {!state.gameOver && (
        <>
          <button className="ibk-bake-btn" onClick={() => dispatch({ type: "bake" })}>
            🥐
          </button>
          <div className="ibk-info">
            <span>+{state.bakePower * state.ovens}/bake</span>
            <span>Ovens: {state.ovens}</span>
            <span>Assistants: {state.assistants}</span>
            <span>+{passive}/sec</span>
          </div>
          <button
            className="ibk-btn"
            onClick={() => dispatch({ type: "buyOven" })}
            disabled={state.pastries < oCost}
          >
            Buy Oven (×bake) — {oCost} 🥐
          </button>
          <button
            className="ibk-btn"
            onClick={() => dispatch({ type: "hireAssistant" })}
            disabled={state.pastries < aCost}
          >
            Hire Assistant (+1 power) — {aCost} 🥐
          </button>
        </>
      )}
      {state.gameOver && (
        <div className="ibk-game-over">
          Bakery complete! {state.goal} pastries baked!<br />
          <span style={{ fontSize: "0.85rem", opacity: 0.75 }}>
            Ovens: {state.ovens} | Assistants: {state.assistants}
          </span>
        </div>
      )}
    </div>
  );
}
