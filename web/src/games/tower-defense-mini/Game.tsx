import { useState, useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TowerDefenseMiniState, TowerDefenseMiniAction, TowerType } from "./state.js";
import { isTerminal, GRID_COLS, GRID_ROWS, TOWER_DEFS, TOTAL_WAVES, BASE_HP } from "./state.js";
import { useConfirm } from "../../platform/ConfirmDialog.js";
import "./Game.css";

const TOWER_EMOJI: Record<TowerType, string> = {
  arrow: "🏹", cannon: "💣", slow: "🧊", lightning: "⚡",
};

const CELL_EMOJI: Record<string, string> = {
  path: "▪", grass: " ", base: "🏰",
  arrow: "🏹", cannon: "💣", slow: "🧊", lightning: "⚡",
};

export function TowerDefenseMini({ state, dispatch, onGameOver }: GameProps<TowerDefenseMiniState, Record<string, never>>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const [selectedTower, setSelectedTower] = useState<TowerType | null>(null);
  const showConfirm = useConfirm();
  const d = (a: TowerDefenseMiniAction) => dispatch(a);

  async function handleCellClick(idx: number): Promise<void> {
    const cell = state.grid[idx];
    if (cell === "grass" && selectedTower && state.phase === "build") {
      d({ type: "placeTower", cellIndex: idx, towerType: selectedTower });
      setSelectedTower(null);
    } else if (cell !== "grass" && cell !== "path" && cell !== "base" && state.phase === "build") {
      const ok = await showConfirm({
        title: "Sell tower?",
        message: "Sell this tower for half price?",
        confirmLabel: "Sell",
      });
      if (ok) {
        d({ type: "sellTower", cellIndex: idx });
      }
    }
  }

  const hpPct = (state.baseHp / BASE_HP) * 100;

  return (
    <div className="td-wrap fade-in">
      <div className="td-header">
        <span className="td-title">🗼 Tower Defense</span>
        <span className="td-wave">Wave {state.wave}/{TOTAL_WAVES}</span>
        <span className="td-gold">Gold: {state.gold}</span>
        <span className="td-hp">Base: {state.baseHp}/{BASE_HP}</span>
      </div>

      <div className="td-base-bar">
        <div className="td-base-fill" style={{ width: `${hpPct}%` }} />
      </div>

      {state.phase === "build" && (
        <div className="td-towers-palette">
          {(Object.keys(TOWER_DEFS) as TowerType[]).map(t => (
            <button key={t}
              className={`td-tower-btn ${selectedTower === t ? "td-tower-selected" : ""}`}
              disabled={state.gold < TOWER_DEFS[t].cost}
              onClick={() => setSelectedTower(selectedTower === t ? null : t)}>
              {TOWER_EMOJI[t]} {TOWER_DEFS[t].label} ({TOWER_DEFS[t].cost}g)
            </button>
          ))}
        </div>
      )}

      {selectedTower && <div className="td-hint">Click a green cell to place {TOWER_EMOJI[selectedTower]}</div>}

      <div className="td-grid" style={{ gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)` }}>
        {state.grid.map((cell, i) => {
          const tower = state.towers[i];
          return (
            <div key={i}
              className={`td-cell td-cell-${cell} ${selectedTower && cell === "grass" ? "td-cell-hover" : ""}`}
              onClick={() => { void handleCellClick(i); }}
              title={tower ? `${TOWER_DEFS[tower.type].label} (click to sell)` : cell}>
              {tower ? TOWER_EMOJI[tower.type] : CELL_EMOJI[cell] ?? ""}
            </div>
          );
        })}
      </div>

      {state.phase === "build" && (
        <button className="td-start-wave" onClick={() => d({ type: "startWave" })}>
          ▶ Send Wave {state.wave + 1}
        </button>
      )}

      {state.phase === "done" && <div className="td-done bounce-in">🏆 All {TOTAL_WAVES} waves survived! Base HP: {state.baseHp}</div>}
      {state.phase === "lost" && <div className="td-lost">💀 Base destroyed on wave {state.wave}!</div>}

      {state.log.length > 0 && (
        <div className="td-log">
          {[...state.log].reverse().slice(0, 5).map((l, i) => <div key={i} className="td-log-line">{l}</div>)}
        </div>
      )}
    </div>
  );
}
