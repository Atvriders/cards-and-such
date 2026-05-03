import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SwarmDefenseState, SwarmDefenseSettings } from "./state.js";
import { reducer, isTerminal } from "./state.js";
import "./SwarmDefense.css";

const COLS = 10;
const ROWS = 9;
const BASE_ROW = 8;

export function SwarmDefense({ state, dispatch, onGameOver }: GameProps<SwarmDefenseState, SwarmDefenseSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (terminal) {
      onGameOver(terminal.score);
      return;
    }
    const ms = state.settings.difficulty === "easy" ? 700 : state.settings.difficulty === "hard" ? 300 : 500;
    intervalRef.current = setInterval(() => dispatch({ type: "tick" }), ms);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [terminal, state.settings.difficulty, dispatch, onGameOver]);

  const cells: JSX.Element[] = [];
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const hasTower = state.towers.includes(col);
      const enemies = state.enemies.filter(e => e.x === col && e.y === row);
      const isBase = row === BASE_ROW;
      const isSelected = state.towerCol === col;

      cells.push(
        <div
          key={`${row}-${col}`}
          className={[
            "sd-cell",
            hasTower ? "tower" : "",
            isBase ? "base-row" : "",
            isSelected ? "selected-col" : "",
          ].join(" ")}
          onClick={() => dispatch({ type: "selectCol", col })}
        >
          {hasTower && row === 4 && <span className="sd-tower-icon">🗼</span>}
          {enemies.map(e => (
            <span key={e.id} className="sd-enemy" title={`HP: ${e.hp}`}>👾</span>
          ))}
          {isBase && !hasTower && col === 0 && <span style={{ fontSize: "0.6rem", color: "#e74c3c" }}>BASE</span>}
        </div>
      );
    }
  }

  return (
    <div className="swarm-defense">
      <div className="sd-hud">
        <span>Wave: {state.wave}</span>
        <span>Base HP: {state.baseHp}</span>
        <span>Gold: {state.gold}</span>
        <span>Score: {state.score}</span>
        <span>Enemies: {state.enemies.length}</span>
      </div>

      <div className="sd-grid">{cells}</div>

      <div className="sd-hint">
        Click a column to select it, then Build Tower (costs 5 gold). Towers fire at enemies passing through their column.
      </div>

      <div className="sd-controls">
        <button data-testid="hint-target-swarm-defense-action"
          disabled={state.towerCol === null || state.gold < 5 || (state.towerCol !== null && state.towers.includes(state.towerCol))}
          onClick={() => dispatch({ type: "buildTower" })}
        >
          Build Tower (5g) {state.towerCol !== null ? `— Col ${state.towerCol + 1}` : ""}
        </button>
      </div>

      {state.gameOver && (
        <>
          <div className="sd-game-over">Base destroyed! Score: {state.score}</div>
          <button onClick={() => dispatch({ type: "restart" })}>Play Again</button>
        </>
      )}
    </div>
  );
}
