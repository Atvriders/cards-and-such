import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { IdleMinerState, IdleMinerSettings } from "./state.js";
import { isTerminal, getHireCost } from "./state.js";
import "./IdleMiner.css";

export function IdleMiner({
  state,
  dispatch,
  onGameOver,
}: GameProps<IdleMinerState, IdleMinerSettings>): JSX.Element {
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

  const progress = (state.depth / state.targetDepth) * 100;
  const hireCost = getHireCost(state);
  const canHire = state.gold >= hireCost;

  return (
    <div className="im-game">
      <div className="im-title">Idle Miner</div>

      <div className="im-stats">
        <span className="im-gold">⛏ {state.gold} gold</span>
        <span className="im-depth-label">Depth: {state.depth}/{state.targetDepth}</span>
      </div>

      <div className="im-depth-bar">
        <div className="im-depth-fill" style={{ width: `${progress}%` }} />
      </div>

      {!state.gameOver && (
        <>
          <button className="im-mine-btn" onClick={() => dispatch({ type: "dig" })}>
            ⛏
          </button>

          <div className="im-info">
            <span>+{state.pickaxePower}/dig</span>
            <span>Miners: {state.autoMiners}</span>
            <span>+{state.autoMiners}/sec</span>
          </div>

          <button
            className="im-hire-btn"
            onClick={() => dispatch({ type: "hire" })}
            disabled={!canHire}
          >
            Hire Miner (+1/sec, +1/dig) — {hireCost} gold
          </button>
        </>
      )}

      {state.gameOver && (
        <div className="im-game-over">
          You reached depth {state.targetDepth}!<br />
          <span style={{ fontSize: "0.85rem", opacity: 0.75 }}>
            Gold: {state.gold} | Miners: {state.autoMiners}
          </span>
        </div>
      )}
    </div>
  );
}
