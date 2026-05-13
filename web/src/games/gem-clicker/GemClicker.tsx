import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { GemClickerState, GemClickerSettings } from "./state.js";
import { isTerminal, minerCost, refineryCost } from "./state.js";
import "./GemClicker.css";

export function GemClicker({
  state,
  dispatch,
  onGameOver,
}: GameProps<GemClickerState, GemClickerSettings>): JSX.Element {
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

  const progress = Math.min(state.gems / state.goal, 1) * 100;
  const mCost = minerCost(state.miners);
  const rCost = refineryCost(state.refineries);

  return (
    <div className="gc-game fade-in">
      <div className="gc-title">Gem Clicker</div>
      <div className="gc-stats">
        <span className="gc-gems">💎 {Math.floor(state.gems)} gems</span>
        <span>Goal: {state.goal}</span>
      </div>
      <div className="gc-progress-bar">
        <div className="gc-progress-fill" style={{ width: `${progress}%` }} />
      </div>
      {!state.gameOver && (
        <>
          <button className="gc-click-btn" onClick={() => dispatch({ type: "click" })} title="Mine gem">
            💎
          </button>
          <div className="gc-info">
            <span>+{state.clickPower * state.refineries}/click</span>
            <span>Miners: {state.miners}</span>
            <span>Refineries: {state.refineries}</span>
            <span>+{state.miners * state.refineries}/sec</span>
          </div>
          <button
            className="gc-btn"
            onClick={() => dispatch({ type: "hireMiner" })}
            disabled={state.gems < mCost}
          >
            Hire Miner (+1/sec) — {mCost} 💎
          </button>
          <button
            className="gc-btn"
            onClick={() => dispatch({ type: "buildRefinery" })}
            disabled={state.gems < rCost}
          >
            Build Refinery (×output) — {rCost} 💎
          </button>
        </>
      )}
      {state.gameOver && (
        <div className="gc-game-over">
          Gem vault full! {state.goal} gems collected!<br />
          <span style={{ fontSize: "0.85rem", opacity: 0.75 }}>
            Miners: {state.miners} | Refineries: {state.refineries}
          </span>
        </div>
      )}
    </div>
  );
}
