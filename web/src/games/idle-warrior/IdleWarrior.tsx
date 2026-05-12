import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { IdleWarriorState, IdleWarriorSettings } from "./state.js";
import { isTerminal, recruitCost, trainCost } from "./state.js";
import "./IdleWarrior.css";

export function IdleWarrior({
  state,
  dispatch,
  onGameOver,
}: GameProps<IdleWarriorState, IdleWarriorSettings>): JSX.Element {
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

  const progress = Math.min(state.enemiesDefeated / state.targetEnemies, 1) * 100;
  const rCost = recruitCost(state.soldiers);
  const tCost = trainCost(state.attackPower);

  return (
    <div className="iwar-game">
      <div className="iwar-title">Idle Warrior</div>
      <div className="iwar-stats">
        <span className="iwar-gold">💰 {Math.floor(state.gold)} gold</span>
        <span>Enemies: {state.enemiesDefeated}/{state.targetEnemies}</span>
      </div>
      <div className="iwar-progress-bar">
        <div className="iwar-progress-fill" style={{ width: `${progress}%` }} />
      </div>
      {!state.gameOver && (
        <>
          <button className="iwar-strike-btn" title="Strike enemy" onClick={() => dispatch({ type: "strike" })}>
            ⚔️
          </button>
          <div className="iwar-info">
            <span>Attack: {state.attackPower}</span>
            <span>Soldiers: {state.soldiers}</span>
            <span>+{state.soldiers}/sec</span>
          </div>
          <button
            className="iwar-btn"
            onClick={() => dispatch({ type: "recruit" })}
            disabled={state.gold < rCost}
          >
            Recruit Soldier (+1/sec) — {rCost} gold
          </button>
          <button
            className="iwar-btn"
            onClick={() => dispatch({ type: "train" })}
            disabled={state.gold < tCost}
          >
            Train (+1 attack) — {tCost} gold
          </button>
        </>
      )}
      {state.gameOver && (
        <div className="iwar-game-over">
          Victory! All {state.targetEnemies} enemies defeated!<br />
          <span style={{ fontSize: "0.85rem", opacity: 0.75 }}>
            Gold: {Math.floor(state.gold)} | Soldiers: {state.soldiers}
          </span>
        </div>
      )}
    </div>
  );
}
