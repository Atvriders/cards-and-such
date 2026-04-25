import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { RobotArenaState, RobotArenaSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function RobotArenaGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<RobotArenaState, RobotArenaSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  function cellContent(r: number, c: number): string {
    if (state.player.row === r && state.player.col === c) return "🤖";
    const enemy = state.enemies.find(e => e.hp > 0 && e.row === r && e.col === c);
    if (enemy) return "👾";
    return "";
  }

  function cellClass(r: number, c: number): string {
    if (state.player.row === r && state.player.col === c) return "ra-cell player";
    if (state.enemies.some(e => e.hp > 0 && e.row === r && e.col === c)) return "ra-cell enemy";
    return "ra-cell";
  }

  return (
    <div className="ra-game">
      <div className="ra-title">Robot Arena</div>
      <div className="ra-stats">
        <span>HP: {"❤️".repeat(Math.max(0, state.player.hp))}</span>
        <span>Score: {state.score}</span>
        <span>Turn: {state.turn}</span>
      </div>
      <div className="ra-log">{state.log}</div>

      <div className="ra-grid" style={{ gridTemplateColumns: `repeat(${state.size}, 1fr)` }}>
        {Array.from({ length: state.size }, (_, r) =>
          Array.from({ length: state.size }, (_, c) => (
            <div key={`${r}-${c}`} className={cellClass(r, c)}>
              {cellContent(r, c)}
            </div>
          ))
        )}
      </div>

      {!state.over && (
        <div className="ra-controls">
          <div className="ra-dpad">
            <button className="ra-btn" onClick={() => dispatch({ type: "move", dr: -1, dc: 0 })}>▲</button>
            <div className="ra-dpad-row">
              <button className="ra-btn" onClick={() => dispatch({ type: "move", dr: 0, dc: -1 })}>◄</button>
              <button className="ra-btn ra-attack" onClick={() => dispatch({ type: "attack" })}>⚡</button>
              <button className="ra-btn" onClick={() => dispatch({ type: "move", dr: 0, dc: 1 })}>►</button>
            </div>
            <button className="ra-btn" onClick={() => dispatch({ type: "move", dr: 1, dc: 0 })}>▼</button>
          </div>
          <div className="ra-hint">Arrows: move · ⚡: attack adjacent enemy</div>
        </div>
      )}

      {state.over && (
        <div className={`ra-result ${state.won ? "won" : "lost"}`}>
          {state.won ? "Victory!" : "Defeated!"} Final Score: {terminal?.score}
        </div>
      )}
    </div>
  );
}
