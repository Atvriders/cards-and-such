import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TombOfKingsState, TombOfKingsAction, CellType } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

function cellEmoji(type: CellType): string {
  switch (type) {
    case "start":    return "S";
    case "exit":     return "E";
    case "treasure": return "G";
    case "trap":     return "!";
    case "monster":  return "M";
    case "shrine":   return "+";
    case "wall":     return "#";
    default:         return "";
  }
}

function cellClass(type: CellType, revealed: boolean, isPlayer: boolean): string {
  if (isPlayer) return "tok-cell tok-cell-player";
  if (!revealed) return "tok-cell tok-cell-hidden";
  return `tok-cell tok-cell-${type}`;
}

export function TombOfKings({ state, dispatch, onGameOver }: GameProps<TombOfKingsState, Record<string, never>>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const d = (a: TombOfKingsAction) => dispatch(a);
  const hpPct = Math.round((state.playerHp / state.playerMaxHp) * 100);

  return (
    <div className="tok-wrap">
      <div className="tok-header">
        <span className="tok-title">Tomb of Kings</span>
        <div className="tok-stats">
          <span>{state.gold}g</span>
          <span>{state.playerHp}/{state.playerMaxHp} HP</span>
          <span>{state.moves} moves</span>
        </div>
        <div className="tok-hp-bar" style={{ width: "100%", marginTop: 6 }}>
          <div className="tok-hp-fill" style={{ width: `${hpPct}%` }} />
        </div>
      </div>

      <div className="tok-grid">
        {state.grid.map((row, ri) =>
          row.map((cell, ci) => {
            const isPlayer = ri === state.playerRow && ci === state.playerCol;
            return (
              <div key={`${ri}-${ci}`} className={cellClass(cell.type, cell.revealed, isPlayer)}>
                {isPlayer ? "P" : (cell.revealed ? cellEmoji(cell.type) : "?")}
              </div>
            );
          })
        )}
      </div>

      {state.phase === "explore" && (
        <div className="tok-controls">
          <div className="tok-btn-empty" />
          <button className="tok-btn" onClick={() => d({ type: "move", dir: "up" })}>^</button>
          <div className="tok-btn-empty" />
          <button className="tok-btn" onClick={() => d({ type: "move", dir: "left" })}>{"<"}</button>
          <div className="tok-btn-empty" />
          <button className="tok-btn" onClick={() => d({ type: "move", dir: "right" })}>{">"}</button>
          <div className="tok-btn-empty" />
          <button className="tok-btn" onClick={() => d({ type: "move", dir: "down" })}>v</button>
          <div className="tok-btn-empty" />
        </div>
      )}

      <div className="tok-legend">
        {[
          { type: "start" as CellType, label: "Start" },
          { type: "exit" as CellType, label: "Exit" },
          { type: "treasure" as CellType, label: "Gold" },
          { type: "trap" as CellType, label: "Trap" },
          { type: "monster" as CellType, label: "Monster" },
          { type: "shrine" as CellType, label: "Heal" },
        ].map(l => (
          <div key={l.type} className="tok-legend-item">
            <div className={`tok-legend-dot tok-cell-${l.type}`} />
            <span>{cellEmoji(l.type)} {l.label}</span>
          </div>
        ))}
      </div>

      {state.phase === "done" && <div className="tok-done">Escaped! Gold: {state.gold} | Score: {terminal?.score ?? 0}/100</div>}
      {state.phase === "dead" && <div className="tok-dead">Perished in the tomb. Gold: {state.gold} | Score: {terminal?.score ?? 0}/100</div>}

      <div className="tok-log">
        {[...state.log].reverse().slice(0, 5).map((l, i) => <div key={i} className="tok-log-line">{l}</div>)}
      </div>
    </div>
  );
}
